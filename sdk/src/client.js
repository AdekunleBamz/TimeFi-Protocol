import {
    callReadOnlyFunction,
    cvToValue,
    uintCV,
    principalCV,
    AnchorMode,
    PostConditionMode
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from './constants.js';

/**
 * Client for interacting with the TimeFi Protocol on the Stacks blockchain.
 */
export class TimeFiClient {
    /**
     * Initializes a new TimeFiClient.
     * @param {'mainnet' | 'testnet'} networkType - The Stacks network to target.
     */
    constructor(networkType = 'mainnet') {
        this.network = networkType === 'mainnet'
            ? new StacksMainnet()
            : new StacksTestnet();
        this.contractAddress = CONTRACT_ADDRESS;
    }

    // --- Read-only Methods ---

    /**
     * Internal helper to call a read-only contract function.
     * @param {string} functionName - Name of the Clarity function.
     * @param {any[]} functionArgs - Arguments for the function call.
     * @param {string} [senderAddress] - Optional sender address.
     * @returns {Promise<any>} The parsed result of the call.
     */
    async callReadOnly(functionName, functionArgs = [], senderAddress) {
        const result = await callReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName,
            functionArgs,
            network: this.network,
            senderAddress: senderAddress || this.contractAddress,
        });

        // Handle ResponseCV (ok/err) explicitly
        if (result.type === 7 || result.type === 8) { // ok or err
            return cvToValue(result.value);
        }

        return cvToValue(result);
    }

    /**
     * Retrieves vault details by ID.
     * @param {number} vaultId - The unique ID of the vault.
     * @returns {Promise<any>} The vault data.
     */
    async getVault(vaultId) {
        if (vaultId === undefined || vaultId === null) throw new Error('vaultId is required');
        return this.callReadOnly('get-vault', [uintCV(vaultId)]);
    }

    async getTimeRemaining(vaultId) {
        if (vaultId === undefined || vaultId === null) throw new Error('vaultId is required');
        return this.callReadOnly('get-time-remaining', [uintCV(vaultId)]);
    }

    async canWithdraw(vaultId) {
        if (vaultId === undefined || vaultId === null) throw new Error('vaultId is required');
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
        if (vaultId === undefined || vaultId === null) throw new Error('vaultId is required');
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
