# Vault card skeleton state

Vault cards should use skeleton loading only while a read is active, then switch
to empty or error states when the read completes.
