# Consolidate script secret redaction note

Operational script reviews should confirm API keys are read from environment variables and never printed.

Logs may state whether authenticated rate limits are active, but must not echo key material.

Include this check before sharing consolidation output in support channels.
