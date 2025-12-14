;; DIAMOND HANDS PROTOCOL V3 - Lock. Earn. Prove Your Commitment.
;; Non-Custodial DeFi Vaults with Points System
;; Supports STX and sBTC
;; Built with Clarity 4

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
(define-constant ERR_INVALID_NAME (err u108))
(define-constant ERR_INVALID_ASSET (err u109))

;; Vault parameters
(define-constant MIN_STX_DEPOSIT u1000000)        ;; 1 STX minimum
(define-constant MIN_SBTC_DEPOSIT u10000)         ;; 0.0001 sBTC minimum (8 decimals)
(define-constant MIN_LOCK u604800)                ;; 7 days in seconds
(define-constant MAX_LOCK u7776000)               ;; 90 days in seconds
(define-constant FEE_BPS u25)                     ;; 0.25% creation fee (reduced!)
(define-constant EARLY_PENALTY_BPS u1000)         ;; 10% early withdrawal penalty

;; Points multipliers (basis points, 10000 = 1x)
(define-constant POINTS_MULT_7_DAYS u10000)       ;; 1x for 7-29 days
(define-constant POINTS_MULT_30_DAYS u15000)      ;; 1.5x for 30-59 days
(define-constant POINTS_MULT_60_DAYS u20000)      ;; 2x for 60-89 days
(define-constant POINTS_MULT_90_DAYS u30000)      ;; 3x for 90 days

;; sBTC points bonus (10x because BTC is more valuable)
(define-constant SBTC_POINTS_MULTIPLIER u10)

;; Asset types
(define-constant ASSET_STX u1)
(define-constant ASSET_SBTC u2)

;; sBTC Contract Reference
;; For simnet/testnet: uses local mock contract
;; For mainnet: deploy with mainnet sBTC address (SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token)
(define-constant SBTC_CONTRACT .sbtc-token)

;; ============================================
;; DATA VARIABLES
;; ============================================

(define-data-var vault-nonce uint u0)
(define-data-var total-tvl-stx uint u0)
(define-data-var total-tvl-sbtc uint u0)
(define-data-var total-fees-stx uint u0)
(define-data-var total-fees-sbtc uint u0)
(define-data-var total-points uint u0)
(define-data-var fee-recipient principal tx-sender)

;; ============================================
;; DATA MAPS
;; ============================================

;; Main vault storage
(define-map vaults uint {
    owner: principal,
    name: (string-ascii 50),
    asset-type: uint,
    amount: uint,
    lock-time: uint,
    unlock-time: uint,
    points-earned: uint,
    active: bool
})

;; User stats
(define-map user-stats principal {
    total-vaults: uint,
    active-vaults: uint,
    total-points: uint,
    total-stx-locked: uint,
    total-sbtc-locked: uint
})

;; Leaderboard tracking (top point holders)
(define-map user-points principal uint)

;; Passkey storage for WebAuthn
(define-map passkeys principal (buff 33))

;; ============================================
;; POINTS CALCULATION
;; ============================================

;; Get points multiplier based on lock duration
(define-read-only (get-points-multiplier (lock-seconds uint))
    (if (>= lock-seconds u7776000)  ;; 90 days
        POINTS_MULT_90_DAYS
        (if (>= lock-seconds u5184000)  ;; 60 days
            POINTS_MULT_60_DAYS
            (if (>= lock-seconds u2592000)  ;; 30 days
                POINTS_MULT_30_DAYS
                POINTS_MULT_7_DAYS))))

;; Calculate points for a deposit
;; Formula: (amount / 1000000) * (lock_days) * multiplier / 10000
;; For sBTC: additional 10x multiplier
(define-read-only (calculate-points (amount uint) (lock-seconds uint) (asset-type uint))
    (let (
        (lock-days (/ lock-seconds u86400))
        (multiplier (get-points-multiplier lock-seconds))
        (base-points (/ (* (/ amount u1000000) (* lock-days multiplier)) u10000))
    )
        (if (is-eq asset-type ASSET_SBTC)
            (* base-points SBTC_POINTS_MULTIPLIER)
            base-points)))

;; ============================================
;; CLARITY 4: stacks-block-time
;; ============================================

(define-read-only (get-current-time)
    stacks-block-time)

