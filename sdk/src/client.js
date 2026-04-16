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
import { CONTRACT_ADDRESS, CONTRACT_NAMES, MICROSTX_IN_STX } from './constants.js';

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
        const vault = await this.getVault(id);
        return vault.owner;
    }
 
    /**
     * Alias for getVaultStatus. Retrieves the human-readable status of a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<string>} 'active' or 'expired'.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultState(id) {
        return this.getVaultStatus(id);
    }

    /**
     * Checks if a specific vault is currently active.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if active.
     */
    async isVaultActive(id) {
        return this.isActive(id);
    }

    /**
     * Checks if a specific vault has expired.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if expired.
     */
    async isVaultExpired(id) {
        return this.isExpired(id);
    }
 
    /**
     * Retrieves the current balance (in microSTX) of a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The vault balance in microSTX.
     * @throws {Error} If vault ID is missing or invalid.
     */
      async getVaultAmount(id) {
        const vault = await this.getVault(id);
        return vault.amount;
    }
 
    /**
     * Alias for getVaultAmount. Retrieves the locked STX amount in a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The amount in microSTX.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultBalance(id) {
        return this.getVaultAmount(id);
    }
 
    /**
     * Gets the specific block height at which a vault can be unlocked.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The block height for unlocking.
     * @throws {Error} If vault ID is missing or invalid.
     */
      async getUnlockBlock(id) {
        const vault = await this.getVault(id);
        return vault['unlock-time'];
    }
 
    /**
     * Alias for getUnlockBlock. Retrieves the block height at which a vault can be unlocked.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The unlock block height.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultUnlockBlock(id) {
        return this.getUnlockBlock(id);
    }

    /**
     * Alias for getUnlockBlock. Retrieves the block height at which a vault can be unlocked.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The unlock block height.
     */
    async getVaultUnlockHeight(id) {
        return this.getUnlockBlock(id);
    }
 
    /**
     * Retrieves the original lock duration (in blocks) for a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The lock duration in blocks.
     * @throws {Error} If vault ID is missing or invalid.
     */
      async getVaultDuration(id) {
        const vault = await this.getVault(id);
        return vault['unlock-time'] - vault['lock-time'];
    }
 
    /**
     * Alias for getVaultDuration. Retrieves the lock duration (in blocks) of a vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The duration in blocks.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultLockPeriod(id) {
        return this.getVaultDuration(id);
    }
 
    /**
     * Retrieves the block height at which a specific vault was created.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The creation block height.
     * @throws {Error} If vault ID is missing or invalid.
     */
      async getCreatedAt(id) {
        const vault = await this.getVault(id);
        return vault['lock-time'];
    }
 
    /**
     * Alias for getCreatedAt. Retrieves the block height at which a vault was created.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} The creation block height.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultCreationBlock(id) {
        return this.getCreatedAt(id);
    }
 
    /**
     * Checks if a specific vault's lock duration has expired.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<boolean>} True if the lock period has ended.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async isExpired(id) {
        this.#validateVaultId(id);
        const timeRemaining = await this.getTimeRemaining(id);
        return timeRemaining === 0;
    }
 
    /**
     * Returns a human-readable status for a specific vault.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<'Active'|'Expired'|'Unknown'>} The current vault status.
     * @throws {Error} If vault ID is missing or invalid.
     */
     async getVaultStatus(id) {
        const [active, timeRemaining] = await Promise.all([
            this.isActive(id),
            this.getTimeRemaining(id)
        ]);
 
        if (active && timeRemaining > 0) return 'Active';
        if (timeRemaining === 0) return 'Expired';
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
     * Retrieves all core details for a specific vault in a single object.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} Object containing owner, balance, duration, and status.
     * @throws {Error} If vault ID is missing or invalid.
     */
       async getVaultSummary(id) {
        const [details, timeRemaining, createdAt, unlockBlock] = await Promise.all([
            this.getVaultDetails(id),
            this.getTimeRemaining(id),
            this.getCreatedAt(id),
            this.getUnlockBlock(id)
        ]);
 
        return { ...details, timeRemaining, createdAt, unlockBlock };
    }
 
    /**
     * Retrieves an extended summary of a vault, including expiry status.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} Object containing summary and expiry.
     * @throws {Error} If vault ID is missing or invalid.
     */
    async getVaultDetailsExtended(id) {
        const [summary, expired] = await Promise.all([
            this.getVaultSummary(id),
            this.isExpired(id)
        ]);
        return { ...summary, expired };
    }

    /**
     * Retrieves static metadata for a vault (owner, creation block, duration).
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<Object>} Object containing static vault properties.
     */
     async getVaultStaticData(id) {
        const [owner, createdAt, duration] = await Promise.all([
            this.getVaultOwner(id),
            this.getCreatedAt(id),
            this.getVaultDuration(id)
        ]);
        return { id, owner, createdAt, duration };
    }
 
    /**
     * Gets the number of blocks elapsed since a vault was created.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} Blocks since creation.
     */
     async getVaultAge(id) {
        const [createdAt, currentHeight] = await Promise.all([
            this.getCreatedAt(id),
            this.getBlockHeight()
        ]);
        return Math.max(0, currentHeight - createdAt);
    }
 
    /**
     * Calculates the number of blocks remaining until a vault can be unlocked.
     * @param {number|string|BigInt} id - The unique ID of the vault.
     * @returns {Promise<number>} Remaining blocks until unlock height.
     */
    async getVaultRemainingBlocks(id) {
        const [unlockBlock, currentHeight] = await Promise.all([
            this.getUnlockBlock(id),
            this.getBlockHeight()
        ]);
        return Math.max(0, unlockBlock - currentHeight);
    }
 
    /**
     * Estimates the Annual Percentage Yield (APY) for a hypothetical vault.
     * @param {number} lockDurationBlocks - Duration in blocks.
     * @returns {Promise<number>} The estimated APY as a percentage.
     */
     async getVaultApy(lockDurationBlocks) {
        if (!lockDurationBlocks || lockDurationBlocks <= 0) throw new Error('Lock duration must be greater than 0');
        // This is a client-side calculation based on protocol rules (placeholder for now)
        // Simplified formula: (bonus_per_block * blocks_per_year) / principal
        return 5.0; // Placeholder 5% APY
    }
 
    /**
     * Retrieves the complete protocol configuration.
     * @returns {Promise<Object>} Object containing version and status.
     */
     async getProtocolConfig() {
        return this.getEmergencyStatus();
    }
 
    /**
     * Retrieves the core contract metadata (address and name).
     * @returns {Object} Contract address and vault contract name.
     */
     getContractMetadata() {
        return {
            address: this.#contractAddress,
            name: CONTRACT_NAMES.VAULT
        };
    }
 
    /**
     * Retrieves aggregated protocol metrics.
     * @returns {Promise<Object>} Object containing TVL, vault count, and block height.
     */
     async getProtocolMetrics() {
        const [stats, blockHeight] = await Promise.all([
            this.getProtocolStats(),
            this.getBlockHeight()
        ]);
        return { ...stats, blockHeight };
    }
 
    /**
     * Retrieves an aggregated summary for a specific account.
     * @param {string} address - The Stacks address to query.
     * @returns {Promise<Object>} Object containing address, nonce, balance, and vault data.
     * @throws {Error} If address is missing.
     */
      async getAccountSummary(address) {
        const data = await this.getAccountData(address);
        return {
            ...data,
            vaultCount: data.vaults.length
        };
    }
 
    /**
     * Retrieves a high-level overview for a specific account, including protocol vitals.
     * @param {string} address - The Stacks address to query.
     * @returns {Promise<Object>} Object containing account summary and protocol vitals.
     * @throws {Error} If address is missing.
     */
    async getAccountOverview(address) {
        const [account, vitals] = await Promise.all([
            this.getAccountSummary(address),
            this.getProtocolVitals()
        ]);
        return { ...account, protocol: vitals };
    }

    /**
     * Alias for getAccountOverview. Retrieves account and protocol health data.
     * @param {string} address - The Stacks address to query.
     * @returns {Promise<Object>} Aggregated vitals.
     */
    async getAccountVitals(address) {
        return this.getAccountOverview(address);
    }

    /**
     * Alias for getAccountSTXBalance. Retrieves the STX balance of an account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} Balance in microSTX.
     */
    async getAccountBalance(address) {
        return this.getSTXBalance(address);
    }
 
    /**
     * Retrieves all global protocol data.
     * @returns {Promise<Object>} Object containing metrics, metadata, and config.
     */
     async getProtocolData() {
        const [metrics, metadata, config] = await Promise.all([
            this.getProtocolMetrics(),
            this.getContractMetadata(),
            this.getProtocolConfig()
        ]);
        return { ...metrics, metadata, ...config };
    }
 
    /**
     * Retrieves a simplified summary of global protocol data.
     * @returns {Promise<Object>} Object containing metrics and essential metadata.
     */
     async getProtocolDataSummary() {
        const [metrics, metadata] = await Promise.all([
            this.getProtocolMetrics(),
            this.getContractMetadata()
        ]);
        return { ...metrics, contract: metadata.address };
    }
 
    /**
     * Retrieves the essential health metrics of the protocol.
     * @returns {Promise<Object>} Object containing paused status, version, and TVL.
     */
    async getProtocolVitals() {
        const [status, tvl] = await Promise.all([
            this.getEmergencyStatus(),
            this.getTVL()
        ]);
        return { ...status, tvl };
    }
 
    /**
     * Gets the total number of vaults created in the protocol.
     * @returns {Promise<number>} The total vault count.
     */
       async getVaultCount() {
        return this.callReadOnly('get-vault-count', []);
    }
 
    /**
     * Alias for getVaultCount. Gets the total number of vaults created in the protocol.
     * @returns {Promise<number>} The total vault count.
     */
    async getProtocolVaultCount() {
        return this.getVaultCount();
    }
 
    /**
     * Gets the ID of the most recently created vault.
     * @returns {Promise<number>} The last vault ID.
     */
    async getLastVaultId() {
        const count = await this.getVaultCount();
        return count > 0 ? count : 0;
    }
 
    /**
     * Retrieves a vault ID by its global registration index.
     * @param {number|string|BigInt} index - The global index of the vault.
     * @returns {Promise<number>} The vault ID.
     * @throws {Error} If index is missing or invalid.
     */
     async getVaultIdByIndex(index) {
        this.#validateNonNegativeInteger(index, 'Index');
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
        const ownerAddress = this.#validateRequiredString(owner, 'Owner address');
        this.#validateNonNegativeInteger(index, 'Index');
        return this.callReadOnly('get-vault-id-by-owner-index', [principalCV(ownerAddress), uintCV(index)]);
    }
 
    /**
     * Retrieves the current nonce for a specific account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} The account nonce.
     * @throws {Error} If address is missing.
     */
      async getNonce(address) {
        const account = this.#validateRequiredString(address, 'Address');
        return this.callReadOnly('get-nonce', [principalCV(account)]);
    }
 
    /**
     * Alias for getNonce. Retrieves the current nonce for a specific account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} The account nonce.
     * @throws {Error} If address is missing.
     */
    async getAccountNonce(address) {
        return this.getNonce(address);
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
        const account = this.#validateRequiredString(address, 'Address');
        return this.callReadOnly('get-stx-balance', [principalCV(account)]);
    }
 
    /**
     * Alias for getSTXBalance. Retrieves the liquid STX balance of a specific account.
     * @param {string} address - The Stacks address to check.
     * @returns {Promise<number>} The balance in microSTX.
     * @throws {Error} If address is missing.
     */
    async getAccountSTXBalance(address) {
        return this.getSTXBalance(address);
    }
 
    /**
     * Gets the current Stacks blockchain block height.
     * @returns {Promise<number>} The current block height.
     */
      async getBlockHeight() {
        return this.callReadOnly('get-block-height', []);
    }
 
    /**
     * Alias for getBlockHeight. Gets the current Stacks blockchain block height.
     * @returns {Promise<number>} The current block height.
     */
    async getProtocolBlockHeight() {
        return this.getBlockHeight();
    }
 
    /**
     * Retrieves all vault IDs owned by a specific account.
     * @param {string} owner - The Stacks address to query.
     * @returns {Promise<number[]>} Array of vault IDs.
     * @throws {Error} If owner address is missing.
     */
      async getVaultsByOwner(owner) {
        const ownerAddress = this.#validateRequiredString(owner, 'Owner address');
        const count = await this.getVaultsByOwnerCount(ownerAddress);
        const tasks = [];
        for (let i = 0; i < count; i++) {
            tasks.push(this.getVaultIdByOwnerIndex(ownerAddress, i));
        }
        return Promise.all(tasks);
    }
 
    /**
     * Gets the number of vaults owned by a specific account.
     * @param {string} owner - The Stacks address of the owner.
     * @returns {Promise<number>} The vault count for the owner.
     * @throws {Error} If owner address is missing.
     */
     async getVaultsByOwnerCount(owner) {
        const ownerAddress = this.#validateRequiredString(owner, 'Owner address');
        return this.callReadOnly('get-vault-count-by-owner', [principalCV(ownerAddress)]);
    }
 
    /**
     * Alias for getVaultsByOwnerCount. Gets the number of vaults owned by a specific account.
     * @param {string} address - The Stacks address of the owner.
     * @returns {Promise<number>} The vault count for the owner.
     * @throws {Error} If address is missing.
     */
    async getAccountVaultCount(address) {
        return this.getVaultsByOwnerCount(address);
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
 
    /**
     * Alias for getTVL. Gets the current Total Value Locked (TVL) in the protocol.
     * @returns {Promise<number>} The TVL in microSTX.
     */
    async getProtocolTVL() {
        return this.getTVL();
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
        const amountMicroStx = this.#toMicroStx(amountSTX);
        const normalizedLockDuration = this.#validatePositiveInteger(lockDurationBlocks, 'Lock duration');
        return {
            contractAddress: this.#contractAddress,
            contractName: CONTRACT_NAMES.VAULT,
            functionName: 'create-vault',
            functionArgs: [uintCV(amountMicroStx), uintCV(normalizedLockDuration)],
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

        if (typeof id === 'bigint') {
            if (id <= 0n) throw new Error('Vault ID must be a positive integer');
            return;
        }

        if (typeof id === 'number') {
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error('Vault ID must be a positive integer');
            }
            return;
        }

        if (typeof id === 'string') {
            const normalized = id.trim();
            if (!/^\d+$/.test(normalized) || BigInt(normalized) <= 0n) {
                throw new Error('Vault ID must be a positive integer');
            }
            return;
        }

        throw new Error('Vault ID must be a positive integer');
    }

    /**
     * Internal helper to validate non-negative integer-like values.
     * @param {number|string|BigInt} value - Value to validate.
     * @param {string} label - Field name used in error messages.
     * @private
     */
    #validateNonNegativeInteger(value, label) {
        if (value === undefined || value === null) {
            throw new Error(`${label} is required`);
        }

        if (typeof value === 'bigint') {
            if (value < 0n) throw new Error(`${label} must be a non-negative integer`);
            return;
        }

        if (typeof value === 'number') {
            if (!Number.isInteger(value) || value < 0) {
                throw new Error(`${label} must be a non-negative integer`);
            }
            return;
        }

        if (typeof value === 'string') {
            const normalized = value.trim();
            if (!/^\d+$/.test(normalized) || BigInt(normalized) < 0n) {
                throw new Error(`${label} must be a non-negative integer`);
            }
            return;
        }

        throw new Error(`${label} must be a non-negative integer`);
    }

    /**
     * Internal helper to validate required string values.
     * @param {string} value - Value to validate.
     * @param {string} label - Field name used in error messages.
     * @returns {string} Trimmed string value.
     * @private
     */
    #validateRequiredString(value, label) {
        if (typeof value !== 'string' || value.trim() === '') {
            throw new Error(`${label} is required`);
        }
        return value.trim();
    }

    /**
     * Converts an STX amount to microSTX for contract-safe uint values.
     * @param {number|string} amountSTX - Amount in STX.
     * @returns {number} Amount in microSTX.
     * @private
     */
    #toMicroStx(amountSTX) {
        const parsedAmount = Number(amountSTX);
        if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
            throw new Error('Amount must be greater than 0 STX');
        }

        const microStx = Math.round(parsedAmount * MICROSTX_IN_STX);
        if (!Number.isSafeInteger(microStx) || microStx <= 0) {
            throw new Error('Amount must be a valid STX value');
        }

        return microStx;
    }

    /**
     * Validates a positive integer-like value.
     * @param {number|string|BigInt} value - Value to validate.
     * @param {string} label - Field label used in errors.
     * @returns {number|BigInt} Normalized numeric value.
     * @private
     */
    #validatePositiveInteger(value, label) {
        if (typeof value === 'bigint') {
            if (value <= 0n) throw new Error(`${label} must be a positive integer`);
            return value;
        }

        const parsedValue = Number(value);
        if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
            throw new Error(`${label} must be a positive integer`);
        }

        return parsedValue;
    }
}
