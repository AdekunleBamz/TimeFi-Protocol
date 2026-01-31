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

(define-map vaults
  ((id uint))
  ((owner principal) (amount uint) (lock-time uint) (unlock-time uint) (active bool)))

(define-map approved-bots
  ((hash (buff 32)))
  ((approved bool)))

(define-constant DEPLOYER tx-sender)

;; ---------------------------------------------------
;; HELPER: check if sender is an approved bot
;; ---------------------------------------------------

(define-read-only (is-bot (sender principal))
  (match (contract-hash? sender)
    h
      (default-to false (get approved (map-get? approved-bots {hash: h})))
    err false))

;; ---------------------------------------------------
;; PUBLIC: APPROVE BOT
;; ---------------------------------------------------

(define-public (approve-bot (bot principal))
  (match (contract-hash? bot)
    h
      (begin
        (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
        (map-set approved-bots {hash: h} {approved: true})
        (ok true)
      )
    err ERR_BOT))

;; ---------------------------------------------------
;; PUBLIC: CREATE VAULT
;; ---------------------------------------------------

(define-public (create-vault (amount uint) (lock-secs uint))
  (let (
    (id (+ (var-get vault-nonce) u1))
    (fee (/ (* amount FEE_BPS) u10000))
    (deposit (- amount fee))
    (unlock (+ lock-secs (stacks-block-time)))
  )
    (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)
    (asserts! (>= lock-secs MIN_LOCK) ERR_LOCK_PERIOD)
    (asserts! (<= lock-secs MAX_LOCK) ERR_LOCK_PERIOD)

    ;; transfers
    (try! (stx-transfer? deposit tx-sender (as-contract tx-sender)))
    (try! (stx-transfer? fee tx-sender (var-get treasury)))

    ;; save vault
    (map-set vaults {id: id}
      {
        owner: tx-sender,
        amount: deposit,
        lock-time: (stacks-block-time),
        unlock-time: unlock,
        active: true
      }
    )

    (var-set vault-nonce id)
    (var-set tvl (+ (var-get tvl) deposit))
    (var-set fees (+ (var-get fees) fee))

    (print {event: "create", id: id, owner: tx-sender, amount: deposit, unlock: unlock})
    (ok id)))

;; ---------------------------------------------------
;; READ: GET VAULT
;; ---------------------------------------------------

(define-read-only (get-vault (id uint))
  (match (map-get? vaults {id: id})
    v (ok v)
    err ERR_NOT_FOUND))

;; ---------------------------------------------------
;; PUBLIC: WITHDRAW
;; ---------------------------------------------------

(define-public (withdraw (id uint))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (>= (stacks-block-time) (get unlock-time vault)) ERR_LOCK_PERIOD)

        ;; mark inactive
        (map-set vaults {id: id}
          {
            owner: (get owner vault),
            amount: 0,
            lock-time: (get lock-time vault),
            unlock-time: (get unlock-time vault),
            active: false
          }
        )

        ;; transfer funds
        (try! (stx-transfer? (get amount vault) (as-contract tx-sender) tx-sender))

        (var-set tvl (- (var-get tvl) (get amount vault)))

        (print {event: "withdraw", id: id, owner: tx-sender})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; ---------------------------------------------------
;; READ: IS-ACTIVE
;; ---------------------------------------------------

(define-read-only (is-active (id uint))
  (match (map-get? vaults {id: id})
    v (ok (get active v))
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET TIME REMAINING UNTIL UNLOCK
;; -------------------------------------------------------

(define-read-only (get-time-remaining (id uint))
  (match (map-get? vaults {id: id})
    vault
      (let ((now (stacks-block-time))
            (unlock (get unlock-time vault)))
        (if (>= now unlock)
          (ok u0)
          (ok (- unlock now))))
    ERR_NOT_FOUND))
