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
        try {
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
        } catch (error) {
            throw new Error(`Failed to call read-only function "${functionName}": ${error.message}`);
        }
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
     * Retrieves the original lock duration (in blocks) for a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The lock duration in blocks.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultDuration(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-vault-duration', [uintCV(id)]);
    }
 
    /**
     * Retrieves the block height at which a specific vault was created.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The creation block height.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getCreatedAt(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('get-created-at', [uintCV(id)]);
    }
 
    /**
     * Checks if a specific vault's lock duration has expired.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if the lock period has ended.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async isExpired(id) {
        this.#validateVaultId(id);
        return this.callReadOnly('is-expired', [uintCV(id)]);
    }
 
    /**
     * Returns a human-readable status for a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<'Active'|'Expired'|'Unknown'>} The current vault status.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultStatus(id) {
        const [active, expired] = await Promise.all([
            this.isActive(id),
            this.isExpired(id)
        ]);
 
        if (active && !expired) return 'Active';
        if (expired) return 'Expired';
        return 'Unknown';
    }
 
    /**
     * Retrieves all core details for a specific vault in a single object.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} Object containing owner, balance, duration, and status.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultDetails(id) {
        const [owner, amount, duration, status] = await Promise.all([
            this.getVaultOwner(id),
            this.getVaultAmount(id),
            this.getVaultDuration(id),
            this.getVaultStatus(id)
        ]);
 
        return { id, owner, amount, duration, status };
    }
 
    /**
     * Gets the total number of vaults created in the protocol.
     * @returns {Promise<number>} The total vault count.
     */
     async getVaultCount() {
        return this.callReadOnly('get-vault-count', []);
    }
 
    /**
     * Retrieves a vault ID by its global registration index.
     * @param {number|string|BigInt} index - The global index of the vault.
     * @returns {Promise<number>} The vault ID.
     * @throws {Error} If index is missing or invalid.
     */
     async getVaultIdByIndex(index) {
        if (index === undefined || index === null) {
            throw new Error('Index is required');
        }
        return this.callReadOnly('get-vault-id-by-index', [uintCV(index)]);
    }
 
    /**
     * Retrieves a vault ID by its owner-specific index.
     * @param {string} owner - The Stacks address of the owner.
     * @param {number|string|BigInt} index - The index of the vault for this owner.
     * @returns {Promise<number>} The vault ID.
     * @throws {Error} If owner or index is missing.
     */
     async getVaultIdByOwnerIndex(owner, index) {
        if (!owner) throw new Error('Owner address is required');
        if (index === undefined || index === null) throw new Error('Index is required');
        return this.callReadOnly('get-vault-id-by-owner-index', [principalCV(owner), uintCV(index)]);
    }
 
    /**
     * Retrieves the current nonce for a specific account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} The account nonce.
     * @throws {Error} If address is missing.
     */
     async getNonce(address) {
        if (!address) throw new Error('Address is required');
        return this.callReadOnly('get-nonce', [principalCV(address)]);
    }
 
    /**
     * Retrieves global protocol statistics.
     * @returns {Promise<Object>} Object containing TVL and total vault count.
     */
     async getProtocolStats() {
        const [tvl, count] = await Promise.all([
            this.getTVL(),
            this.getVaultCount()
        ]);
        return { tvl, count };
    }
 
    /**
     * Retrieves the liquid STX balance of a specific account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} The balance in microSTX.
     * @throws {Error} If address is missing.
     */
     async getSTXBalance(address) {
        if (!address) throw new Error('Address is required');
        return this.callReadOnly('get-stx-balance', [principalCV(address)]);
    }
 
    /**
     * Gets the current Stacks blockchain block height.
     * @returns {Promise<number>} The current block height.
     */
     async getBlockHeight() {
        return this.callReadOnly('get-block-height', []);
    }
 
    /**
     * Retrieves all vault IDs owned by a specific account.
     * @param {string} owner - The Stacks address to query.
     * @returns {Promise<number[]>} Array of vault IDs.
     * @throws {Error} If owner address is missing.
     */
     async getVaultsByOwner(owner) {
        if (!owner) throw new Error('Owner address is required');
        // This is a placeholder for a more complex iteration if the contract doesn't support bulk fetch
        // Assuming there's a getter for count per owner
        const count = await this.callReadOnly('get-vault-count-by-owner', [principalCV(owner)]);
        const tasks = [];
        for (let i = 0; i < count; i++) {
            tasks.push(this.getVaultIdByOwnerIndex(owner, i));
        }
        return Promise.all(tasks);
    }
 
    /**
     * Retrieves all relevant blockchain data for a specific account.
     * @param {string} address - The Stacks address to query.
     * @returns {Promise<Object>} Object containing nonce, STX balance, and vault IDs.
     * @throws {Error} If address is missing.
     */
     async getAccountData(address) {
        const [nonce, balance, vaults] = await Promise.all([
            this.getNonce(address),
            this.getSTXBalance(address),
            this.getVaultsByOwner(address)
        ]);
        return { address, nonce, balance, vaults };
    }
 
    /**
     * Checks if the TimeFi Protocol is currently in a paused state.
     * @returns {Promise<boolean>} True if the protocol is paused.
     */
     async isPaused() {
        return this.callReadOnly('is-paused', []);
    }
 
    /**
     * Retrieves the semantic version of the TimeFi Protocol contract.
     * @returns {Promise<string>} The protocol version string.
     */
     async getProtocolVersion() {
        return this.callReadOnly('get-protocol-version', []);
    }
 
    /**
     * Retrieves the current emergency status and protocol version.
     * @returns {Promise<Object>} Object containing version and pause status.
     */
    async getEmergencyStatus() {
        const [version, paused] = await Promise.all([
            this.getProtocolVersion(),
            this.isPaused()
        ]);
        return { version, paused };
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
