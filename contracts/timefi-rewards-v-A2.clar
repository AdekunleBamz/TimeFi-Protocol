;; -------------------------------------------------------
;; TimeFi Rewards Contract v-A2
;; Tiered APY based on lock duration
;; -------------------------------------------------------

(define-constant ERR_UNAUTHORIZED (err u200))
(define-constant ERR_NOT_FOUND (err u201))
(define-constant ERR_ALREADY_CLAIMED (err u202))
(define-constant ERR_NOT_MATURED (err u203))
(define-constant ERR_NO_REWARDS (err u204))
(define-constant ERR_INSUFFICIENT_POOL (err u205))

(define-constant DEPLOYER tx-sender)

;; Reward tiers (APY in basis points)
;; Tier 1: 30 days lock = 1% APY (100 BPS)
;; Tier 2: 90 days lock = 3% APY (300 BPS)  
;; Tier 3: 180 days lock = 6% APY (600 BPS)
;; Tier 4: 270 days lock = 9% APY (900 BPS)
;; Tier 5: 365 days lock = 12% APY (1200 BPS)

(define-constant TIER_1_BLOCKS u4320)    ;; ~30 days
(define-constant TIER_2_BLOCKS u12960)   ;; ~90 days
(define-constant TIER_3_BLOCKS u25920)   ;; ~180 days
(define-constant TIER_4_BLOCKS u38880)   ;; ~270 days
(define-constant TIER_5_BLOCKS u52560)   ;; ~365 days

(define-constant TIER_1_APY u100)
(define-constant TIER_2_APY u300)
(define-constant TIER_3_APY u600)
(define-constant TIER_4_APY u900)
(define-constant TIER_5_APY u1200)

(define-data-var rewards-pool uint u0)
(define-data-var total-rewards-paid uint u0)

(define-map claimed-rewards
  { vault-id: uint }
  { amount: uint, claimed-at: uint })

;; -------------------------------------------------------
;; READ: GET TIER FOR LOCK DURATION
;; -------------------------------------------------------

(define-read-only (get-tier (lock-duration uint))
  (if (>= lock-duration TIER_5_BLOCKS)
    { tier: u5, apy: TIER_5_APY }
    (if (>= lock-duration TIER_4_BLOCKS)
      { tier: u4, apy: TIER_4_APY }
      (if (>= lock-duration TIER_3_BLOCKS)
        { tier: u3, apy: TIER_3_APY }
        (if (>= lock-duration TIER_2_BLOCKS)
          { tier: u2, apy: TIER_2_APY }
          (if (>= lock-duration TIER_1_BLOCKS)
            { tier: u1, apy: TIER_1_APY }
            { tier: u0, apy: u0 }))))))

;; -------------------------------------------------------
;; READ: CALCULATE REWARDS FOR VAULT
;; -------------------------------------------------------

(define-read-only (calculate-rewards (vault-id uint))
  (let (
    (vault-result (contract-call? .timefi-vault-v-A2 get-vault vault-id))
  )
    (match vault-result
      vault
        (if (get active vault)
          (let (
            (lock-duration (- (get unlock-time vault) (get lock-time vault)))
            (tier-info (get-tier lock-duration))
            (apy (get apy tier-info))
            (amount (get amount vault))
            ;; Calculate rewards: amount * APY * (duration / year) / 10000
            (yearly-reward (/ (* amount apy) u10000))
            (actual-reward (/ (* yearly-reward lock-duration) u52560))
          )
            (ok { 
              vault-id: vault-id,
              tier: (get tier tier-info),
              apy: apy,
              amount: amount,
              lock-duration: lock-duration,
              reward: actual-reward
            }))
          (ok { vault-id: vault-id, tier: u0, apy: u0, amount: u0, lock-duration: u0, reward: u0 }))
      error ERR_NOT_FOUND)))

;; -------------------------------------------------------
;; READ: GET REWARDS POOL BALANCE
;; -------------------------------------------------------

(define-read-only (get-rewards-pool)
  (ok (var-get rewards-pool)))

;; -------------------------------------------------------
;; READ: GET TOTAL REWARDS PAID
;; -------------------------------------------------------

(define-read-only (get-total-rewards-paid)
  (ok (var-get total-rewards-paid)))

;; -------------------------------------------------------
;; READ: HAS CLAIMED REWARDS
;; -------------------------------------------------------

(define-read-only (has-claimed (vault-id uint))
  (is-some (map-get? claimed-rewards { vault-id: vault-id })))

;; -------------------------------------------------------
;; READ: GET CLAIMED INFO
;; -------------------------------------------------------

(define-read-only (get-claimed-info (vault-id uint))
  (map-get? claimed-rewards { vault-id: vault-id }))

;; -------------------------------------------------------
;; PUBLIC: FUND REWARDS POOL (anyone can fund)
;; Funds go to DEPLOYER who acts as custodian
;; -------------------------------------------------------

(define-public (fund-rewards-pool (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender DEPLOYER))
    (var-set rewards-pool (+ (var-get rewards-pool) amount))
    (print { event: "pool-funded", funder: tx-sender, amount: amount, new-total: (var-get rewards-pool) })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: PROCESS REWARD CLAIM (deployer sends rewards)
;; -------------------------------------------------------

(define-public (process-reward-claim (vault-id uint) (recipient principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (<= amount (var-get rewards-pool)) ERR_INSUFFICIENT_POOL)
    (try! (stx-transfer? amount tx-sender recipient))
    (var-set rewards-pool (- (var-get rewards-pool) amount))
    (var-set total-rewards-paid (+ (var-get total-rewards-paid) amount))
    (print { event: "reward-processed", vault-id: vault-id, recipient: recipient, amount: amount })
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: REQUEST CLAIM REWARDS (user initiates, deployer processes)
;; -------------------------------------------------------

(define-public (request-claim-rewards (vault-id uint))
  (let (
    (vault-data (unwrap! (contract-call? .timefi-vault-v-A2 get-vault vault-id) ERR_NOT_FOUND))
    (rewards-info (unwrap! (calculate-rewards vault-id) ERR_NOT_FOUND))
    (reward-amount (get reward rewards-info))
  )
    ;; Validations
    (asserts! (is-eq (get owner vault-data) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (not (has-claimed vault-id)) ERR_ALREADY_CLAIMED)
    (asserts! (>= tenure-height (get unlock-time vault-data)) ERR_NOT_MATURED)
    (asserts! (> reward-amount u0) ERR_NO_REWARDS)
    (asserts! (>= (var-get rewards-pool) reward-amount) ERR_INSUFFICIENT_POOL)

    ;; Record claim intent (deployer will process)
    (map-set claimed-rewards { vault-id: vault-id }
      { amount: reward-amount, claimed-at: tenure-height })

    (print { 
      event: "rewards-claim-requested",
      vault-id: vault-id,
      claimer: tx-sender,
      amount: reward-amount,
      tier: (get tier rewards-info)
    })
    (ok reward-amount)))

;; -------------------------------------------------------
;; PUBLIC: WITHDRAW EXCESS FROM POOL (admin only)
;; Deployer transfers from their own wallet
;; -------------------------------------------------------

(define-public (withdraw-excess (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (<= amount (var-get rewards-pool)) ERR_INSUFFICIENT_POOL)
    
    (var-set rewards-pool (- (var-get rewards-pool) amount))
    (try! (stx-transfer? amount tx-sender recipient))
    
    (print { event: "excess-withdrawn", amount: amount, recipient: recipient })
    (ok true)))
