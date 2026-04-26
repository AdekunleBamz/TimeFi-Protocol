
export const microStxToStx = (v) => Number(v) / 1e6;

export const stxToMicroStx = (v) => Math.round(Number(v) * 1e6);

export const calcFee = (amount, bps) => Math.floor(Number(amount) * Number(bps) / 10000);

export const calcNetAmount = (amount, bps) => Number(amount) - Math.floor(Number(amount) * Number(bps) / 10000);

export const blocksToSeconds = (blocks) => Number(blocks) * 600;

export const secondsToBlocks = (secs) => Math.ceil(Number(secs) / 600);

export const daysToBlocks = (days) => Math.round(Number(days) * 144);

export const blocksToDays = (blocks) => Number(blocks) / 144;

export const clamp = (v, mn, mx) => Math.min(Math.max(Number(v), Number(mn)), Number(mx));

export const bpsToPercent = (bps) => Number(bps) / 100;

/** Returns true when blocks is a valid positive integer. */
export const isValidBlockCount = (blocks) => Number.isInteger(Number(blocks)) && Number(blocks) > 0;

/** Returns true when a fee in basis points is within the 0-10000 range. */
export const isValidFeeBps = (bps) => Number.isInteger(Number(bps)) && Number(bps) >= 0 && Number(bps) <= 10000;

/** Returns the number of blocks remaining until a vault unlocks; 0 if already past. */
export const blocksRemaining = (depositHeight, lockPeriod, currentHeight) =>
  Math.max(0, Number(depositHeight) + Number(lockPeriod) - Number(currentHeight));

/** Returns the unlock block height for a vault. */
export const unlockHeight = (depositHeight, lockPeriod) => Number(depositHeight) + Number(lockPeriod);

/** Returns how far along (0-100) the lock period has progressed. */
export const lockProgress = (depositHeight, lockPeriod, currentHeight) => {
  const total = Number(lockPeriod);
  if (total <= 0) return 100;
  const elapsed = Math.min(total, Math.max(0, Number(currentHeight) - Number(depositHeight)));
  return Math.round((elapsed / total) * 100);
};

/** Converts a number of weeks to the equivalent block count (Stacks mainnet). */
export const weeksToBlocks = (weeks) => Math.round(Number(weeks) * 1008);

/** Returns the net deposit after applying a basis-point fee, floored to integer. */
export const netDeposit = (amount, feeBps) =>
  Math.floor(Number(amount) - Math.floor(Number(amount) * Number(feeBps) / 10000));

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
export const isValidBlockHeight = (h) => Number.isInteger(Number(h)) && Number(h) >= 0;
