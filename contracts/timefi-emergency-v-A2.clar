;; -------------------------------------------------------
;; TimeFi Emergency Contract v-A2
;; Emergency withdrawals with penalty + Guardian system
;; -------------------------------------------------------

(define-constant ERR_UNAUTHORIZED (err u400))
(define-constant ERR_NOT_FOUND (err u401))
(define-constant ERR_ALREADY_WITHDRAWN (err u402))
(define-constant ERR_COOLDOWN (err u403))
(define-constant ERR_NOT_GUARDIAN (err u404))
(define-constant ERR_EMERGENCY_ACTIVE (err u405))
(define-constant ERR_NO_EMERGENCY (err u406))
(define-constant ERR_INSUFFICIENT (err u407))

(define-constant DEPLOYER tx-sender)

;; Emergency withdrawal penalty (25%)
(define-constant EMERGENCY_PENALTY_BPS u2500)

;; Cooldown between emergency withdrawals (in blocks, 1 block ~ 10 min)
(define-constant EMERGENCY_COOLDOWN u144)  ;; 24 hours (~144 blocks)

;; Guardian threshold for emergency actions
(define-constant GUARDIAN_THRESHOLD u2)  ;; Need 2 guardians to approve

(define-data-var emergency-mode bool false)
(define-data-var emergency-start uint u0)
(define-data-var penalty-collected uint u0)
(define-data-var guardian-count uint u0)

(define-map guardians
  { guardian: principal }
  { active: bool, added-at: uint })

(define-map user-emergency-cooldown
  { user: principal }
  { last-emergency: uint })

(define-map emergency-approvals
  { action-id: uint }
  { approvals: uint, executed: bool })

(define-map guardian-approval-votes
  { action-id: uint, guardian: principal }
  { approved: bool })

(define-data-var action-nonce uint u0)

;; -------------------------------------------------------
;; READ: GET EMERGENCY STATUS
;; -------------------------------------------------------

(define-read-only (is-emergency-mode)
  (var-get emergency-mode))

(define-read-only (get-emergency-start)
  (var-get emergency-start))

;; -------------------------------------------------------
;; READ: GET PENALTY INFO
;; -------------------------------------------------------

(define-read-only (get-penalty-bps)
  EMERGENCY_PENALTY_BPS)

(define-read-only (get-total-penalty-collected)
  (ok (var-get penalty-collected)))

;; -------------------------------------------------------
;; READ: CALCULATE EMERGENCY WITHDRAWAL AMOUNT
;; -------------------------------------------------------

(define-read-only (calculate-emergency-payout (vault-id uint))
  (let (
    (vault-result (contract-call? .timefi-vault-v-A2 get-vault vault-id))
  )
    (match vault-result
      vault
        (let (
          (amount (get amount vault))
          (penalty (/ (* amount EMERGENCY_PENALTY_BPS) u10000))
          (payout (- amount penalty))
        )
          (ok { payout: payout, penalty: penalty, original: amount }))
      error ERR_NOT_FOUND)))

;; -------------------------------------------------------
;; READ: CHECK IF USER CAN EMERGENCY WITHDRAW
;; -------------------------------------------------------

(define-read-only (can-emergency-withdraw (user principal))
  (let (
    (cooldown-data (map-get? user-emergency-cooldown { user: user }))
  )
    (match cooldown-data
      cd (ok (>= tenure-height (+ (get last-emergency cd) EMERGENCY_COOLDOWN)))
      (ok true))))  ;; No previous emergency = allowed

;; -------------------------------------------------------
;; READ: IS GUARDIAN
;; -------------------------------------------------------

(define-read-only (is-guardian (addr principal))
  (default-to false (get active (map-get? guardians { guardian: addr }))))

;; -------------------------------------------------------
;; READ: GET GUARDIAN COUNT
;; -------------------------------------------------------

(define-read-only (get-guardian-count)
  (ok (var-get guardian-count)))

;; -------------------------------------------------------
;; READ: GET ACTION APPROVALS
;; -------------------------------------------------------

(define-read-only (get-action-approvals (action-id uint))
  (default-to { approvals: u0, executed: false }
    (map-get? emergency-approvals { action-id: action-id })))

;; -------------------------------------------------------
;; PUBLIC: ADD GUARDIAN (admin only)
;; -------------------------------------------------------

