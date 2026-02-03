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

(define-data-var treasury principal tx-sender)
(define-data-var vault-nonce uint u0)
(define-data-var tvl uint u0)
(define-data-var fees uint u0)
(define-data-var protocol-paused bool false)

(define-map vaults
  ((id uint))
  ((owner principal) (amount uint) (lock-time uint) (unlock-time uint) (active bool) (beneficiary (optional principal))))

(define-map approved-bots
  ((hash (buff 32)))
  ((approved bool)))

(define-map approved-bots-by-principal
  ((bot principal))
  ((approved bool)))

(define-map pending-transfers
  ((id uint))
  ((new-owner principal)))

(define-constant DEPLOYER tx-sender)

;; -------------------------------------------------------
;; HELPER: check if sender is an approved bot
;; -------------------------------------------------------

(define-read-only (is-bot (sender principal))
  (default-to false (get approved (map-get? approved-bots-by-principal {bot: sender}))))

;; -------------------------------------------------------
;; PUBLIC: APPROVE BOT
;; -------------------------------------------------------

(define-public (approve-bot (bot principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (map-set approved-bots-by-principal {bot: bot} {approved: true})
    (print {event: "bot-approved", bot: bot})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: CREATE VAULT
;; -------------------------------------------------------

(define-public (create-vault (amount uint) (lock-secs uint))
  (let (
    (id (+ (var-get vault-nonce) u1))
    (fee (/ (* amount FEE_BPS) u10000))
    (deposit (- amount fee))
    (unlock (+ lock-secs tenure-height))
  )
    (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
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
        lock-time: tenure-height,
        unlock-time: unlock,
        active: true,
        beneficiary: none
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
  (match (map-get? vaults {id: id})
    v (ok v)
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: WITHDRAW
;; -------------------------------------------------------

(define-public (withdraw (id uint))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (>= tenure-height (get unlock-time vault)) ERR_LOCK_PERIOD)

        ;; mark inactive
        (map-set vaults {id: id}
          {
            owner: (get owner vault),
            amount: u0,
            lock-time: (get lock-time vault),
            unlock-time: (get unlock-time vault),
            active: false,
            beneficiary: none
          }
        )

        ;; transfer funds
        (try! (stx-transfer? (get amount vault) (as-contract tx-sender) tx-sender))

        (var-set tvl (- (var-get tvl) (get amount vault)))

        (print {event: "withdraw", id: id, owner: tx-sender})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: IS-ACTIVE
;; -------------------------------------------------------

(define-read-only (is-active (id uint))
  (match (map-get? vaults {id: id})
    v (ok (get active v))
    err ERR_NOT_FOUND))

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
  (match (map-get? vaults {id: id})
    vault
      (let ((now tenure-height)
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
  (match (map-get? vaults {id: id})
    vault
      (ok (and (get active vault) (>= tenure-height (get unlock-time vault))))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: CHECK IF VAULT BELONGS TO OWNER
;; -------------------------------------------------------

(define-read-only (is-vault-owner (id uint) (owner principal))
  (match (map-get? vaults {id: id})
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
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (map-set approved-bots-by-principal {bot: bot} {approved: false})
    (print {event: "bot-revoked", bot: bot})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: TOP-UP VAULT (add more STX to existing vault)
;; -------------------------------------------------------

(define-public (top-up-vault (id uint) (amount uint))
  (match (map-get? vaults {id: id})
    vault
      (let (
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit (- amount fee))
      )
        (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)

        ;; transfers
        (try! (stx-transfer? deposit tx-sender (as-contract tx-sender)))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))

        ;; update vault
        (map-set vaults {id: id}
          (merge vault {amount: (+ (get amount vault) deposit)})
        )

        (var-set tvl (+ (var-get tvl) deposit))
        (var-set fees (+ (var-get fees) fee))

        (print {event: "top-up", id: id, added: deposit, new-total: (+ (get amount vault) deposit)})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: EXTEND LOCK DURATION
;; -------------------------------------------------------

(define-public (extend-lock (id uint) (additional-secs uint))
  (match (map-get? vaults {id: id})
    vault
      (let (
        (new-unlock (+ (get unlock-time vault) additional-secs))
        (total-lock (- new-unlock (get lock-time vault)))
      )
        (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (> additional-secs u0) ERR_LOCK_PERIOD)
        (asserts! (<= total-lock MAX_LOCK) ERR_LOCK_PERIOD)

        ;; update vault
        (map-set vaults {id: id}
          (merge vault {unlock-time: new-unlock})
        )

        (print {event: "extend-lock", id: id, new-unlock: new-unlock})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: SET BENEFICIARY (heir/delegate for vault)
;; -------------------------------------------------------

(define-public (set-beneficiary (id uint) (beneficiary principal))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (not (is-eq beneficiary tx-sender)) ERR_SAME_OWNER)

        ;; update vault
        (map-set vaults {id: id}
          (merge vault {beneficiary: (some beneficiary)})
        )

        (print {event: "beneficiary-set", id: id, beneficiary: beneficiary})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: REMOVE BENEFICIARY
;; -------------------------------------------------------

(define-public (remove-beneficiary (id uint))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)

        ;; update vault
        (map-set vaults {id: id}
          (merge vault {beneficiary: none})
        )

        (print {event: "beneficiary-removed", id: id})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: CLAIM AS BENEFICIARY (after 90 days past unlock)
;; -------------------------------------------------------

(define-constant BENEFICIARY_CLAIM_DELAY u12960) ;; 90 days (~12960 blocks)

(define-public (claim-as-beneficiary (id uint))
  (match (map-get? vaults {id: id})
    vault
      (let (
        (beneficiary-opt (get beneficiary vault))
      )
        (asserts! (not (var-get protocol-paused)) ERR_PAUSED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (is-some beneficiary-opt) ERR_NO_BENEFICIARY)
        (asserts! (is-eq tx-sender (unwrap-panic beneficiary-opt)) ERR_UNAUTHORIZED)
        ;; Can only claim 90 days after unlock time
        (asserts! (>= tenure-height (+ (get unlock-time vault) BENEFICIARY_CLAIM_DELAY)) ERR_LOCK_PERIOD)

        ;; mark inactive
        (map-set vaults {id: id}
          (merge vault {amount: u0, active: false, beneficiary: none})
        )

        ;; transfer funds to beneficiary
        (try! (stx-transfer? (get amount vault) (as-contract tx-sender) tx-sender))

        (var-set tvl (- (var-get tvl) (get amount vault)))

        (print {event: "beneficiary-claim", id: id, beneficiary: tx-sender, amount: (get amount vault)})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: INITIATE VAULT TRANSFER
;; -------------------------------------------------------

(define-public (initiate-transfer (id uint) (new-owner principal))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active vault) ERR_INACTIVE)
        (asserts! (not (is-eq new-owner tx-sender)) ERR_SAME_OWNER)

        (map-set pending-transfers {id: id} {new-owner: new-owner})

        (print {event: "transfer-initiated", id: id, from: tx-sender, to: new-owner})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: ACCEPT VAULT TRANSFER
;; -------------------------------------------------------

(define-public (accept-transfer (id uint))
  (match (map-get? vaults {id: id})
    vault
      (match (map-get? pending-transfers {id: id})
        transfer
          (begin
            (asserts! (is-eq tx-sender (get new-owner transfer)) ERR_UNAUTHORIZED)
            (asserts! (get active vault) ERR_INACTIVE)

            ;; update vault owner
            (map-set vaults {id: id}
              (merge vault {owner: tx-sender})
            )

            ;; clear pending transfer
            (map-delete pending-transfers {id: id})

            (print {event: "transfer-accepted", id: id, new-owner: tx-sender})
            (ok true)
          )
        err ERR_NOT_FOUND)
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; PUBLIC: CANCEL VAULT TRANSFER
;; -------------------------------------------------------

(define-public (cancel-transfer (id uint))
  (match (map-get? vaults {id: id})
    vault
      (begin
        (asserts! (is-eq (get owner vault) tx-sender) ERR_UNAUTHORIZED)
        (map-delete pending-transfers {id: id})
        (print {event: "transfer-cancelled", id: id})
        (ok true)
      )
    err ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET PENDING TRANSFER
;; -------------------------------------------------------

(define-read-only (get-pending-transfer (id uint))
  (map-get? pending-transfers {id: id}))

;; -------------------------------------------------------
;; READ: GET BENEFICIARY
;; -------------------------------------------------------

(define-read-only (get-beneficiary (id uint))
  (match (map-get? vaults {id: id})
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
    (print {event: "protocol-paused"})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: UNPAUSE PROTOCOL (admin only)
;; -------------------------------------------------------

(define-public (unpause-protocol)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set protocol-paused false)
    (print {event: "protocol-unpaused"})
    (ok true)))
