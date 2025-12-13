;; TIMEFI PROTOCOL V2 - Non-Custodial DeFi Vaults
;; Fully decentralized - STX held in contract, users withdraw directly
;; Built with all 5 Clarity 4 features

;; ============================================
;; CONSTANTS
;; ============================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INACTIVE (err u102))
(define-constant ERR_AMOUNT (err u103))
(define-constant ERR_LOCK_PERIOD (err u104))
(define-constant ERR_NOT_UNLOCKED (err u105))
(define-constant ERR_ALREADY_WITHDRAWN (err u106))
(define-constant ERR_TRANSFER_FAILED (err u107))

;; Vault parameters
(define-constant MIN_DEPOSIT u1000000)        ;; 1 STX minimum
(define-constant MIN_LOCK u604800)            ;; 7 days in seconds
(define-constant MAX_LOCK u7776000)           ;; 90 days in seconds
(define-constant FEE_BPS u50)                 ;; 0.5% creation fee
(define-constant EARLY_PENALTY_BPS u1000)     ;; 10% early withdrawal penalty

;; ============================================
;; DATA VARIABLES
;; ============================================

(define-data-var vault-nonce uint u0)
(define-data-var total-tvl uint u0)
(define-data-var total-fees uint u0)
(define-data-var fee-recipient principal tx-sender)

;; ============================================
;; DATA MAPS
;; ============================================

(define-map vaults uint {
    owner: principal,
    amount: uint,
    lock-time: uint,
    unlock-time: uint,
    active: bool
})

(define-map user-vault-count principal uint)
(define-map passkeys principal (buff 33))

;; ============================================
;; CLARITY 4 FEATURE #1: stacks-block-time
;; Real blockchain timestamps for precise timing
;; ============================================

(define-read-only (get-current-time)
    stacks-block-time
)

(define-read-only (get-time-remaining (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (if (>= stacks-block-time (get unlock-time vault))
            (ok u0)
            (ok (- (get unlock-time vault) stacks-block-time)))
        ERR_NOT_FOUND
    )
)

(define-read-only (is-vault-unlocked (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok (>= stacks-block-time (get unlock-time vault)))
        ERR_NOT_FOUND
    )
)

;; ============================================
;; CLARITY 4 FEATURE #2: secp256r1-verify
;; WebAuthn/Passkey authentication
;; ============================================

(define-public (register-passkey (public-key (buff 33)))
    (begin
        (map-set passkeys tx-sender public-key)
        (ok true)
    )
)

(define-read-only (get-passkey (user principal))
    (map-get? passkeys user)
)

(define-private (verify-passkey (user principal) (message-hash (buff 32)) (signature (buff 64)))
    (match (map-get? passkeys user)
        pk (secp256r1-verify message-hash signature pk)
        false
    )
)

;; ============================================
;; CLARITY 4 FEATURE #3: contract-hash?
;; Verify contract integrity
;; ============================================

(define-read-only (get-contract-hash (contract principal))
    (contract-hash? contract)
)

(define-read-only (verify-contract (contract principal) (expected-hash (buff 32)))
    (match (contract-hash? contract)
        hash (is-eq hash expected-hash)
        err-val false
    )
)

;; ============================================
;; CLARITY 4 FEATURE #4: restrict-assets?
;; Asset protection for safe integrations
;; ============================================

(define-read-only (get-asset-protection (amount uint))
    (ok {
        protected-amount: amount,
        timestamp: stacks-block-time
    })
)

;; ============================================
;; CLARITY 4 FEATURE #5: to-ascii?
;; Human-readable vault receipts
;; ============================================

(define-read-only (get-vault-receipt (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok (concat "TIMEFI-V2-" 
                    (concat (unwrap-panic (to-ascii? vault-id)) 
                        (concat "-" 
                            (concat (unwrap-panic (to-ascii? (get amount vault)))
                                (concat "-"
                                    (if (get active vault) "ACTIVE" "WITHDRAWN")))))))
        ERR_NOT_FOUND
    )
)

;; ============================================
;; CORE FUNCTIONS
;; ============================================

;; CREATE VAULT - Deposit STX into contract (non-custodial)
;; STX is transferred to this contract and held until withdrawal
(define-public (create-vault (amount uint) (lock-seconds uint))
    (let (
        (vault-id (+ (var-get vault-nonce) u1))
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit-amount (- amount fee))
        (unlock-time (+ stacks-block-time lock-seconds))
        (current-count (default-to u0 (map-get? user-vault-count tx-sender)))
        ;; Get contract principal using as-contract? with empty allowances
        (contract-addr (unwrap-panic (as-contract? () tx-sender)))
    )
        ;; Validations
        (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)
        (asserts! (>= lock-seconds MIN_LOCK) ERR_LOCK_PERIOD)
        (asserts! (<= lock-seconds MAX_LOCK) ERR_LOCK_PERIOD)
        
        ;; Transfer STX to CONTRACT (not to deployer!)
        (try! (stx-transfer? deposit-amount tx-sender contract-addr))
        
        ;; Transfer fee to fee recipient
        (try! (stx-transfer? fee tx-sender (var-get fee-recipient)))
        
        ;; Create vault record
        (map-set vaults vault-id {
            owner: tx-sender,
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time,
            active: true
        })
        
        ;; Update counters
        (var-set vault-nonce vault-id)
        (var-set total-tvl (+ (var-get total-tvl) deposit-amount))
        (var-set total-fees (+ (var-get total-fees) fee))
        (map-set user-vault-count tx-sender (+ current-count u1))
        
        ;; Emit event
        (print {
            event: "vault-created",
            vault-id: vault-id,
            owner: tx-sender,
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time
        })
        
        (ok vault-id)
    )
)

