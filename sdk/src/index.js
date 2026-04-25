"use strict";

/**
 * TimeFi SDK - Core library for interacting with TimeFi Protocol
 *
 * Provides a comprehensive JavaScript/TypeScript interface for interacting
 * with the TimeFi Protocol on the Stacks blockchain. Includes client methods
 * for vault operations, formatting utilities, and protocol constants.
 *
 * @module timefi-sdk
 * @example
 * import { TimeFiClient, formatSTX, CONTRACT_ADDRESS } from 'timefi-sdk';
 *
 * const client = new TimeFiClient('mainnet');
 * const vault = await client.getVault(1);
 * console.log(formatSTX(vault.amount));
 */

// Protocol constants and configuration
export * from './constants.js';

// Formatting utilities for STX, addresses, numbers, dates, and validation
// New validators: isValidStacksAddress, isValidSTXAmount, blocksToMs
export * from './format.js';

// Main client class for protocol interactions
export { TimeFiClient } from './client.js';

// Re-export commonly used Stacks utilities for convenience
export {
    uintCV,
    intCV,
    principalCV,
    bufferCV,
    stringAsciiCV,
    stringUtf8CV,
    noneCV,
    someCV,
    tupleCV,
    listCV,
    responseOkCV,
    responseErrorCV,
    AnchorMode,
    PostConditionMode
} from '@stacks/transactions';
