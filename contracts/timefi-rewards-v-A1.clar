;; -------------------------------------------------------
;; TimeFi Rewards Contract
;; Tiered staking rewards based on lock duration
;; -------------------------------------------------------

(define-constant ERR_UNAUTHORIZED (err u200))
(define-constant ERR_NOT_FOUND (err u201))
(define-constant ERR_ALREADY_CLAIMED (err u202))
(define-constant ERR_NO_REWARDS (err u203))
(define-constant ERR_VAULT_INACTIVE (err u204))
(define-constant ERR_NOT_ELIGIBLE (err u205))
(define-constant ERR_PAUSED (err u206))

;; Reward tiers in blocks (1 block ~ 10 minutes)
;; Tier 1: 1 hour - 7 days = 1% APY
;; Tier 2: 7 days - 30 days = 3% APY
;; Tier 3: 30 days - 90 days = 5% APY
;; Tier 4: 90 days - 180 days = 8% APY
;; Tier 5: 180 days - 1 year = 12% APY

(define-constant TIER_1_MAX u1008)        ;; 7 days (~1008 blocks)
(define-constant TIER_2_MAX u4320)        ;; 30 days (~4320 blocks)
(define-constant TIER_3_MAX u12960)       ;; 90 days (~12960 blocks)
(define-constant TIER_4_MAX u25920)       ;; 180 days (~25920 blocks)

(define-constant TIER_1_APY u100)         ;; 1%
(define-constant TIER_2_APY u300)         ;; 3%
(define-constant TIER_3_APY u500)         ;; 5%
(define-constant TIER_4_APY u800)         ;; 8%
(define-constant TIER_5_APY u1200)        ;; 12%

(define-constant BLOCKS_PER_YEAR u52560)  ;; ~52560 blocks/year

(define-constant DEPLOYER tx-sender)

(define-data-var rewards-pool uint u0)
(define-data-var total-rewards-distributed uint u0)
(define-data-var rewards-paused bool false)

;; Track last claim time for each vault
(define-map vault-claims
  ((vault-id uint))
  ((last-claim uint) (total-claimed uint)))

;; -------------------------------------------------------
;; READ: GET REWARD TIER FOR LOCK DURATION
;; -------------------------------------------------------

(define-read-only (get-tier-apy (lock-duration uint))
  (if (<= lock-duration TIER_1_MAX)
    TIER_1_APY
    (if (<= lock-duration TIER_2_MAX)
      TIER_2_APY
      (if (<= lock-duration TIER_3_MAX)
        TIER_3_APY
        (if (<= lock-duration TIER_4_MAX)
          TIER_4_APY
          TIER_5_APY)))))

;; -------------------------------------------------------
;; READ: CALCULATE PENDING REWARDS
;; -------------------------------------------------------

(define-read-only (calculate-rewards (vault-id uint))
  (let (
    (vault-data (contract-call? .timefi-vault-v-A1 get-vault vault-id))
  )
    (match vault-data
      vault
        (let (
          (lock-duration (- (get unlock-time vault) (get lock-time vault)))
          (apy (get-tier-apy lock-duration))
          (amount (get amount vault))
          (claim-data (default-to {last-claim: (get lock-time vault), total-claimed: u0}
                        (map-get? vault-claims {vault-id: vault-id})))
          (time-since-claim (- tenure-height (get last-claim claim-data)))
          ;; Rewards = principal * apy * time / (10000 * seconds_per_year)
          (rewards (/ (* (* amount apy) time-since-claim) (* u10000 BLOCKS_PER_YEAR)))
        )
          (if (get active vault)
            (ok rewards)
            (ok u0)))
      err (ok u0))))

;; -------------------------------------------------------
;; READ: GET VAULT CLAIM INFO
;; -------------------------------------------------------

(define-read-only (get-claim-info (vault-id uint))
  (ok (default-to {last-claim: u0, total-claimed: u0}
        (map-get? vault-claims {vault-id: vault-id}))))

;; -------------------------------------------------------
;; READ: GET REWARDS POOL BALANCE
;; -------------------------------------------------------

(define-read-only (get-rewards-pool)
  (ok (var-get rewards-pool)))

