
/**
 * microStxToStx - Convert micro-STX to STX.
 * @param {number|string} v - Amount in micro-STX
 * @returns {number} Equivalent STX value, or 0 for invalid input
 */
export const microStxToStx = (v) => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n / 1e6 : 0;
};

/**
 * stxToMicroStx - Convert STX to micro-STX.
 * @param {number|string} v - Amount in STX
 * @returns {number} Equivalent micro-STX value rounded to nearest integer, or 0 for invalid input
 */
export const stxToMicroStx = (v) => {
    if (v === undefined || v === null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? Math.round(n * 1e6) : 0;
};

/**
 * calcFee - Calculate the protocol fee for a given amount and fee rate.
 * @param {number|string} amount - Amount in micro-STX
 * @param {number|string} bps - Fee rate in basis points (100 bps = 1%)
 * @returns {number} Fee in micro-STX rounded down, or 0 for invalid inputs
 */
export const calcFee = (amount, bps) => {
    const a = Number(amount);
    const b = Number(bps);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < 0) return 0;
    return Math.floor(a * b / 10000);
};

/**
 * calcNetAmount - Return the amount after subtracting the basis-point fee.
 * @param {number|string} amount - Amount in micro-STX
 * @param {number|string} bps - Fee rate in basis points
 * @returns {number} Net amount after fee deduction
 */
export const calcNetAmount = (amount, bps) => Number(amount) - Math.floor(Number(amount) * Number(bps) / 10000);

/**
 * blocksToSeconds - Convert a block count to an estimated duration in seconds.
 * Uses the 10-minute (600 s) Stacks mainnet block target.
 * @param {number|string} blocks - Number of Stacks blocks
 * @returns {number} Estimated duration in seconds
 */
export const blocksToSeconds = (blocks) => Number(blocks) * 600;

/**
 * secondsToBlocks - Convert a duration in seconds to an estimated block count.
 * @param {number|string} secs - Duration in seconds
 * @returns {number} Block count rounded up to ensure the full duration is covered
 */
export const secondsToBlocks = (secs) => Math.ceil(Number(secs) / 600);

/**
 * daysToBlocks - Convert days to the equivalent block count.
 * Uses 144 blocks per day (Stacks mainnet).
 * @param {number|string} days - Number of days
 * @returns {number} Rounded block count
 */
export const daysToBlocks = (days) => Math.round(Number(days) * 144);

/**
 * blocksToDays - Convert a block count to the equivalent number of days.
 * @param {number|string} blocks - Number of Stacks blocks
 * @returns {number} Approximate number of days
 */
export const blocksToDays = (blocks) => Number(blocks) / 144;

/**
 * clamp - Constrain a number within [min, max].
 * @param {number|string} v - Value to clamp
 * @param {number|string} mn - Minimum allowed value
 * @param {number|string} mx - Maximum allowed value
 * @returns {number} Value clamped to the specified range
 */
export const clamp = (v, mn, mx) => Math.min(Math.max(Number(v), Number(mn)), Number(mx));

/**
 * bpsToPercent - Convert basis points to a percentage number.
 * @param {number|string} bps - Basis points (100 bps = 1%)
 * @returns {number} Percentage value (e.g. 50 for 5000 bps)
 */
export const bpsToPercent = (bps) => Number(bps) / 100;

/**
 * isValidBlockCount - Return true when `blocks` is a valid positive integer.
 * @param {number|string} blocks - Value to validate
 * @returns {boolean}
 */
export const isValidBlockCount = (blocks) => {
    if (blocks === undefined || blocks === null) return false;
    const n = Number(blocks);
    return Number.isInteger(n) && n > 0;
};

/**
 * isValidFeeBps - Return true when the fee in basis points is within the 0–10 000 range.
 * @param {number|string} bps - Basis point value to validate
 * @returns {boolean}
 */
export const isValidFeeBps = (bps) => {
    if (bps === undefined || bps === null) return false;
    const n = Number(bps);
    return Number.isInteger(n) && n >= 0 && n <= 10000;
};

/**
 * blocksRemaining - Calculate blocks left until a vault unlocks.
 * @param {number|string} depositHeight - Block height when the vault was created
 * @param {number|string} lockPeriod - Lock duration in blocks
 * @param {number|string} currentHeight - Current Stacks block height
 * @returns {number} Blocks remaining (0 if already past the unlock point)
 */
export const blocksRemaining = (depositHeight, lockPeriod, currentHeight) =>
  Math.max(0, Number(depositHeight) + Number(lockPeriod) - Number(currentHeight));

/**
 * unlockHeight - Calculate the block height at which a vault becomes unlocked.
 * @param {number|string} depositHeight - Block height when the vault was created
 * @param {number|string} lockPeriod - Lock duration in blocks
 * @returns {number} Absolute unlock block height
 */
export const unlockHeight = (depositHeight, lockPeriod) => Number(depositHeight) + Number(lockPeriod);

/**
 * lockProgress - Return how far along the lock period is as a 0–100 percentage.
 * @param {number|string} depositHeight - Block height when the vault was created
 * @param {number|string} lockPeriod - Total lock duration in blocks
 * @param {number|string} currentHeight - Current Stacks block height
 * @returns {number} Progress percentage clamped to [0, 100]
 */
export const lockProgress = (depositHeight, lockPeriod, currentHeight) => {
  const total = Number(lockPeriod);
  if (total <= 0) return 100;
  const elapsed = Math.min(total, Math.max(0, Number(currentHeight) - Number(depositHeight)));
  return Math.round((elapsed / total) * 100);
};

/** Converts a number of weeks to the equivalent block count (Stacks mainnet). */
export const weeksToBlocks = (weeks) => Math.round(Number(weeks) * 1008);

/** Returns the net deposit amount after fee deduction. Returns 0 for invalid inputs. */
export const netDeposit = (amount, feeBps) => {
    const a = Number(amount);
    const b = Number(feeBps);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < 0) return 0;
    return Math.floor(a - Math.floor(a * b / 10000));
};

/** Returns true when the microSTX amount meets or exceeds the minimum deposit. */
export const meetsMinDeposit = (amount, minDeposit) => Number(amount) >= Number(minDeposit);

/** Returns true when the vault has passed its unlock block. */
export const isUnlocked = (depositHeight, lockPeriod, currentHeight) =>
  Number(currentHeight) >= Number(depositHeight) + Number(lockPeriod);

/** Converts microSTX to STX as a fixed-decimal string. */
export const microStxToStxFixed = (v, decimals = 2) => (Number(v) / 1e6).toFixed(decimals);

/** Returns estimated seconds remaining until a vault unlocks. */
export const secondsRemaining = (depositHeight, lockPeriod, currentHeight, blockTimeSec = 600) =>
  Math.max(0, blocksRemaining(depositHeight, lockPeriod, currentHeight) * blockTimeSec);

/** Clamps a number between lo and hi (inclusive). */
export const clampNum = (v, lo, hi) => Math.min(Number(hi), Math.max(Number(lo), Number(v)));

/** Returns true when a block height value is a non-negative integer. */
export const isValidBlockHeight = (h) => {
    if (h === undefined || h === null) return false;
    const n = Number(h);
    return Number.isInteger(n) && n >= 0;
};

/** Returns the estimated completion date for a vault given current block and block time. */
export const estimatedUnlockDate = (depositHeight, lockPeriod, currentHeight, blockTimeSec = 600) => {
  const secsLeft = secondsRemaining(depositHeight, lockPeriod, currentHeight, blockTimeSec);
  return new Date(Date.now() + secsLeft * 1000);
};
