/**
 * TimeFi Protocol - Core Protocol Entry Point
 *
 * Core protocol implementation for TimeFi ecosystem.
 * Provides protocol configuration, initialization, and utilities.
 *
 * @module timefi-protocol
 * @author adekunlebamz
 * @example
 * import { initializeProtocol, getProtocolVersion } from 'timefi-protocol';
 *
 * const protocol = initializeProtocol({ network: 'mainnet' });
 * console.log(getProtocolVersion()); // '1.0.0'
 */

const PROTOCOL_VERSION = '1.0.0';

/**
 * Protocol configuration defaults
 * @type {Object}
 */
const config = {
  network: 'stacks',
  version: PROTOCOL_VERSION,
  features: {
    timeLock: true,
    vaults: true,
    governance: true,
    rewards: true
  }
};

/**
 * Initialize the TimeFi protocol with custom options.
 * @param {Object} [options={}] - Custom configuration options
 * @returns {Object} Initialized protocol configuration
 */
function initializeProtocol(options = {}) {
  return {
    ...config,
    ...options,
    initialized: true
  };
}

/**
 * Get the current protocol version.
 * @returns {string} Protocol version string
 */
function getProtocolVersion() {
  return PROTOCOL_VERSION;
}

/**
 * Get the default protocol configuration.
 * @returns {Object} Protocol configuration object
 */
function getProtocolConfig() {
  return config;
}

export {
  initializeProtocol,
  getProtocolVersion,
  getProtocolConfig,
  config,
  PROTOCOL_VERSION
};

export default {
  initializeProtocol,
  getProtocolVersion,
  getProtocolConfig,
  config,
  PROTOCOL_VERSION
};
