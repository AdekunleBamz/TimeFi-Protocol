# Contract read retry budget

Readonly contract retries should use a fixed retry budget and show fallback copy
instead of spinning indefinitely during RPC or indexer failures.
