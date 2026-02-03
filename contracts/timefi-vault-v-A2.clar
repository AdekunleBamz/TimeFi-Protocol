;; -------------------------------------------------------
;; TimeFi Vault Contract v-A2
;; Custodian pattern - DEPLOYER holds STX
;; Fixed for Clarity 4
;; -------------------------------------------------------

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INACTIVE (err u102))
(define-constant ERR_AMOUNT (err u103))
(define-constant ERR_LOCK_PERIOD (err u104))
(define-constant ERR_ALREADY (err u105))
(define-constant ERR_BOT (err u106))
(define-constant ERR_NO_BENEFICIARY (err u107))
(define-constant ERR_SAME_OWNER (err u108))
(define-constant ERR_PAUSED (err u109))

(define-constant MIN_DEPOSIT u10000)
;; Lock periods in blocks (1 block ~ 10 minutes)
(define-constant MIN_LOCK u6)          ;; ~1 hour (6 blocks)
(define-constant MAX_LOCK u52560)      ;; ~1 year (52560 blocks)
(define-constant FEE_BPS u50)
(define-constant BENEFICIARY_CLAIM_DELAY u12960) ;; 90 days (~12960 blocks)

(define-constant DEPLOYER tx-sender)

(define-data-var treasury principal tx-sender)
(define-data-var vault-nonce uint u0)
(define-data-var tvl uint u0)
(define-data-var fees uint u0)
(define-data-var protocol-paused bool false)

(define-map vaults
  uint
  {
    owner: principal,
    amount: uint,
    lock-time: uint,
    unlock-time: uint,
    active: bool,
    beneficiary: (optional principal)
  })

(define-map approved-bots-by-principal
  principal
  bool)

(define-map pending-transfers
  uint
  principal)

;; -------------------------------------------------------
;; HELPER: check if sender is an approved bot
;; -------------------------------------------------------

(define-read-only (is-bot (sender principal))
  (default-to false (map-get? approved-bots-by-principal sender)))

;; -------------------------------------------------------
;; PUBLIC: APPROVE BOT (admin only)
;; -------------------------------------------------------