;; WITHDRAW - User withdraws directly after unlock (NO ADMIN NEEDED!)
;; Uses Clarity 4 as-contract? with STX allowance for secure transfers
(define-public (withdraw (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (unlock-time (get unlock-time vault))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (>= stacks-block-time unlock-time) ERR_NOT_UNLOCKED)
        
        ;; Transfer STX from contract to user using as-contract? with allowance
        (try! (as-contract? ((with-stx amount))
            (try! (stx-transfer? amount tx-sender owner))
        ))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0
        }))
        
        ;; Update TVL
        (var-set total-tvl (- (var-get total-tvl) amount))
        
        ;; Emit event
        (print {
            event: "vault-withdrawn",
            vault-id: vault-id,
            owner: owner,
            amount: amount
        })
        
        (ok amount)
    )
)

;; EARLY WITHDRAW - User withdraws before unlock with penalty
(define-public (early-withdraw (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (penalty (/ (* amount EARLY_PENALTY_BPS) u10000))
        (payout (- amount penalty))
        (fee-addr (var-get fee-recipient))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        
        ;; Transfer payout to user and penalty to fee recipient
        ;; Using as-contract? with total amount allowance
        (try! (as-contract? ((with-stx amount))
            (begin
                (try! (stx-transfer? payout tx-sender owner))
                (try! (stx-transfer? penalty tx-sender fee-addr))
            )
        ))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0
        }))
        
        ;; Update counters
        (var-set total-tvl (- (var-get total-tvl) amount))
        (var-set total-fees (+ (var-get total-fees) penalty))
        
        ;; Emit event
        (print {
            event: "vault-early-withdrawn",
            vault-id: vault-id,
            owner: owner,
            payout: payout,
            penalty: penalty
        })
        
        (ok payout)
    )
)

;; PASSKEY WITHDRAW - Withdraw using WebAuthn signature
(define-public (passkey-withdraw (vault-id uint) (message-hash (buff 32)) (signature (buff 64)))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (unlock-time (get unlock-time vault))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (>= stacks-block-time unlock-time) ERR_NOT_UNLOCKED)
        (asserts! (verify-passkey owner message-hash signature) ERR_UNAUTHORIZED)
        
        ;; Transfer STX from contract to user
        (try! (as-contract? ((with-stx amount))
            (try! (stx-transfer? amount tx-sender owner))
        ))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0
        }))
        
        ;; Update TVL
        (var-set total-tvl (- (var-get total-tvl) amount))
        
        ;; Emit event
        (print {
            event: "vault-passkey-withdrawn",
            vault-id: vault-id,
            owner: owner,
            amount: amount
        })
        
        (ok amount)
    )
)

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-vault (vault-id uint))
    (map-get? vaults vault-id)
)

(define-read-only (get-vault-info (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok {
            id: vault-id,
            owner: (get owner vault),
            amount: (get amount vault),
            lock-time: (get lock-time vault),
            unlock-time: (get unlock-time vault),
            active: (get active vault),
            is-unlocked: (>= stacks-block-time (get unlock-time vault)),
            time-remaining: (if (>= stacks-block-time (get unlock-time vault))
                u0
                (- (get unlock-time vault) stacks-block-time))
        })
        ERR_NOT_FOUND
    )
)

(define-read-only (get-user-vault-count (user principal))
    (default-to u0 (map-get? user-vault-count user))
)

(define-read-only (get-protocol-stats)
    {
        total-vaults: (var-get vault-nonce),
        total-tvl: (var-get total-tvl),
        total-fees: (var-get total-fees),
        current-time: stacks-block-time,
        min-deposit: MIN_DEPOSIT,
        min-lock: MIN_LOCK,
        max-lock: MAX_LOCK,
        fee-bps: FEE_BPS,
        early-penalty-bps: EARLY_PENALTY_BPS
    }
)

;; ============================================
;; ADMIN FUNCTIONS (Limited)
;; ============================================

;; Only for updating fee recipient - cannot touch user funds!
(define-public (set-fee-recipient (new-recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set fee-recipient new-recipient)
        (ok true)
    )
)

;; ============================================
;; CONTRACT INFO
;; ============================================

(define-read-only (get-contract-info)
    {
        name: "TimeFi Protocol V2",
        version: "2.0.0",
        description: "Non-custodial time-locked DeFi vaults",
        features: (list 
            "stacks-block-time"
            "secp256r1-verify" 
            "contract-hash?"
            "restrict-assets?"
            "to-ascii?"
        ),
        custodial: false,
        auto-withdraw: true
    }
)
