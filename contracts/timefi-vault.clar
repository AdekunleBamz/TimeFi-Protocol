(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INACTIVE (err u102))
(define-constant ERR_AMOUNT (err u103))
(define-constant ERR_LOCK_PERIOD (err u104))
(define-constant ERR_ALREADY (err u105))
(define-constant ERR_BOT (err u106))

(define-constant MIN_DEPOSIT u10000)
(define-constant MIN_LOCK u3600)
(define-constant MAX_LOCK u31536000)
(define-constant FEE_BPS u50)

(define-data-var treasury principal tx-sender)
(define-data-var vault-nonce uint u0)
(define-data-var tvl uint u0)
(define-data-var fees uint u0)

(define-private (current-time-secs)
  (unwrap-panic (get-stacks-block-info? time (- stacks-block-height u1))))

(define-map vaults
  uint
  {
    owner: principal,
    amount: uint,
    lock-time: uint,
    unlock-time: uint,
    active: bool
  })

(define-map approved-bots
  (buff 32)
  bool)

(define-constant DEPLOYER tx-sender)

;; -------------------------------------------------------
;; HELPER: check if sender is an approved bot
;; -------------------------------------------------------

(define-read-only (is-bot (sender principal))
  (match (contract-hash? sender)
    h
      (default-to false (map-get? approved-bots h))
    hash-err false))

;; -------------------------------------------------------
;; PUBLIC: APPROVE BOT
;; -------------------------------------------------------

(define-public (approve-bot (bot principal))
  (match (contract-hash? bot)
    h
      (begin
        (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
        (map-set approved-bots h true)
        (ok true)
      )
    hash-err ERR_BOT))

;; -------------------------------------------------------
;; PUBLIC: CREATE VAULT
;; -------------------------------------------------------

(define-public (create-vault (amount uint) (lock-secs uint))
  (let (
    (id (+ (var-get vault-nonce) u1))
    ;; Calculate 0.5% fee (FEE_BPS = 50)
    (fee (/ (* amount FEE_BPS) u10000))
    (deposit (- amount fee))
    ;; Unlock height is calculated as current block time + lock seconds
    (unlock (+ lock-secs (current-time-secs)))
  )
    (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)
    (asserts! (>= lock-secs MIN_LOCK) ERR_LOCK_PERIOD)
    (asserts! (<= lock-secs MAX_LOCK) ERR_LOCK_PERIOD)

    ;; transfers
    (try! (stx-transfer? deposit tx-sender DEPLOYER))
    (try! (stx-transfer? fee tx-sender (var-get treasury)))

    ;; save vault
    (map-set vaults id
      {
        owner: tx-sender,
        amount: deposit,
        lock-time: (current-time-secs),
        unlock-time: unlock,
        active: true
      }
    )

    (var-set vault-nonce id)
    (var-set tvl (+ (var-get tvl) deposit))
    (var-set fees (+ (var-get fees) fee))

    (print {event: "create", id: id, owner: tx-sender, amount: deposit, unlock: unlock})
    (ok id)))

;; -------------------------------------------------------
;; READ: GET VAULT
;; -------------------------------------------------------

(define-read-only (get-vault (id uint))
  (match (map-get? vaults id)
    v (ok v)
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: WITHDRAW
;; -------------------------------------------------------

(define-public (withdraw (id uint))
  (match (map-get? vaults id)
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (>= (current-time-secs) (get unlock-time vault)) ERR_LOCK_PERIOD)

        ;; mark inactive
        (map-set vaults id
          {
            owner: (get owner vault),
            amount: u0,
            lock-time: (get lock-time vault),
            unlock-time: (get unlock-time vault),
            active: false
          }
        )

        ;; transfer funds
        (try! (stx-transfer? (get amount vault) DEPLOYER tx-sender))

        (var-set tvl (- (var-get tvl) (get amount vault)))

        (print {event: "withdraw", id: id, owner: tx-sender})
        (ok true)
      )
    ERR_NOT_FOUND))

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
      (let ((now (current-time-secs))
            (unlock (get unlock-time vault)))
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
      (ok (and (get active vault) (>= (current-time-secs) (get unlock-time vault))))
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
    (print {event: "treasury-updated", new: new-treasury})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REVOKE BOT APPROVAL
;; -------------------------------------------------------

(define-public (revoke-bot (bot principal))
  (match (contract-hash? bot)
    h
      (begin
        (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
        (map-set approved-bots h false)
        (print {event: "bot-revoked", bot: bot})
        (ok true)
      )
    hash-err ERR_BOT))