(define-public (approve-bot (bot principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (map-set approved-bots-by-principal bot true)
    (print { event: "bot-approved", bot: bot })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REVOKE BOT APPROVAL (admin only)
;; -------------------------------------------------------

(define-public (revoke-bot (bot principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (map-set approved-bots-by-principal bot false)
    (print { event: "bot-revoked", bot: bot })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: CREATE VAULT
;; User deposits STX to DEPLOYER (custodian pattern)
;; -------------------------------------------------------

(define-public (create-vault (amount uint) (lock-blocks uint))
  (let (
    (id (+ (var-get vault-nonce) u1))
    (fee (/ (* amount FEE_BPS) u10000))
    (deposit (- amount fee))
    (unlock (+ lock-blocks tenure-height))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
    (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)
    (asserts! (>= lock-blocks MIN_LOCK) ERR_LOCK_PERIOD)
    (asserts! (<= lock-blocks MAX_LOCK) ERR_LOCK_PERIOD)

    ;; Transfer deposit to DEPLOYER (custodian)
    (try! (stx-transfer? deposit tx-sender DEPLOYER))
    ;; Transfer fee to treasury
    (try! (stx-transfer? fee tx-sender (var-get treasury)))

    ;; save vault
    (map-set vaults id
      {
        owner: tx-sender,
        amount: deposit,
        lock-time: tenure-height,
        unlock-time: unlock,
        active: true,
        beneficiary: none
      })

    (var-set vault-nonce id)
    (var-set tvl (+ (var-get tvl) deposit))
    (var-set fees (+ (var-get fees) fee))

    (print { event: "create", id: id, owner: tx-sender, amount: deposit, unlock: unlock })
    (ok id)))

;; -------------------------------------------------------
;; READ: GET VAULT
;; -------------------------------------------------------

(define-read-only (get-vault (id uint))
  (match (map-get? vaults id)
    v (ok v)
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: PROCESS WITHDRAW (deployer sends STX to owner)
;; -------------------------------------------------------

(define-public (process-withdraw (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (vault-amount (get amount vault))
    (owner (get owner vault))
  )
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (>= tenure-height (get unlock-time vault)) ERR_LOCK_PERIOD)

    ;; mark inactive
    (map-set vaults id
      (merge vault { amount: u0, active: false }))

    ;; DEPLOYER sends funds to owner
    (try! (stx-transfer? vault-amount tx-sender owner))

    (var-set tvl (- (var-get tvl) vault-amount))

    (print { event: "withdraw", id: id, owner: owner, amount: vault-amount })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REQUEST WITHDRAW (user initiates, deployer processes)
;; -------------------------------------------------------

(define-public (request-withdraw (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (>= tenure-height (get unlock-time vault)) ERR_LOCK_PERIOD)

    (print { event: "withdraw-requested", id: id, owner: tx-sender, amount: (get amount vault) })
    (ok true)))

;; -------------------------------------------------------
;; READ: IS-ACTIVE
;; -------------------------------------------------------

(define-read-only (is-active (id uint))
  (match (map-get? vaults id)
    v (ok (get active v))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET TVL (Total Value Locked)
;; -------------------------------------------------------

(define-read-only (get-tvl)
  (ok (var-get tvl)))

;; -------------------------------------------------------
;; READ: GET TOTAL FEES COLLECTED
;; -------------------------------------------------------

(define-read-only (get-total-fees)
  (ok (var-get fees)))

;; -------------------------------------------------------
;; READ: GET VAULT COUNT
;; -------------------------------------------------------

(define-read-only (get-vault-count)
  (ok (var-get vault-nonce)))

;; -------------------------------------------------------
;; READ: GET TIME REMAINING UNTIL UNLOCK
;; -------------------------------------------------------

(define-read-only (get-time-remaining (id uint))
  (match (map-get? vaults id)
    vault
      (let (
        (now tenure-height)
        (unlock (get unlock-time vault))
      )
        (if (>= now unlock)
          (ok u0)
          (ok (- unlock now))))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET TREASURY ADDRESS
;; -------------------------------------------------------

(define-read-only (get-treasury)
  (ok (var-get treasury)))

;; -------------------------------------------------------
;; READ: CHECK IF VAULT CAN BE WITHDRAWN
;; -------------------------------------------------------

(define-read-only (can-withdraw (id uint))
  (match (map-get? vaults id)
    vault
      (ok (and (get active vault) (>= tenure-height (get unlock-time vault))))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: CHECK IF VAULT BELONGS TO OWNER
;; -------------------------------------------------------

(define-read-only (is-vault-owner (id uint) (owner principal))
  (match (map-get? vaults id)
    vault (ok (is-eq (get owner vault) owner))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET PROTOCOL CONSTANTS
;; -------------------------------------------------------

(define-read-only (get-min-deposit)
  MIN_DEPOSIT)

(define-read-only (get-min-lock)
  MIN_LOCK)

(define-read-only (get-max-lock)
  MAX_LOCK)

(define-read-only (get-fee-bps)
  FEE_BPS)

;; -------------------------------------------------------
;; READ: CALCULATE FEE FOR AMOUNT
;; -------------------------------------------------------

(define-read-only (calculate-fee (amount uint))
  (ok (/ (* amount FEE_BPS) u10000)))

(define-read-only (calculate-deposit-after-fee (amount uint))
  (let ((fee (/ (* amount FEE_BPS) u10000)))
    (ok (- amount fee))))

;; -------------------------------------------------------
;; PUBLIC: SET TREASURY (admin only)
;; -------------------------------------------------------

(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set treasury new-treasury)
    (print { event: "treasury-updated", new: new-treasury })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: TOP-UP VAULT (add more STX to existing vault)
;; -------------------------------------------------------

(define-public (top-up-vault (id uint) (amount uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (fee (/ (* amount FEE_BPS) u10000))
    (deposit (- amount fee))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)

    ;; Transfer to DEPLOYER
    (try! (stx-transfer? deposit tx-sender DEPLOYER))
    (try! (stx-transfer? fee tx-sender (var-get treasury)))

    ;; update vault
    (map-set vaults id
      (merge vault { amount: (+ (get amount vault) deposit) }))

    (var-set tvl (+ (var-get tvl) deposit))
    (var-set fees (+ (var-get fees) fee))

    (print { event: "top-up", id: id, added: deposit, new-total: (+ (get amount vault) deposit) })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: EXTEND LOCK DURATION
;; -------------------------------------------------------

(define-public (extend-lock (id uint) (additional-blocks uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (new-unlock (+ (get unlock-time vault) additional-blocks))
    (total-lock (- new-unlock (get lock-time vault)))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (> additional-blocks u0) ERR_LOCK_PERIOD)
    (asserts! (<= total-lock MAX_LOCK) ERR_LOCK_PERIOD)

    ;; update vault
    (map-set vaults id
      (merge vault { unlock-time: new-unlock }))

    (print { event: "extend-lock", id: id, new-unlock: new-unlock })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: SET BENEFICIARY (heir/delegate for vault)
;; -------------------------------------------------------

(define-public (set-beneficiary (id uint) (beneficiary principal))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (not (is-eq beneficiary tx-sender)) ERR_SAME_OWNER)

    ;; update vault
    (map-set vaults id
      (merge vault { beneficiary: (some beneficiary) }))

    (print { event: "beneficiary-set", id: id, beneficiary: beneficiary })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REMOVE BENEFICIARY
;; -------------------------------------------------------

(define-public (remove-beneficiary (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)

    ;; update vault
    (map-set vaults id
      (merge vault { beneficiary: none }))

    (print { event: "beneficiary-removed", id: id })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: PROCESS BENEFICIARY CLAIM (deployer processes)
;; -------------------------------------------------------

(define-public (process-beneficiary-claim (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (beneficiary-opt (get beneficiary vault))
    (vault-amount (get amount vault))
    (beneficiary (unwrap! beneficiary-opt ERR_NO_BENEFICIARY))
  )
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    ;; Can only claim 90 days after unlock time
    (asserts! (>= tenure-height (+ (get unlock-time vault) BENEFICIARY_CLAIM_DELAY)) ERR_LOCK_PERIOD)

    ;; mark inactive
    (map-set vaults id
      (merge vault { amount: u0, active: false, beneficiary: none }))

    ;; DEPLOYER sends funds to beneficiary
    (try! (stx-transfer? vault-amount tx-sender beneficiary))

    (var-set tvl (- (var-get tvl) vault-amount))

    (print { event: "beneficiary-claim", id: id, beneficiary: beneficiary, amount: vault-amount })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REQUEST BENEFICIARY CLAIM (beneficiary initiates)
;; -------------------------------------------------------

(define-public (request-beneficiary-claim (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (beneficiary-opt (get beneficiary vault))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (is-some beneficiary-opt) ERR_NO_BENEFICIARY)
    (asserts! (is-eq tx-sender (unwrap-panic beneficiary-opt)) ERR_UNAUTHORIZED)
    (asserts! (>= tenure-height (+ (get unlock-time vault) BENEFICIARY_CLAIM_DELAY)) ERR_LOCK_PERIOD)

    (print { event: "beneficiary-claim-requested", id: id, beneficiary: tx-sender, amount: (get amount vault) })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: INITIATE VAULT TRANSFER
;; -------------------------------------------------------

(define-public (initiate-transfer (id uint) (new-owner principal))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)
    (asserts! (not (is-eq new-owner tx-sender)) ERR_SAME_OWNER)

    (map-set pending-transfers id new-owner)

    (print { event: "transfer-initiated", id: id, from: tx-sender, to: new-owner })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: ACCEPT VAULT TRANSFER
;; -------------------------------------------------------

(define-public (accept-transfer (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
    (new-owner (unwrap! (map-get? pending-transfers id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender new-owner) ERR_UNAUTHORIZED)
    (asserts! (get active vault) ERR_INACTIVE)

    ;; update vault owner
    (map-set vaults id
      (merge vault { owner: tx-sender }))

    ;; clear pending transfer
    (map-delete pending-transfers id)

    (print { event: "transfer-accepted", id: id, new-owner: tx-sender })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: CANCEL VAULT TRANSFER
;; -------------------------------------------------------

(define-public (cancel-transfer (id uint))
  (let (
    (vault (unwrap! (map-get? vaults id) ERR_NOT_FOUND))
  )
    (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
    (map-delete pending-transfers id)
    (print { event: "transfer-cancelled", id: id })
    (ok true)))

;; -------------------------------------------------------
;; READ: GET PENDING TRANSFER
;; -------------------------------------------------------

(define-read-only (get-pending-transfer (id uint))
  (map-get? pending-transfers id))

;; -------------------------------------------------------
;; READ: GET BENEFICIARY
;; -------------------------------------------------------

(define-read-only (get-beneficiary (id uint))
  (match (map-get? vaults id)
    vault (ok (get beneficiary vault))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: IS PROTOCOL PAUSED
;; -------------------------------------------------------

(define-read-only (is-paused)
  (var-get protocol-paused))

;; -------------------------------------------------------
;; PUBLIC: PAUSE PROTOCOL (admin only)
;; -------------------------------------------------------

(define-public (pause-protocol)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set protocol-paused true)
    (print { event: "protocol-paused" })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: UNPAUSE PROTOCOL (admin only)
;; -------------------------------------------------------

(define-public (unpause-protocol)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set protocol-paused false)
    (print { event: "protocol-unpaused" })
    (ok true)))
