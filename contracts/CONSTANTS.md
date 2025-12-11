# TimeFi Protocol Constants

| Constant | Value | Description |
|----------|-------|-------------|
| MIN_DEPOSIT | 1,000,000 µSTX | Minimum 1 STX deposit |
| MIN_LOCK | 604,800 seconds | 7 days minimum lock |
| MAX_LOCK | 7,776,000 seconds | 90 days maximum lock |
| FEE_BPS | 50 | 0.5% creation fee |
| PENALTY_BPS | 1,000 | 10% early withdrawal penalty |

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| u100 | ERR_UNAUTHORIZED | Caller not authorized |
| u101 | ERR_NOT_FOUND | Vault doesn't exist |
| u102 | ERR_INACTIVE | Vault already closed |
| u103 | ERR_AMOUNT | Invalid deposit amount |
| u104 | ERR_LOCK_PERIOD | Invalid lock duration |
| u106 | ERR_BOT | Bot contract not found |
