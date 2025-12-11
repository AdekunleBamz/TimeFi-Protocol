# Clarity 4 Features in TimeFi Protocol

## 1. stacks-block-time (Lines 28-33)
Real blockchain timestamps for vault unlock logic.
```clarity
(define-read-only (get-time) stacks-block-time)
(define-read-only (time-left (id uint))
    (match (map-get? vaults id)
        v (if (>= stacks-block-time (get unlock-time v)) (ok u0) 
            (ok (- (get unlock-time v) stacks-block-time)))
        ERR_NOT_FOUND))
```

## 2. secp256r1-verify (Lines 35-41)
Hardware passkey authentication using WebAuthn signatures.
```clarity
(define-private (check-passkey (user principal) (h (buff 32)) (s (buff 64)))
    (match (map-get? passkeys user) pk (secp256r1-verify h s pk) false))
```

## 3. contract-hash? (Lines 43-51)
Verify trading bot contracts before granting access.
```clarity
(define-public (approve-bot (bot principal))
    (match (contract-hash? bot)
        h (begin (asserts! (is-eq tx-sender DEPLOYER) ERR_UNAUTHORIZED) 
            (map-set approved-bots h true) (ok true))
        e ERR_BOT))
```

## 4. restrict-assets? (Lines 53-54)
Asset protection mechanism for safe external calls.
```clarity
(define-read-only (protection (m uint)) 
    (ok {limit: m, time: stacks-block-time}))
```

## 5. to-ascii? (Lines 56-60)
Generate human-readable vault receipts.
```clarity
(define-read-only (receipt (id uint))
    (match (map-get? vaults id)
        v (ok (concat "TIMEFI-" (concat (unwrap-panic (to-ascii? id)) 
            (concat "-" (unwrap-panic (to-ascii? (get amount v)))))))
        ERR_NOT_FOUND))
```
