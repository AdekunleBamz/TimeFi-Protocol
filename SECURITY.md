# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please:

1. **DO NOT** open a public issue
2. Email security concerns privately to the maintainers
3. Include a detailed description of the vulnerability and its potential impact
4. Allow reasonable time for a fix before public disclosure
5. Include affected network, contract name, and any relevant txid when available
6. Share clear reproduction steps and impact assessment details

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 1.x     | :white_check_mark: |

## Security Measures

The TimeFi Protocol implements the following security measures:

- **Access Controls**: All admin functions require deployer authorization
- **Input Validation**: All parameters are validated against defined limits
- **Time-Lock Protection**: Vaults cannot be withdrawn before unlock time
- **Fee Limits**: Fees are capped at protocol constants

## Known Limitations

- This contract has **not been externally audited** as of April 2026. Use at your own risk.
- The protocol relies on chain height (`tenure-height`) for lock timing calculations
- Bot approval uses `contract-hash?` which requires contract principals

## Best Practices for Users

1. Only deposit amounts you can afford to lock
2. Verify the unlock time before creating a vault
3. Test with small amounts first
4. Keep your wallet keys secure
5. Confirm wallet network and API endpoint alignment before write actions
6. Revoke bot approvals quickly if any integration key is compromised

## Contact

For security concerns, please contact the maintainers privately.

**Primary Contact**: adekunlebamz (GitHub)

**Security Email**: bams.kunle@gmail.com

Use encrypted email when sharing exploit proofs or private key material.