(define-read-only (get-time-remaining (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (if (>= stacks-block-time (get unlock-time vault))
            (ok u0)
            (ok (- (get unlock-time vault) stacks-block-time)))
        ERR_NOT_FOUND))

(define-read-only (is-vault-unlocked (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok (>= stacks-block-time (get unlock-time vault)))
        ERR_NOT_FOUND))

;; ============================================
;; CLARITY 4: secp256r1-verify (Passkey)
;; ============================================

(define-public (register-passkey (public-key (buff 33)))
    (begin
        (map-set passkeys tx-sender public-key)
        (ok true)))

(define-read-only (get-passkey (user principal))
    (map-get? passkeys user))

(define-private (verify-passkey (user principal) (message-hash (buff 32)) (signature (buff 64)))
    (match (map-get? passkeys user)
        pk (secp256r1-verify message-hash signature pk)
        false))

;; ============================================
;; CLARITY 4: contract-hash?
;; ============================================

(define-read-only (get-contract-hash (contract principal))
    (contract-hash? contract))

(define-read-only (verify-contract (contract principal) (expected-hash (buff 32)))
    (match (contract-hash? contract)
        hash (is-eq hash expected-hash)
        err-val false))

;; ============================================
;; CLARITY 4: to-ascii? (Human-readable receipts)
;; ============================================

(define-read-only (get-vault-receipt (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok (concat "DIAMOND-V3-" 
                    (concat (unwrap-panic (to-ascii? vault-id)) 
                        (concat "-" 
                            (concat (get name vault)
                                (concat "-"
                                    (concat (unwrap-panic (to-ascii? (get points-earned vault)))
                                        (concat "pts-"
                                            (if (get active vault) "ACTIVE" "WITHDRAWN")))))))))
        ERR_NOT_FOUND))

;; ============================================
;; CORE FUNCTIONS - STX VAULTS
;; ============================================

;; CREATE STX VAULT with custom name
(define-public (create-stx-vault (amount uint) (lock-seconds uint) (vault-name (string-ascii 50)))
    (let (
        (vault-id (+ (var-get vault-nonce) u1))
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit-amount (- amount fee))
        (unlock-time (+ stacks-block-time lock-seconds))
        (points (calculate-points deposit-amount lock-seconds ASSET_STX))
        (current-stats (default-to 
            { total-vaults: u0, active-vaults: u0, total-points: u0, total-stx-locked: u0, total-sbtc-locked: u0 }
            (map-get? user-stats tx-sender)))
        (contract-addr (unwrap-panic (as-contract? () tx-sender)))
    )
        ;; Validations
        (asserts! (>= amount MIN_STX_DEPOSIT) ERR_AMOUNT)
        (asserts! (>= lock-seconds MIN_LOCK) ERR_LOCK_PERIOD)
        (asserts! (<= lock-seconds MAX_LOCK) ERR_LOCK_PERIOD)
        (asserts! (> (len vault-name) u0) ERR_INVALID_NAME)
        
        ;; Transfer STX to contract
        (try! (stx-transfer? deposit-amount tx-sender contract-addr))
        
        ;; Transfer fee to fee recipient
        (if (> fee u0)
            (try! (stx-transfer? fee tx-sender (var-get fee-recipient)))
            true)
        
        ;; Create vault record
        (map-set vaults vault-id {
            owner: tx-sender,
            name: vault-name,
            asset-type: ASSET_STX,
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time,
            points-earned: points,
            active: true
        })
        
        ;; Update user stats
        (map-set user-stats tx-sender {
            total-vaults: (+ (get total-vaults current-stats) u1),
            active-vaults: (+ (get active-vaults current-stats) u1),
            total-points: (+ (get total-points current-stats) points),
            total-stx-locked: (+ (get total-stx-locked current-stats) deposit-amount),
            total-sbtc-locked: (get total-sbtc-locked current-stats)
        })
        
        ;; Update user points map
        (map-set user-points tx-sender 
            (+ (default-to u0 (map-get? user-points tx-sender)) points))
        
        ;; Update global counters
        (var-set vault-nonce vault-id)
        (var-set total-tvl-stx (+ (var-get total-tvl-stx) deposit-amount))
        (var-set total-fees-stx (+ (var-get total-fees-stx) fee))
        (var-set total-points (+ (var-get total-points) points))
        
        ;; Emit event
        (print {
            event: "vault-created",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: tx-sender,
            name: vault-name,
            asset: "STX",
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time,
            points-earned: points
        })
        
        (ok vault-id)))

