;; -------------------------------------------------------
;; TimeFi Governance Contract v-A2
;; Proposal system with time-weighted voting
;; -------------------------------------------------------

(define-constant ERR_UNAUTHORIZED (err u300))
(define-constant ERR_NOT_FOUND (err u301))
(define-constant ERR_ALREADY_VOTED (err u302))
(define-constant ERR_VOTING_CLOSED (err u303))
(define-constant ERR_NO_VOTING_POWER (err u304))
(define-constant ERR_PROPOSAL_ACTIVE (err u305))
(define-constant ERR_INVALID_ACTION (err u306))
(define-constant ERR_QUORUM_NOT_MET (err u307))
(define-constant ERR_COOLDOWN (err u308))

(define-constant DEPLOYER tx-sender)

;; Governance parameters (in blocks, 1 block ~ 10 min)
(define-constant VOTING_PERIOD u1008)          ;; 7 days (~1008 blocks)
(define-constant MIN_PROPOSAL_AMOUNT u1000000) ;; 1 STX minimum locked to propose
(define-constant QUORUM_BPS u1000)             ;; 10% of TVL must vote
(define-constant EXECUTION_DELAY u144)         ;; 24 hours (~144 blocks)

(define-data-var proposal-nonce uint u0)
(define-data-var governance-active bool true)

;; Proposal types
;; 1 = Change fee
;; 2 = Change treasury
;; 3 = Protocol upgrade
;; 4 = Emergency action

(define-map proposals
  { id: uint }
  {
    proposer: principal,
    title: (string-ascii 64),
    description: (string-ascii 256),
    proposal-type: uint,
    action-data: (buff 128),
    created-at: uint,
    voting-ends: uint,
    for-votes: uint,
    against-votes: uint,
    executed: bool,
    cancelled: bool
  })

(define-map votes
  { proposal-id: uint, voter: principal }
  { vote-power: uint, support: bool })

;; -------------------------------------------------------
;; READ: CALCULATE VOTING POWER
;; Time-weighted: longer locks = more power
;; Power = amount * (lock_duration / 30 days)
;; -------------------------------------------------------

(define-read-only (calculate-voting-power (vault-id uint))
  (let (
    (vault-result (contract-call? .timefi-vault-v-A2 get-vault vault-id))
  )
    (match vault-result
      vault
        (if (get active vault)
          (let (
            (lock-duration (- (get unlock-time vault) (get lock-time vault)))
            (base-power (get amount vault))
            ;; Multiplier: duration / 30 days (~4320 blocks), minimum 1x
            (multiplier (+ u1 (/ lock-duration u4320)))
          )
            (ok (* base-power multiplier)))
          (ok u0))
      error (ok u0))))

;; -------------------------------------------------------
;; READ: GET PROPOSAL
;; -------------------------------------------------------

