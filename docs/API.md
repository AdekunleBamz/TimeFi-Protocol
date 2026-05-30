# TimeFi Protocol API Reference

Amounts are expressed in microSTX unless stated otherwise.

## Public Functions

### `create-vault`
Create a new time-locked vault with STX deposit.

```clarity
(create-vault (amount uint) (lock-blocks uint))
```

**Parameters:**
- `amount` - Amount of STX to deposit (minimum 10,000 microSTX)
- `lock-blocks` - Lock duration in blocks

**Returns:** `(response uint uint)` - Vault ID on success

**Events:** Emits `{event: "create", id, owner, amount, unlock}`

---

### `withdraw`
Withdraw funds from an unlocked vault.

```clarity
(withdraw (id uint))
```

**Parameters:**
- `id` - Vault ID to withdraw from

**Returns:** `(response bool uint)` - true on success

**Events:** Emits `{event: "withdraw", id, owner}`

---

### `request-withdraw`
Queue a withdrawal request once a vault is mature.

```clarity
(request-withdraw (id uint))
```

**Parameters:**
- `id` - Vault ID to queue for withdrawal

**Returns:** `(response bool uint)`

---

### `process-withdraw`
Settle a mature queued withdrawal. Deployer only.

```clarity
(process-withdraw (id uint))
```

**Parameters:**
- `id` - Vault ID to settle

**Returns:** `(response bool uint)`

---

### `approve-bot`
Approve a contract as an automated trading bot. Admin only.

```clarity
(approve-bot (bot principal))
```

**Parameters:**
- `bot` - Contract principal to approve

**Returns:** `(response bool uint)`

---

### `revoke-bot`
Revoke a previously approved bot. Admin only.

```clarity
(revoke-bot (bot principal))
```

**Parameters:**
- `bot` - Contract principal to revoke

**Returns:** `(response bool uint)`

---

### `set-treasury`
Update the treasury address. Admin only.

```clarity
(set-treasury (new-treasury principal))
```

**Parameters:**
- `new-treasury` - New treasury address

**Returns:** `(response bool uint)`

---

### `top-up-vault`
Add STX to an active vault.

```clarity
(top-up-vault (id uint) (amount uint))
```

**Parameters:**
- `id` - Vault ID to fund
- `amount` - Additional deposit amount in microSTX

**Returns:** `(response bool uint)`

---

### `extend-lock`
Extend the unlock height for an active vault.

```clarity
(extend-lock (id uint) (additional-blocks uint))
```

**Parameters:**
- `id` - Vault ID to extend
- `additional-blocks` - Number of blocks to add to the current unlock height

**Returns:** `(response bool uint)`

---

### `set-beneficiary`
Assign a beneficiary principal for a vault.

```clarity
(set-beneficiary (id uint) (beneficiary principal))
```

**Parameters:**
- `id` - Vault ID to update
- `beneficiary` - Principal allowed to claim after the beneficiary delay

**Returns:** `(response bool uint)`

---

### `remove-beneficiary`
Remove the configured beneficiary from a vault.

```clarity
(remove-beneficiary (id uint))
```

**Parameters:**
- `id` - Vault ID to update

**Returns:** `(response bool uint)`

---

### `request-beneficiary-claim`
Queue a beneficiary claim after the configured delay.

```clarity
(request-beneficiary-claim (id uint))
```

**Parameters:**
- `id` - Vault ID to queue for beneficiary settlement

**Returns:** `(response bool uint)`

---

### `process-beneficiary-claim`
Settle a queued beneficiary claim. Deployer only.

```clarity
(process-beneficiary-claim (id uint))
```

**Parameters:**
- `id` - Vault ID to settle

**Returns:** `(response bool uint)`

---

### `initiate-transfer`
Start ownership transfer for a vault.

```clarity
(initiate-transfer (id uint) (new-owner principal))
```

**Parameters:**
- `id` - Vault ID to transfer
- `new-owner` - Principal that can accept ownership

**Returns:** `(response bool uint)`

---

### `accept-transfer`
Accept a pending vault ownership transfer.

```clarity
(accept-transfer (id uint))
```

**Parameters:**
- `id` - Vault ID with a pending transfer to the caller

**Returns:** `(response bool uint)`

---

### `cancel-transfer`
Cancel a pending vault ownership transfer.

```clarity
(cancel-transfer (id uint))
```

**Parameters:**
- `id` - Vault ID with a pending transfer

**Returns:** `(response bool uint)`

---

## Read-Only Functions

### `get-vault`
Get vault details by ID.

```clarity
(get-vault (id uint))
```

**Returns:** Vault tuple with owner, amount, lock-time, unlock-time, active

---

### `is-active`
Check if a vault is active.

```clarity
(is-active (id uint))
```

**Returns:** `(response bool uint)`

---

### `get-tvl`
Get total value locked in the protocol.

```clarity
(get-tvl)
```

**Returns:** `(response uint uint)`

---

### `get-total-fees`
Get total fees collected.

```clarity
(get-total-fees)
```

**Returns:** `(response uint uint)`

---

### `get-vault-count`
Get total number of vaults created.

```clarity
(get-vault-count)
```

**Returns:** `(response uint uint)`

---

### `get-time-remaining`
Get seconds remaining until vault unlock.

```clarity
(get-time-remaining (id uint))
```

**Returns:** `(response uint uint)` - 0 if already unlocked

---

### `get-treasury`
Get current treasury address.

```clarity
(get-treasury)
```

**Returns:** `(response principal uint)`

---

### `can-withdraw`
Check if vault can be withdrawn (active and past unlock).

```clarity
(can-withdraw (id uint))
```

**Returns:** `(response bool uint)`

---

### `is-vault-owner`
Check if principal owns a vault.

```clarity
(is-vault-owner (id uint) (owner principal))
```

**Returns:** `(response bool uint)`

---

### `is-bot`
Check if principal is an approved bot.

```clarity
(is-bot (sender principal))
```

**Returns:** `bool`

---

### Protocol Constants

| Function | Returns |
|----------|---------|
| `get-min-deposit` | `u10000` (0.01 STX) |
| `get-min-lock` | `u3600` (1 hour) |
| `get-max-lock` | `u31536000` (1 year) |
| `get-fee-bps` | `u50` (0.5%) |

---

### Fee Calculators

```clarity
(calculate-fee (amount uint))
(calculate-deposit-after-fee (amount uint))
```

---

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| u100 | ERR_UNAUTHORIZED | Caller not authorized |
| u101 | ERR_NOT_FOUND | Vault not found |
| u102 | ERR_INACTIVE | Vault already withdrawn |
| u103 | ERR_AMOUNT | Invalid deposit amount |
| u104 | ERR_LOCK_PERIOD | Invalid lock period |
| u105 | ERR_ALREADY | Action already performed |
| u106 | ERR_BOT | Invalid bot contract |
