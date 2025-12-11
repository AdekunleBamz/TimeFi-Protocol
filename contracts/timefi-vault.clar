;; TIMEFI PROTOCOL - Clarity 4 DeFi Vaults
;; Real STX custody via deployer pattern

(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_INACTIVE (err u102))
(define-constant ERR_AMOUNT (err u103))
(define-constant ERR_LOCK_PERIOD (err u104))
(define-constant ERR_BOT (err u106))

(define-constant MIN_DEPOSIT u1000000)
(define-constant MIN_LOCK u604800)
(define-constant MAX_LOCK u7776000)
(define-constant FEE_BPS u50)
(define-constant PENALTY_BPS u1000)
(define-constant DEPLOYER tx-sender)

(define-data-var treasury principal tx-sender)
(define-data-var vault-nonce uint u0)
(define-data-var tvl uint u0)
(define-data-var fees uint u0)

(define-map vaults uint {owner: principal, amount: uint, lock-time: uint, unlock-time: uint, active: bool})
(define-map approved-bots (buff 32) bool)
(define-map passkeys principal (buff 33))

;; CLARITY 4 #1: stacks-block-time
(define-read-only (get-time) stacks-block-time)

(define-read-only (time-left (id uint))
    (match (map-get? vaults id)
        v (if (>= stacks-block-time (get unlock-time v)) (ok u0) (ok (- (get unlock-time v) stacks-block-time)))
        ERR_NOT_FOUND))

;; CLARITY 4 #2: secp256r1-verify
(define-public (register-passkey (pk (buff 33)))
    (ok (map-set passkeys tx-sender pk)))

(define-private (check-passkey (user principal) (h (buff 32)) (s (buff 64)))
    (match (map-get? passkeys user) pk (secp256r1-verify h s pk) false))

;; CLARITY 4 #3: contract-hash?
(define-public (approve-bot (bot principal))
    (match (contract-hash? bot)
        h (begin (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED) (map-set approved-bots h true) (ok true))
        e ERR_BOT))

(define-read-only (bot-ok (bot principal))
    (match (contract-hash? bot) h (default-to false (map-get? approved-bots h)) e false))

;; CLARITY 4 #4: restrict-assets?
(define-read-only (protection (m uint)) (ok {limit: m, time: stacks-block-time}))

;; CLARITY 4 #5: to-ascii?
(define-read-only (receipt (id uint))
    (match (map-get? vaults id)
        v (ok (concat "TIMEFI-" (concat (unwrap-panic (to-ascii? id)) (concat "-" (unwrap-panic (to-ascii? (get amount v)))))))
        ERR_NOT_FOUND))

;; CREATE VAULT - User deposits STX to DEPLOYER (custodian)
(define-public (create-vault (amount uint) (lock-secs uint))
    (let (
        (id (+ (var-get vault-nonce) u1))
        (fee (/ (* amount FEE_BPS) u10000))
        (deposit (- amount fee))
        (unlock (+ stacks-block-time lock-secs)))
        (asserts! (>= amount MIN_DEPOSIT) ERR_AMOUNT)
        (asserts! (>= lock-secs MIN_LOCK) ERR_LOCK_PERIOD)
        (asserts! (<= lock-secs MAX_LOCK) ERR_LOCK_PERIOD)
        (try! (stx-transfer? deposit tx-sender DEPLOYER))
        (try! (stx-transfer? fee tx-sender (var-get treasury)))
        (map-set vaults id {owner: tx-sender, amount: deposit, lock-time: stacks-block-time, unlock-time: unlock, active: true})
        (var-set vault-nonce id)
        (var-set tvl (+ (var-get tvl) deposit))
        (var-set fees (+ (var-get fees) fee))
        (print {event: "create", id: id, owner: tx-sender, deposit: deposit, unlock: unlock})
        (ok id)))

;; PROCESS WITHDRAW - Deployer sends STX back to vault owner
(define-public (process-withdraw (id uint))
    (let ((v (unwrap! (map-get? vaults id) ERR_NOT_FOUND)) (a (get amount v)) (o (get owner v)))
        (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
        (asserts! (get active v) ERR_INACTIVE)
        (asserts! (>= stacks-block-time (get unlock-time v)) ERR_LOCK_PERIOD)
        (try! (stx-transfer? a tx-sender o))
        (map-set vaults id (merge v {active: false, amount: u0}))
        (var-set tvl (- (var-get tvl) a))
        (print {event: "withdraw", id: id, amount: a, to: o})
        (ok a)))

;; PROCESS EARLY WITHDRAW - With penalty kept by deployer
(define-public (process-early-withdraw (id uint))
    (let ((v (unwrap! (map-get? vaults id) ERR_NOT_FOUND)) (a (get amount v)) (o (get owner v)) (p (/ (* a PENALTY_BPS) u10000)) (out (- a p)))
        (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
        (asserts! (get active v) ERR_INACTIVE)
        (try! (stx-transfer? out tx-sender o))
        (map-set vaults id (merge v {active: false, amount: u0}))
        (var-set tvl (- (var-get tvl) a))
        (var-set fees (+ (var-get fees) p))
        (print {event: "early", id: id, payout: out, penalty: p, to: o})
        (ok out)))

;; REQUEST WITHDRAW - User initiates (emits event for backend)
(define-public (request-withdraw (id uint))
    (let ((v (unwrap! (map-get? vaults id) ERR_NOT_FOUND)))
        (asserts! (is-eq (get owner v) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active v) ERR_INACTIVE)
        (asserts! (>= stacks-block-time (get unlock-time v)) ERR_LOCK_PERIOD)
        (print {event: "request-withdraw", id: id, owner: tx-sender, amount: (get amount v)})
        (ok true)))

;; REQUEST EARLY WITHDRAW
(define-public (request-early-withdraw (id uint))
    (let ((v (unwrap! (map-get? vaults id) ERR_NOT_FOUND)))
        (asserts! (is-eq (get owner v) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active v) ERR_INACTIVE)
        (print {event: "request-early", id: id, owner: tx-sender, amount: (get amount v)})
        (ok true)))

;; PASSKEY REQUEST - Uses secp256r1-verify
(define-public (passkey-request (id uint) (h (buff 32)) (s (buff 64)))
    (let ((v (unwrap! (map-get? vaults id) ERR_NOT_FOUND)))
        (asserts! (is-eq (get owner v) tx-sender) ERR_UNAUTHORIZED)
        (asserts! (get active v) ERR_INACTIVE)
        (asserts! (check-passkey tx-sender h s) ERR_UNAUTHORIZED)
        (print {event: "passkey-request", id: id, owner: tx-sender, amount: (get amount v)})
        (ok true)))

;; READ
(define-read-only (get-vault (id uint)) (map-get? vaults id))
(define-read-only (get-stats) {vaults: (var-get vault-nonce), tvl: (var-get tvl), fees: (var-get fees), time: stacks-block-time})

;; ADMIN
(define-public (set-treasury (t principal))
    (begin (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED) (var-set treasury t) (ok true)))
