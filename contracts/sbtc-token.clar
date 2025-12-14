;; Mock sBTC Token for Testing (SIP-010 Compatible)
;; This is a simnet/testnet mock - mainnet uses the real sBTC contract

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_NOT_FOUND (err u101))

(define-fungible-token sbtc)

(define-data-var token-uri (optional (string-utf8 256)) (some u"https://stacks.co/sbtc"))

;; SIP-010 Functions
(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
    (begin
        (asserts! (is-eq tx-sender sender) ERR_NOT_AUTHORIZED)
        (try! (ft-transfer? sbtc amount sender recipient))
        (match memo to-print (print to-print) 0x)
        (ok true)))

(define-read-only (get-name)
    (ok "sBTC"))

(define-read-only (get-symbol)
    (ok "sBTC"))

(define-read-only (get-decimals)
    (ok u8))

(define-read-only (get-balance (who principal))
    (ok (ft-get-balance sbtc who)))

(define-read-only (get-total-supply)
    (ok (ft-get-supply sbtc)))

(define-read-only (get-token-uri)
    (ok (var-get token-uri)))

;; Mint function for testing (only owner can mint)
(define-public (mint (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
        (ft-mint? sbtc amount recipient)))

;; Faucet for testnet - anyone can get test sBTC
(define-public (faucet (amount uint))
    (begin
        (asserts! (<= amount u100000000) ERR_NOT_AUTHORIZED) ;; Max 1 sBTC per faucet call
        (ft-mint? sbtc amount tx-sender)))
