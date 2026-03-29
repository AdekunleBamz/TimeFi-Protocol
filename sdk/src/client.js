"use strict";

 import {
    StacksMainnet,
    StacksTestnet 
} from '@stacks/network';
import {
    callReadOnlyFunction,
    cvToValue,
    uintCV,
    principalCV,
    AnchorMode,
    PostConditionMode
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAMES } from './constants.js';

/**
 * Clarity conversion response types used by @stacks/transactions.
 * @constant {Object}
 * @private
 */
const ClarityResponseType = {
    OK: 7,
    ERR: 8
};

/**
 * Client for interacting with the TimeFi Protocol on the Stacks blockchain.
 */
 export class TimeFiClient {
    /** @type {import('@stacks/network').StacksNetwork} @private */
    #network;
    /** @type {string} @private */
    #contractAddress;
 
    /**
     * Initializes a new TimeFiClient.
     * @param {'mainnet' | 'testnet'} [selectedNetwork='mainnet'] - The Stacks network to target.
     * @throws {Error} If selectedNetwork is invalid.
     */
    constructor(selectedNetwork = 'mainnet') {
        if (!['mainnet', 'testnet'].includes(selectedNetwork)) {
            throw new Error('Invalid network type. Must be "mainnet" or "testnet".');
        }
        this.#network = selectedNetwork === 'mainnet'
            ? new StacksMainnet()
            : new StacksTestnet();
        this.#contractAddress = CONTRACT_ADDRESS;
    }

    // --- Read-only Methods ---

     /**
     * Internal helper to call a read-only contract function.
     * @param {string} functionName - Name of the Clarity function.
     * @param {any[]} functionArgs - Arguments for the function call.
     * @param {string} [senderAddress] - Optional sender address (defaults to contract address).
     * @returns {Promise<any>} The parsed result of the call.
     * @private
     */
     async callReadOnly(functionName, functionArgs = [], senderAddress) {
        const callResult = await callReadOnlyFunction({
            contractAddress: this.#contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName,
            functionArgs,
            network: this.#network,
            senderAddress: senderAddress || this.#contractAddress,
        });
 
        // Handle common Clarity response patterns (ResponseCV)
        const isResponseCV = callResult.type === ClarityResponseType.OK || 
                           callResult.type === ClarityResponseType.ERR;
 
        return isResponseCV ? cvToValue(callResult.value) : cvToValue(callResult);
    }

     /**
     * Retrieves vault details by ID.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} The vault details.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVault(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-vault', [uintCV(id)]);
    }

     /**
     * Gets the remaining time in blocks until the vault unlocks.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The number of blocks remaining.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getTimeRemaining(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-time-remaining', [uintCV(id)]);
    }

     /**
     * Checks if a vault is currently eligible for withdrawal.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if withdrawal is possible.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async canWithdraw(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('can-withdraw', [uintCV(id)]);
    }
 
    /**
     * Checks if a vault is currently active (funds locked).
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if the vault is active.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async isActive(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('is-active', [uintCV(id)]);
    }
 
    /**
     * Retrieves the owner address of a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<string>} The owner's Stacks address.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultOwner(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-vault-owner', [uintCV(id)]);
    }
 
    /**
     * Retrieves the current balance (in microSTX) of a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The vault balance in microSTX.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultAmount(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-vault-amount', [uintCV(id)]);
    }
 
    /**
     * Gets the specific block height at which a vault can be unlocked.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The block height for unlocking.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getUnlockBlock(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-unlock-block', [uintCV(id)]);
    }

     /**
     * Gets the current Total Value Locked (TVL) in the protocol.
     * @returns {Promise<number>} The total microSTX locked in all vaults.
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
     * @throws {Error} If amountSTX or lockDurationBlocks is invalid.
     */
      getCreateVaultOptions(amountSTX, lockDurationBlocks) {
        if (!amountSTX || amountSTX <= 0) throw new Error('Amount must be greater than 0 STX');
        if (!lockDurationBlocks || lockDurationBlocks <= 0) throw new Error('Lock duration must be greater than 0 blocks');
        return {
            contractAddress: this.#contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'create-vault',
            functionArgs: [uintCV(amountSTX * 1_000_000), uintCV(lockDurationBlocks)],
            network: this.#network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };
    }
 
     /**
     * Generates options for a request-withdraw transaction.
     * @param {number|string|BigInt} id - The unique ID of the vault to withdraw from.
     * @returns {Object} Transaction options for @stacks/transactions.
     * @throws {Error} If vault ID is missing or invalid.
     */
     getWithdrawOptions(id) {
        this.#validateVaultId(id);
        return {
            contractAddress: this.#contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'request-withdraw',
            functionArgs: [uintCV(id)],
            network: this.#network,
            anchorMode: AnchorMode.Any,
            postConditionMode: PostConditionMode.Deny,
        };
    }

     /**
     * Internal helper to validate vault IDs.
     * @param {number|string|BigInt} id - The vault ID to validate.
     * @private
     * @throws {Error} If vault ID is missing or invalid.
     */
     #validateVaultId(id) {
        if (id === undefined || id === null) {
            throw new Error('Vault ID is required');
        }
    }
}
