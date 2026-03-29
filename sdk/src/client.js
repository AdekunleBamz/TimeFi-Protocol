"use strict";

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
 * Clarity conversion response types.
 * @constant
 */
const ClarityResponseType = {
    OK: 7,
    ERR: 8
};

/**
 * Client for interacting with the TimeFi Protocol on the Stacks blockchain.
 */
export class TimeFiClient {
    /**
     * Initializes a new TimeFiClient.
     * @param {'mainnet' | 'testnet'} networkType - The Stacks network to target.
     */
    constructor(selectedNetwork = 'mainnet') {
        this.network = selectedNetwork === 'mainnet'
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
        const callResult = await callReadOnlyFunction({
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName,
            functionArgs,
            network: this.network,
            senderAddress: senderAddress || this.contractAddress,
        });
 
        // Handle ResponseCV (ok/err) explicitly
        if (callResult.type === ClarityResponseType.OK || callResult.type === ClarityResponseType.ERR) {
            return cvToValue(callResult.value);
        }
 
        return cvToValue(callResult);
    }

    /**
     * Retrieves vault details by ID.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} The vault details.
     * @throws {Error} If id is missing or invalid.
     */
    async getVault(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-vault', [uintCV(id)]);
    }

    /**
     * Gets the remaining time in blocks until the vault unlocks.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The number of blocks remaining.
     * @throws {Error} If id is missing or invalid.
     */
    async getTimeRemaining(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-time-remaining', [uintCV(id)]);
    }

    /**
     * Checks if a vault is currently eligible for withdrawal.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if withdrawal is possible.
     * @throws {Error} If id is missing or invalid.
     */
    async canWithdraw(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('can-withdraw', [uintCV(id)]);
    }

    /**
     * Gets the current Total Value Locked (TVL) in the protocol.
     * @returns {Promise<number>} The total microSTX locked.
     */
    async getTVL() {
        return this.callReadOnly('get-tvl', []);
    }

    // --- Transaction Signing Options Helpers ---

    /**
     * Generates options for a create-vault transaction.
     * @param {number} amountSTX - Amount of STX to lock (not microSTX).
     * @param {number} lockDurationBlocks - Number of blocks to lock the funds.
     * @returns {Object} Transaction options for @stacks/transactions.
     */
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

    /**
     * Generates options for a request-withdraw transaction.
     * @param {number|string|BigInt} id - The unique ID of the vault to withdraw from.
     * @returns {Object} Transaction options for @stacks/transactions.
     * @throws {Error} If id is missing or invalid.
     */
     getWithdrawOptions(id) {
        this.#validateVaultId(id);
        return {
            contractAddress: this.contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'request-withdraw',
            functionArgs: [uintCV(id)],
            network: this.network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };
    }

    /**
     * Internal helper to validate vault IDs.
     * @param {number|string|BigInt} id - The vault ID to validate.
     * @private
     * @throws {Error} If ID is missing or invalid.
     */
    #validateVaultId(id) {
        if (id === undefined || id === null) {
            throw new Error('Vault ID is required and must be defined');
        }
    }
}