;; WITHDRAW STX - Direct to user wallet
(define-public (withdraw-stx (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (unlock-time (get unlock-time vault))
        (current-stats (unwrap! (map-get? user-stats owner) ERR_NOT_FOUND))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (is-eq (get asset-type vault) ASSET_STX) ERR_INVALID_ASSET)
        (asserts! (>= stacks-block-time unlock-time) ERR_NOT_UNLOCKED)
        
        ;; Transfer STX to user
        (try! (as-contract? ((with-stx amount))
            (try! (stx-transfer? amount tx-sender owner))))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0
        }))
        
        ;; Update user stats
        (map-set user-stats owner (merge current-stats {
            active-vaults: (- (get active-vaults current-stats) u1)
        }))
        
        ;; Update TVL
        (var-set total-tvl-stx (- (var-get total-tvl-stx) amount))
        
        ;; Emit event
        (print {
            event: "vault-withdrawn",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: owner,
            name: (get name vault),
            asset: "STX",
            amount: amount,
            points-retained: (get points-earned vault)
        })
        
        (ok amount)))

;; EARLY WITHDRAW STX - With 10% penalty
(define-public (early-withdraw-stx (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (penalty (/ (* amount EARLY_PENALTY_BPS) u10000))
        (payout (- amount penalty))
        (fee-addr (var-get fee-recipient))
        (current-stats (unwrap! (map-get? user-stats owner) ERR_NOT_FOUND))
        ;; Forfeit 50% of points on early withdrawal
        (points-forfeited (/ (get points-earned vault) u2))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (is-eq (get asset-type vault) ASSET_STX) ERR_INVALID_ASSET)
        
        ;; Transfer payout to user and penalty to fee recipient
        (try! (as-contract? ((with-stx amount))
            (begin
                (try! (stx-transfer? payout tx-sender owner))
                (try! (stx-transfer? penalty tx-sender fee-addr)))))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0,
            points-earned: (- (get points-earned vault) points-forfeited)
        }))
        
        ;; Update user stats (reduce points)
        (map-set user-stats owner (merge current-stats {
            active-vaults: (- (get active-vaults current-stats) u1),
            total-points: (- (get total-points current-stats) points-forfeited)
        }))
        
        ;; Update user points map
        (map-set user-points owner 
            (- (default-to u0 (map-get? user-points owner)) points-forfeited))
        
        ;; Update counters
        (var-set total-tvl-stx (- (var-get total-tvl-stx) amount))
        (var-set total-fees-stx (+ (var-get total-fees-stx) penalty))
        (var-set total-points (- (var-get total-points) points-forfeited))
        
        ;; Emit event
        (print {
            event: "vault-early-withdrawn",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: owner,
            name: (get name vault),
            asset: "STX",
            payout: payout,
            penalty: penalty,
            points-forfeited: points-forfeited
        })
        
        (ok payout)))

;; ============================================
;; CORE FUNCTIONS - sBTC VAULTS
;; ============================================

