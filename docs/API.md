# TimeFi Protocol API Reference

Scope: This reference summarizes the core vault contract interface used by local tests.

For setup and contributor workflow details, use the root `README.md` and `CONTRIBUTING.md`.

## Public Functions

Some functions below are admin-only and enforce deployer authorization checks.

### `create-vault`
Create a new time-locked vault with an STX deposit.

```clarity
(create-vault (amount uint) (lock-blocks uint))
```

**Parameters:**
- `amount` - Amount of STX to deposit in microSTX (minimum 10,000 microSTX = 0.01 STX)
- `lock-blocks` - Lock duration in Stacks blocks (6 to 52,560)

Amounts are provided in microSTX, so UI conversions should happen before contract submission.

**Returns:** `(response uint uint)` - Vault ID on success

Vault IDs increment monotonically with each successful `create-vault` call.

**Events:** Emits `{event: "create", id, owner, amount, unlock}`

**Transfer behavior:** Post-fee principal goes to the deployer custodian, and fees go to `treasury`.

**Fee Calculation:** 0.5% of deposit amount (FEE_BPS = 50 basis points)
Fee math uses integer arithmetic, so results are floor-rounded in microSTX units.

---

### `request-withdraw`
Submit a withdrawal request for a mature vault.

```clarity
(request-withdraw (id uint))
```

**Parameters:**
- `id` - Vault ID to withdraw from

**Returns:** `(response bool uint)` - true on success

**Events:** Emits `{event: "withdraw-requested", id, owner}`

> This call marks the vault ready for processing; it does not transfer STX immediately.
> Vault `active` status remains true until `process-withdraw` executes.

---

### `process-withdraw`
Process a queued withdrawal. Admin-only.

```clarity
(process-withdraw (id uint))
```

**Parameters:**
- `id` - Vault ID that was already queued via `request-withdraw`

**Returns:** `(response bool uint)`



**Events:** Emits `{event: "withdraw", id, owner, amount}`

`amount` in the withdraw event is denominated in microSTX.

---

### `approve-bot`
Approve a contract as an automated trading bot. Admin-only.

```clarity
(approve-bot (bot principal))
```

**Parameters:**
- `bot` - Principal intended for bot automation checks (`contract-hash?` used in this contract version)

Use a contract principal (`SP....contract-name`) for predictable `is-bot` checks.

**Returns:** `(response bool uint)`

---

### `revoke-bot`
Revoke a previously approved bot. Admin-only.

```clarity
(revoke-bot (bot principal))
```

**Parameters:**
- `bot` - Contract principal to revoke

**Returns:** `(response bool uint)`

---

### `set-treasury`
Update the treasury address. Admin-only.

```clarity
(set-treasury (new-treasury principal))
```

**Parameters:**
- `new-treasury` - New treasury address

**Returns:** `(response bool uint)`

Changing treasury affects where create-vault fees are sent.
Treasury updates do not retroactively move previously collected balances.

---

## Read-Only Functions

Most read-only helpers return response values, while `is-bot` returns a plain boolean.

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
Get total value locked in the protocol (TVL).

```clarity
(get-tvl)
```

**Returns:** `(response uint uint)`

Vault count is monotonic and does not decrement when vaults are withdrawn.

TVL tracks deposited principal (post-fee), not cumulative protocol fees.

---

### `get-total-fees`
Get cumulative protocol fees collected.

```clarity
(get-total-fees)
```

**Returns:** `(response uint uint)`

This value is cumulative protocol fee accounting, not a wallet balance query.
Fee accounting is independent of the `get-tvl` principal tracking value.

---

### `get-vault-count`
Get total number of vaults created.

```clarity
(get-vault-count)
```

**Returns:** `(response uint uint)`

---

### `get-time-remaining`
Get remaining blocks until a vault unlocks.

```clarity
(get-time-remaining (id uint))
```

**Returns:** `(response uint uint)` - 0 if already unlocked

Computed from chain height, so calendar estimates are only approximate.
Unknown vault IDs return the contract `ERR_NOT_FOUND` response code.

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
Inactive or unknown vaults return error responses instead of `ok false`.

---

### `is-vault-owner`
Check if principal owns a vault.

```clarity
(is-vault-owner (id uint) (owner principal))
```

**Returns:** `(response bool uint)`

Useful for frontends before enabling owner-only actions.
Calls with unknown vault IDs return `ERR_NOT_FOUND`.

---

### `is-bot`
Check if principal is an approved bot.

```clarity
(is-bot (sender principal))
```

**Returns:** `bool`

In this contract variant, non-contract principals resolve to `false`.
Because this function is not response-wrapped, callers should not expect `ok`/`err` tuples.

---

### Protocol Constants

| Function | Returns |
|----------|---------|
| `get-min-deposit` | `u10000` (0.01 STX) |
| `get-min-lock` | `u6` (~1 hour) |
| `get-max-lock` | `u52560` (~1 year) |
| `get-fee-bps` | `u50` (0.5%) |

All constants above are returned as unsigned Clarity integers (`uint`).

**SDK lock period presets (in blocks):**

| Name | Blocks | Approx. duration |
|------|--------|-----------------|
| `MONTH_1` | 4,320 | ~30 days |
| `MONTH_3` | 12,960 | ~90 days |
| `MONTH_6` | 25,920 | ~180 days |
| `MONTH_9` | 38,880 | ~270 days |
| `YEAR_1` | 52,560 | ~1 year |
| `YEAR_2` | 105,120 | ~2 years |

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

---

## Notes on `withdraw`

The public function in the contract is named `request-withdraw`, not `withdraw`. The `withdraw` alias shown above is a convenience wrapper in the SDK. When calling the contract directly, use `request-withdraw`.