(define-public (add-guardian (guardian principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (not (is-guardian guardian)) ERR_UNAUTHORIZED)
    
    (map-set guardians { guardian: guardian }
      { active: true, added-at: tenure-height })
    
    (var-set guardian-count (+ (var-get guardian-count) u1))
    
    (print { event: "guardian-added", guardian: guardian })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REMOVE GUARDIAN (admin only)
;; -------------------------------------------------------

(define-public (remove-guardian (guardian principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (is-guardian guardian) ERR_NOT_GUARDIAN)
    
    (map-set guardians { guardian: guardian }
      { active: false, added-at: u0 })
    
    (var-set guardian-count (- (var-get guardian-count) u1))
    
    (print { event: "guardian-removed", guardian: guardian })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: INITIATE EMERGENCY MODE (guardian multisig)
;; -------------------------------------------------------

(define-public (initiate-emergency)
  (let (
    (action-id (+ (var-get action-nonce) u1))
  )
    (asserts! (is-guardian tx-sender) ERR_NOT_GUARDIAN)
    (asserts! (not (var-get emergency-mode)) ERR_EMERGENCY_ACTIVE)
    
    ;; Create new action
    (map-set emergency-approvals { action-id: action-id }
      { approvals: u1, executed: false })
    
    (map-set guardian-approval-votes { action-id: action-id, guardian: tx-sender }
      { approved: true })
    
    (var-set action-nonce action-id)
    
    (print { event: "emergency-initiated", action-id: action-id, initiator: tx-sender })
    (ok action-id)))

;; -------------------------------------------------------
;; PUBLIC: APPROVE EMERGENCY (guardian)
;; -------------------------------------------------------

(define-public (approve-emergency (action-id uint))
  (let (
    (approval-data (get-action-approvals action-id))
    (has-voted (default-to { approved: false }
                 (map-get? guardian-approval-votes { action-id: action-id, guardian: tx-sender })))
  )
    (asserts! (is-guardian tx-sender) ERR_NOT_GUARDIAN)
    (asserts! (not (var-get emergency-mode)) ERR_EMERGENCY_ACTIVE)
    (asserts! (not (get approved has-voted)) ERR_UNAUTHORIZED)
    (asserts! (not (get executed approval-data)) ERR_ALREADY_WITHDRAWN)
    
    (let (
      (new-approvals (+ (get approvals approval-data) u1))
    )
      ;; Record vote
      (map-set guardian-approval-votes { action-id: action-id, guardian: tx-sender }
        { approved: true })
      
      (map-set emergency-approvals { action-id: action-id }
        { approvals: new-approvals, executed: (get executed approval-data) })
      
      ;; Check threshold
      (if (>= new-approvals GUARDIAN_THRESHOLD)
        (begin
          (var-set emergency-mode true)
          (var-set emergency-start tenure-height)
          (map-set emergency-approvals { action-id: action-id }
            { approvals: new-approvals, executed: true })
          (print { event: "emergency-activated", action-id: action-id, approvals: new-approvals })
          (ok true))
        (begin
          (print { event: "emergency-approved", action-id: action-id, guardian: tx-sender, approvals: new-approvals })
          (ok true))))))

;; -------------------------------------------------------
;; PUBLIC: DEACTIVATE EMERGENCY (admin only)
;; -------------------------------------------------------

(define-public (deactivate-emergency)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (var-get emergency-mode) ERR_NO_EMERGENCY)
    
    (var-set emergency-mode false)
    (var-set emergency-start u0)
    
    (print { event: "emergency-deactivated" })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: EMERGENCY WITHDRAW REQUEST (tracks intent)
;; Note: Actual withdrawal must be done through vault contract
;; This contract tracks penalties and cooldowns
;; -------------------------------------------------------

(define-public (request-emergency-withdraw (vault-id uint))
  (let (
    (vault-data (unwrap! (contract-call? .timefi-vault-v-A2 get-vault vault-id) ERR_NOT_FOUND))
    (amount (get amount vault-data))
    (penalty (/ (* amount EMERGENCY_PENALTY_BPS) u10000))
    (payout (- amount penalty))
    (can-withdraw (unwrap! (can-emergency-withdraw tx-sender) ERR_COOLDOWN))
  )
    (asserts! (is-eq (get owner vault-data) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault-data) ERR_ALREADY_WITHDRAWN)
    (asserts! can-withdraw ERR_COOLDOWN)
    (asserts! (> amount u0) ERR_INSUFFICIENT)
    
    ;; Record cooldown
    (map-set user-emergency-cooldown { user: tx-sender }
      { last-emergency: tenure-height })
    
    ;; Track penalty
    (if (not (var-get emergency-mode))
      (var-set penalty-collected (+ (var-get penalty-collected) penalty))
      true)
    
    (print { 
      event: "emergency-withdraw-request", 
      vault-id: vault-id, 
      user: tx-sender, 
      amount: amount, 
      penalty: (if (var-get emergency-mode) u0 penalty),
      payout: (if (var-get emergency-mode) amount payout),
      mode: (if (var-get emergency-mode) "emergency" "penalty")
    })
    (ok { payout: (if (var-get emergency-mode) amount payout), penalty: (if (var-get emergency-mode) u0 penalty) })))

;; -------------------------------------------------------
;; PUBLIC: WITHDRAW PENALTY POOL (admin only)
;; -------------------------------------------------------

(define-public (withdraw-penalty-pool (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (<= amount (var-get penalty-collected)) ERR_INSUFFICIENT)
    
    (var-set penalty-collected (- (var-get penalty-collected) amount))
    
    (print { event: "penalty-withdrawn", amount: amount, recipient: recipient })
    (ok true)))

;; -------------------------------------------------------
;; READ: GET USER COOLDOWN STATUS
;; -------------------------------------------------------

(define-read-only (get-user-cooldown (user principal))
  (match (map-get? user-emergency-cooldown { user: user })
    cd (ok {
          last-emergency: (get last-emergency cd),
          cooldown-ends: (+ (get last-emergency cd) EMERGENCY_COOLDOWN),
          can-withdraw: (>= tenure-height (+ (get last-emergency cd) EMERGENCY_COOLDOWN))
        })
    (ok { last-emergency: u0, cooldown-ends: u0, can-withdraw: true })))