;; CREATE sBTC VAULT with custom name
;; Note: User must approve sBTC transfer first
(define-public (create-sbtc-vault (amount uint) (lock-seconds uint) (vault-name (string-ascii 50)))
    (let (
        (vault-id (+ (var-get vault-nonce) u1))
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit-amount (- amount fee))
        (unlock-time (+ stacks-block-time lock-seconds))
        (points (calculate-points deposit-amount lock-seconds ASSET_SBTC))
        (current-stats (default-to 
            { total-vaults: u0, active-vaults: u0, total-points: u0, total-stx-locked: u0, total-sbtc-locked: u0 }
            (map-get? user-stats tx-sender)))
        (contract-addr (unwrap-panic (as-contract? () tx-sender)))
    )
        ;; Validations
        (asserts! (>= amount MIN_SBTC_DEPOSIT) ERR_AMOUNT)
        (asserts! (>= lock-seconds MIN_LOCK) ERR_LOCK_PERIOD)
        (asserts! (<= lock-seconds MAX_LOCK) ERR_LOCK_PERIOD)
        (asserts! (> (len vault-name) u0) ERR_INVALID_NAME)
        
        ;; Transfer sBTC to contract (SIP-010 ft-transfer)
        (try! (contract-call? SBTC_CONTRACT transfer deposit-amount tx-sender contract-addr none))
        
        ;; Transfer fee to fee recipient
        (if (> fee u0)
            (try! (contract-call? SBTC_CONTRACT transfer fee tx-sender (var-get fee-recipient) none))
            true)
        
        ;; Create vault record
        (map-set vaults vault-id {
            owner: tx-sender,
            name: vault-name,
            asset-type: ASSET_SBTC,
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time,
            points-earned: points,
            active: true
        })
        
        ;; Update user stats
        (map-set user-stats tx-sender {
            total-vaults: (+ (get total-vaults current-stats) u1),
            active-vaults: (+ (get active-vaults current-stats) u1),
            total-points: (+ (get total-points current-stats) points),
            total-stx-locked: (get total-stx-locked current-stats),
            total-sbtc-locked: (+ (get total-sbtc-locked current-stats) deposit-amount)
        })
        
        ;; Update user points map
        (map-set user-points tx-sender 
            (+ (default-to u0 (map-get? user-points tx-sender)) points))
        
        ;; Update global counters
        (var-set vault-nonce vault-id)
        (var-set total-tvl-sbtc (+ (var-get total-tvl-sbtc) deposit-amount))
        (var-set total-fees-sbtc (+ (var-get total-fees-sbtc) fee))
        (var-set total-points (+ (var-get total-points) points))
        
        ;; Emit event
        (print {
            event: "vault-created",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: tx-sender,
            name: vault-name,
            asset: "sBTC",
            amount: deposit-amount,
            lock-time: stacks-block-time,
            unlock-time: unlock-time,
            points-earned: points
        })
        
        (ok vault-id)))

;; WITHDRAW sBTC - Direct to user wallet
(define-public (withdraw-sbtc (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (unlock-time (get unlock-time vault))
        (current-stats (unwrap! (map-get? user-stats owner) ERR_NOT_FOUND))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (is-eq (get asset-type vault) ASSET_SBTC) ERR_INVALID_ASSET)
        (asserts! (>= stacks-block-time unlock-time) ERR_NOT_UNLOCKED)
        
        ;; Transfer sBTC to user - the FT contract handles authorization
        (try! (as-contract? ()
            (try! (contract-call? SBTC_CONTRACT transfer amount tx-sender owner none))))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0
        }))
        
        ;; Update user stats
        (map-set user-stats owner (merge current-stats {
            active-vaults: (- (get active-vaults current-stats) u1)
        }))
        
        ;; Update TVL
        (var-set total-tvl-sbtc (- (var-get total-tvl-sbtc) amount))
        
        ;; Emit event
        (print {
            event: "vault-withdrawn",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: owner,
            name: (get name vault),
            asset: "sBTC",
            amount: amount,
            points-retained: (get points-earned vault)
        })
        
        (ok amount)))

;; EARLY WITHDRAW sBTC - With 10% penalty
(define-public (early-withdraw-sbtc (vault-id uint))
    (let (
        (vault (unwrap! (map-get? vaults vault-id) ERR_NOT_FOUND))
        (owner (get owner vault))
        (amount (get amount vault))
        (penalty (/ (* amount EARLY_PENALTY_BPS) u10000))
        (payout (- amount penalty))
        (fee-addr (var-get fee-recipient))
        (current-stats (unwrap! (map-get? user-stats owner) ERR_NOT_FOUND))
        (points-forfeited (/ (get points-earned vault) u2))
    )
        ;; Validations
        (asserts! (is-eq tx-sender owner) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_ALREADY_WITHDRAWN)
        (asserts! (is-eq (get asset-type vault) ASSET_SBTC) ERR_INVALID_ASSET)
        
        ;; Transfer sBTC - payout to user, penalty to fee recipient
        (try! (as-contract? ()
            (begin
                (unwrap-panic (contract-call? SBTC_CONTRACT transfer payout tx-sender owner none))
                (try! (contract-call? SBTC_CONTRACT transfer penalty tx-sender fee-addr none)))))
        
        ;; Update vault status
        (map-set vaults vault-id (merge vault {
            active: false,
            amount: u0,
            points-earned: (- (get points-earned vault) points-forfeited)
        }))
        
        ;; Update user stats
        (map-set user-stats owner (merge current-stats {
            active-vaults: (- (get active-vaults current-stats) u1),
            total-points: (- (get total-points current-stats) points-forfeited)
        }))
        
        ;; Update user points map
        (map-set user-points owner 
            (- (default-to u0 (map-get? user-points owner)) points-forfeited))
        
        ;; Update counters
        (var-set total-tvl-sbtc (- (var-get total-tvl-sbtc) amount))
        (var-set total-fees-sbtc (+ (var-get total-fees-sbtc) penalty))
        (var-set total-points (- (var-get total-points) points-forfeited))
        
        ;; Emit event
        (print {
            event: "vault-early-withdrawn",
            protocol: "diamond-hands-v3",
            vault-id: vault-id,
            owner: owner,
            name: (get name vault),
            asset: "sBTC",
            payout: payout,
            penalty: penalty,
            points-forfeited: points-forfeited
        })
        
        (ok payout)))

