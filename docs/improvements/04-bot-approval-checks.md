# Bot Approval Checks

- Validate approved principals match expected bot contracts.
- Confirm duplicate approvals do not mutate state unexpectedly.
- Verify unapproved callers are rejected on protected actions.
- Track approval changes in release QA logs.
- Confirm bot principal strings include contract names, not wallet-only principals.