;; -------------------------------------------------------
;; READ: GET TOTAL DISTRIBUTED
;; -------------------------------------------------------

(define-read-only (get-total-distributed)
  (ok (var-get total-rewards-distributed)))

;; -------------------------------------------------------
;; READ: GET TIER INFO
;; -------------------------------------------------------

(define-read-only (get-tier-info)
  (ok {
    tier-1: {max-duration: TIER_1_MAX, apy: TIER_1_APY},
    tier-2: {max-duration: TIER_2_MAX, apy: TIER_2_APY},
    tier-3: {max-duration: TIER_3_MAX, apy: TIER_3_APY},
    tier-4: {max-duration: TIER_4_MAX, apy: TIER_4_APY},
    tier-5: {max-duration: BLOCKS_PER_YEAR, apy: TIER_5_APY}
  }))

;; -------------------------------------------------------
;; READ: IS REWARDS PAUSED
;; -------------------------------------------------------

(define-read-only (is-rewards-paused)
  (var-get rewards-paused))

;; -------------------------------------------------------
;; PUBLIC: CLAIM REWARDS
;; -------------------------------------------------------

(define-public (claim-rewards (vault-id uint))
  (let (
    (vault-data (unwrap! (contract-call? .timefi-vault-v-A1 get-vault vault-id) ERR_NOT_FOUND))
    (lock-duration (- (get unlock-time vault-data) (get lock-time vault-data)))
    (apy (get-tier-apy lock-duration))
    (amount (get amount vault-data))
    (claim-data (default-to {last-claim: (get lock-time vault-data), total-claimed: u0}
                  (map-get? vault-claims {vault-id: vault-id})))
    (time-since-claim (- tenure-height (get last-claim claim-data)))
    (rewards (/ (* (* amount apy) time-since-claim) (* u10000 BLOCKS_PER_YEAR)))
  )
    (asserts! (not (var-get rewards-paused)) ERR_PAUSED)
    (asserts! (is-eq (get owner vault-data) tx-sender) ERR_UNAUTHORIZED)
    (asserts! (get active vault-data) ERR_VAULT_INACTIVE)
    (asserts! (> rewards u0) ERR_NO_REWARDS)
    (asserts! (<= rewards (var-get rewards-pool)) ERR_NO_REWARDS)

    ;; Update claim tracking
    (map-set vault-claims {vault-id: vault-id}
      {
        last-claim: tenure-height,
        total-claimed: (+ (get total-claimed claim-data) rewards)
      })

    ;; Transfer rewards
    (try! (stx-transfer? rewards (as-contract tx-sender) tx-sender))

    (var-set rewards-pool (- (var-get rewards-pool) rewards))
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) rewards))

    (print {event: "rewards-claimed", vault-id: vault-id, claimer: tx-sender, amount: rewards, tier-apy: apy})
    (ok rewards)))

;; -------------------------------------------------------
;; PUBLIC: FUND REWARDS POOL (anyone can add)
;; -------------------------------------------------------

(define-public (fund-rewards-pool (amount uint))
  (begin
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set rewards-pool (+ (var-get rewards-pool) amount))
    (print {event: "pool-funded", funder: tx-sender, amount: amount, new-total: (var-get rewards-pool)})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: PAUSE REWARDS (admin only)
;; -------------------------------------------------------

(define-public (pause-rewards)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set rewards-paused true)
    (print {event: "rewards-paused"})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: UNPAUSE REWARDS (admin only)
;; -------------------------------------------------------

(define-public (unpause-rewards)
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (var-set rewards-paused false)
    (print {event: "rewards-unpaused"})
    (ok true)))

;; -------------------------------------------------------
;; PUBLIC: WITHDRAW FROM REWARDS POOL (admin only)
;; -------------------------------------------------------

(define-public (withdraw-rewards-pool (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED)
    (asserts! (<= amount (var-get rewards-pool)) ERR_NO_REWARDS)
    (try! (stx-transfer? amount (as-contract tx-sender) recipient))
    (var-set rewards-pool (- (var-get rewards-pool) amount))
    (print {event: "pool-withdrawn", amount: amount, recipient: recipient})
    (ok true)))