;; ============================================
;; READ-ONLY FUNCTIONS
;; ============================================

(define-read-only (get-vault (vault-id uint))
    (map-get? vaults vault-id))

(define-read-only (get-vault-info (vault-id uint))
    (match (map-get? vaults vault-id)
        vault (ok {
            id: vault-id,
            owner: (get owner vault),
            name: (get name vault),
            asset-type: (get asset-type vault),
            asset-name: (if (is-eq (get asset-type vault) ASSET_STX) "STX" "sBTC"),
            amount: (get amount vault),
            lock-time: (get lock-time vault),
            unlock-time: (get unlock-time vault),
            points-earned: (get points-earned vault),
            active: (get active vault),
            is-unlocked: (>= stacks-block-time (get unlock-time vault)),
            time-remaining: (if (>= stacks-block-time (get unlock-time vault))
                u0
                (- (get unlock-time vault) stacks-block-time))
        })
        ERR_NOT_FOUND))

(define-read-only (get-user-stats (user principal))
    (default-to 
        { total-vaults: u0, active-vaults: u0, total-points: u0, total-stx-locked: u0, total-sbtc-locked: u0 }
        (map-get? user-stats user)))

(define-read-only (get-user-points (user principal))
    (default-to u0 (map-get? user-points user)))

(define-read-only (get-protocol-stats)
    {
        total-vaults: (var-get vault-nonce),
        total-tvl-stx: (var-get total-tvl-stx),
        total-tvl-sbtc: (var-get total-tvl-sbtc),
        total-fees-stx: (var-get total-fees-stx),
        total-fees-sbtc: (var-get total-fees-sbtc),
        total-points: (var-get total-points),
        current-time: stacks-block-time,
        min-stx-deposit: MIN_STX_DEPOSIT,
        min-sbtc-deposit: MIN_SBTC_DEPOSIT,
        min-lock: MIN_LOCK,
        max-lock: MAX_LOCK,
        fee-bps: FEE_BPS,
        early-penalty-bps: EARLY_PENALTY_BPS
    })

;; Points estimation for UI
(define-read-only (estimate-points (amount uint) (lock-seconds uint) (asset-type uint))
    (let (
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit-amount (- amount fee))
    )
        {
            deposit-after-fee: deposit-amount,
            fee: fee,
            points: (calculate-points deposit-amount lock-seconds asset-type),
            multiplier: (get-points-multiplier lock-seconds)
        }))

;; Get tier based on lock duration
(define-read-only (get-tier-name (lock-seconds uint))
    (if (>= lock-seconds u7776000)
        "DIAMOND"
        (if (>= lock-seconds u5184000)
            "GOLD"
            (if (>= lock-seconds u2592000)
                "SILVER"
                "BRONZE"))))

;; ============================================
;; ADMIN FUNCTIONS (Limited)
;; ============================================

(define-public (set-fee-recipient (new-recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
        (var-set fee-recipient new-recipient)
        (ok true)))

;; ============================================
;; CONTRACT INFO
;; ============================================

(define-read-only (get-contract-info)
    {
        name: "Diamond Hands Protocol",
        version: "3.0.0",
        description: "Lock. Earn. Prove your commitment.",
        tagline: "Non-custodial time-locked vaults with points rewards",
        features: (list 
            "vault-naming"
            "points-system"
            "stx-vaults"
            "sbtc-vaults"
            "stacks-block-time"
            "secp256r1-verify" 
            "contract-hash?"
            "to-ascii?"
        ),
        points-tiers: (list
            "BRONZE: 7-29 days (1x)"
            "SILVER: 30-59 days (1.5x)"
            "GOLD: 60-89 days (2x)"
            "DIAMOND: 90 days (3x)"
        ),
        custodial: false,
        auto-withdraw: true
    })