(define-read-only (get-proposal (id uint))
  (match (map-get? proposals { id: id })
    p (ok p)
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET VOTE
;; -------------------------------------------------------

(define-read-only (get-vote (proposal-id uint) (voter principal))
  (map-get? votes { proposal-id: proposal-id, voter: voter }))

;; -------------------------------------------------------
;; READ: HAS VOTED
;; -------------------------------------------------------

(define-read-only (has-voted (proposal-id uint) (voter principal))
  (is-some (map-get? votes { proposal-id: proposal-id, voter: voter })))

;; -------------------------------------------------------
;; READ: GET PROPOSAL COUNT
;; -------------------------------------------------------

(define-read-only (get-proposal-count)
  (ok (var-get proposal-nonce)))

;; -------------------------------------------------------
;; READ: IS VOTING ACTIVE
;; -------------------------------------------------------

(define-read-only (is-voting-active (id uint))
  (match (map-get? proposals { id: id })
    p (ok (and
          (not (get executed p))
          (not (get cancelled p))
          (<= tenure-height (get voting-ends p))))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: CAN EXECUTE
;; -------------------------------------------------------

(define-read-only (can-execute (id uint))
  (match (map-get? proposals { id: id })
    p
      (let (
        (tvl-result (contract-call? .timefi-vault-v-A2 get-tvl))
        (tvl (unwrap! tvl-result (ok false)))
        (total-votes (+ (get for-votes p) (get against-votes p)))
        (quorum-needed (/ (* tvl QUORUM_BPS) u10000))
      )
        (ok (and
              (not (get executed p))
              (not (get cancelled p))
              (> tenure-height (get voting-ends p))
              (>= tenure-height (+ (get voting-ends p) EXECUTION_DELAY))
              (>= total-votes quorum-needed)
              (> (get for-votes p) (get against-votes p)))))
    ERR_NOT_FOUND))

;; -------------------------------------------------------
;; READ: GET GOVERNANCE STATUS
;; -------------------------------------------------------

(define-read-only (is-governance-active)
  (var-get governance-active))

;; -------------------------------------------------------
;; PUBLIC: CREATE PROPOSAL
;; -------------------------------------------------------

(define-public (create-proposal
    (vault-id uint)
    (title (string-ascii 64))
    (description (string-ascii 256))
    (proposal-type uint)
    (action-data (buff 128)))
  (let (
    (vault-data (unwrap! (contract-call? .timefi-vault-v-A2 get-vault vault-id) ERR_NOT_FOUND))
    (id (+ (var-get proposal-nonce) u1))
    (voting-power (unwrap! (calculate-voting-power vault-id) ERR_NO_VOTING_POWER))
  )
    (asserts! (var-get governance-active) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get owner vault-data) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault-data) ERR_NO_VOTING_POWER)
    (asserts! (>= (get amount vault-data) MIN_PROPOSAL_AMOUNT) ERR_NO_VOTING_POWER)
    (asserts! (and (>= proposal-type u1) (<= proposal-type u4)) ERR_INVALID_ACTION)

    (map-set proposals { id: id }
      {
        proposer: tx-sender,
        title: title,
        description: description,
        proposal-type: proposal-type,
        action-data: action-data,
        created-at: tenure-height,
        voting-ends: (+ tenure-height VOTING_PERIOD),
        for-votes: u0,
        against-votes: u0,
        executed: false,
        cancelled: false
      })

    (var-set proposal-nonce id)

    (print { event: "proposal-created", id: id, proposer: tx-sender, type: proposal-type, title: title })
    (ok id)))

;; -------------------------------------------------------
;; PUBLIC: CAST VOTE
;; -------------------------------------------------------

(define-public (cast-vote (proposal-id uint) (vault-id uint) (support bool))
  (let (
    (proposal (unwrap! (map-get? proposals { id: proposal-id }) ERR_NOT_FOUND))
    (vault-data (unwrap! (contract-call? .timefi-vault-v-A2 get-vault vault-id) ERR_NOT_FOUND))
    (voting-power (unwrap! (calculate-voting-power vault-id) ERR_NO_VOTING_POWER))
  )
    (asserts! (var-get governance-active) ERR_UNAUTHORIZED)
    (asserts! (is-eq (get owner vault-data) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault-data) ERR_NO_VOTING_POWER)
    (asserts! (> voting-power u0) ERR_NO_VOTING_POWER)
    (asserts! (not (has-voted proposal-id tx-sender)) ERR_ALREADY_VOTED)
    (asserts! (<= tenure-height (get voting-ends proposal)) ERR_VOTING_CLOSED)
    (asserts! (not (get executed proposal)) ERR_VOTING_CLOSED)
    (asserts! (not (get cancelled proposal)) ERR_VOTING_CLOSED)

    ;; Record vote
    (map-set votes { proposal-id: proposal-id, voter: tx-sender }
      { vote-power: voting-power, support: support })

    ;; Update proposal tallies
    (if support
      (map-set proposals { id: proposal-id }
        (merge proposal { for-votes: (+ (get for-votes proposal) voting-power) }))
      (map-set proposals { id: proposal-id }
        (merge proposal { against-votes: (+ (get against-votes proposal) voting-power) })))

    (print { event: "vote-cast", proposal-id: proposal-id, voter: tx-sender, support: support, power: voting-power })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: EXECUTE PROPOSAL (anyone can execute if passed)
;; -------------------------------------------------------

(define-public (execute-proposal (id uint))
  (let (
    (proposal (unwrap! (map-get? proposals { id: id }) ERR_NOT_FOUND))
    (tvl-result (unwrap! (contract-call? .timefi-vault-v-A2 get-tvl) ERR_UNAUTHORIZED))
    (total-votes (+ (get for-votes proposal) (get against-votes proposal)))
    (quorum-needed (/ (* tvl-result QUORUM_BPS) u10000))
  )
    (asserts! (not (get executed proposal)) ERR_PROPOSAL_ACTIVE)
    (asserts! (not (get cancelled proposal)) ERR_VOTING_CLOSED)
    (asserts! (> tenure-height (get voting-ends proposal)) ERR_VOTING_CLOSED)
    (asserts! (>= tenure-height (+ (get voting-ends proposal) EXECUTION_DELAY)) ERR_COOLDOWN)
    (asserts! (>= total-votes quorum-needed) ERR_QUORUM_NOT_MET)
    (asserts! (> (get for-votes proposal) (get against-votes proposal)) ERR_QUORUM_NOT_MET)

    ;; Mark as executed
    (map-set proposals { id: id }
      (merge proposal { executed: true }))

    (print { event: "proposal-executed", id: id, type: (get proposal-type proposal), for: (get for-votes proposal), against: (get against-votes proposal) })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: CANCEL PROPOSAL (proposer or admin only)
;; -------------------------------------------------------

(define-public (cancel-proposal (id uint))
  (let (
    (proposal (unwrap! (map-get? proposals { id: id }) ERR_NOT_FOUND))
  )
    (asserts! (or (is-eq tx-sender (get proposer proposal)) (is-eq tx-sender DEPLOYER)) ERR_UNAUTHORIZED)
    (asserts! (not (get executed proposal)) ERR_PROPOSAL_ACTIVE)

    (map-set proposals { id: id }
      (merge proposal { cancelled: true }))

    (print { event: "proposal-cancelled", id: id, by: tx-sender })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: PAUSE GOVERNANCE (admin only)
;; -------------------------------------------------------

(define-public (pause-governance)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set governance-active false)
    (print { event: "governance-paused" })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: UNPAUSE GOVERNANCE (admin only)
;; -------------------------------------------------------

(define-public (unpause-governance)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set governance-active true)
    (print { event: "governance-unpaused" })
    (ok true)))
