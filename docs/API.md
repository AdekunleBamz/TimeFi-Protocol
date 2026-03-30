# TimeFi Protocol API Reference

Scope: this reference describes the core vault contract interface used by local tests.

For script operations and funding flows, see `docs/MAINNET_TESTING.md`.

## Public Functions

Admin-only functions in this list enforce deployer authorization checks.

### `create-vault`
Create a new time-locked vault with STX deposit.

```clarity
(create-vault (amount uint) (lock-secs uint))
```

**Parameters:**
- `amount` - Amount of STX to deposit (minimum 10,000 microSTX)
- `lock-secs` - Lock duration in seconds (3,600 to 31,536,000)

**Returns:** `(response uint uint)` - Vault ID on success

**Events:** Emits `{event: "create", id, owner, amount, unlock}`

**Transfer behavior:** principal-after-fee goes to deployer custodian, fee goes to `treasury`.

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

> Local simnet tests may expose `u4` from chain-time lookup in edge timing scenarios.

---

### `approve-bot`
Approve a contract as an automated trading bot. Admin only.

```clarity
(approve-bot (bot principal))
```

**Parameters:**
- `bot` - Principal intended for bot automation checks (`contract-hash?` based in this contract version)

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

Changing treasury affects where create-vault and top-up fees are sent.

---

## Read-Only Functions

Most read-only helpers return response values; `is-bot` returns a plain boolean.

### `get-vault`
Get vault details by ID.

```clarity
(get-vault (id uint))
```

**Returns:** Vault tuple with owner, amount, lock-time, unlock-time, active

The tuple is wrapped in a Clarity response (`ok`/`err`).

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

TVL tracks deposited principal (post-fee), not cumulative protocol fees.

---

### `get-total-fees`
Get total fees collected.

```clarity
(get-total-fees)
```

**Returns:** `(response uint uint)`

This value is cumulative protocol fee accounting, not a wallet balance query.

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

Computed from block-time data, so local clock time is only approximate.

---

### `get-treasury`
Get current treasury address.

```clarity
(get-treasury)
```

**Returns:** `(response principal uint)`

Defaults to deployer at deployment and can be changed via `set-treasury`.

---

### `can-withdraw`
Check if vault can be withdrawn (active and past unlock).

```clarity
(can-withdraw (id uint))
```

**Returns:** `(response bool uint)`

Read-only check only; it does not move funds.
Treat it as a preflight hint, not a final guarantee for subsequent write calls.

---

### `is-vault-owner`
Check if principal owns a vault.

```clarity
(is-vault-owner (id uint) (owner principal))
```

**Returns:** `(response bool uint)`

Useful for frontends before enabling owner-only actions.

---

### `is-bot`
Check if principal is an approved bot.

```clarity
(is-bot (sender principal))
```

**Returns:** `bool`

In this contract variant, non-contract principals resolve to `false`.

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

Both return response-wrapped uint values.

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

Built-in runtime errors (for example `u4`) may appear when Clarity arithmetic/unwrap checks fail.
