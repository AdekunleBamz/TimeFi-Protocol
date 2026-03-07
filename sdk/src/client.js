import {
    callReadOnlyFunction,
    cvToValue,
    uintCV,
    principalCV,
    AnchorMode,
    PostConditionMode
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from './constants';

export class TimeFiClient {
    constructor(networkType = 'mainnet') {
        this.network = networkType === 'mainnet'
            ? new StacksMainnet()
            : new StacksTestnet();
        this.contractAddress = CONTRACT_ADDRESS;
    }

    // --- Read-only Methods ---

    async callReadOnly(functionName, functionArgs = [], senderAddress) {
        const result = await callReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName,
            functionArgs,
            network: this.network,
            senderAddress: senderAddress || this.contractAddress,
        });
        return cvToValue(result);
    }

    async getVault(vaultId) {
        return this.callReadOnly('get-vault', [uintCV(vaultId)]);
    }

    async getTimeRemaining(vaultId) {
        return this.callReadOnly('get-time-remaining', [uintCV(vaultId)]);
    }

    async canWithdraw(vaultId) {
        return this.callReadOnly('can-withdraw', [uintCV(vaultId)]);
    }

    async getTVL() {
        return this.callReadOnly('get-tvl', []);
    }

    // --- Transaction Signing Options Helpers ---

    getCreateVaultOptions(amountSTX, lockDurationBlocks) {
        return {
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'create-vault',
            functionArgs: [uintCV(amountSTX * 1_000_000), uintCV(lockDurationBlocks)],
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };
    }

    getWithdrawOptions(vaultId) {
        return {
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'request-withdraw',
            functionArgs: [uintCV(vaultId)],
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };
    }
}
