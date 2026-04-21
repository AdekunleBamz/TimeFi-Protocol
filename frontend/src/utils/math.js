
export const microStxToStx = (v) => Number(v) / 1e6;

export const stxToMicroStx = (v) => Math.round(Number(v) * 1e6);

export const calcFee = (amount, bps) => Math.floor(Number(amount) * Number(bps) / 10000);

export const calcNetAmount = (amount, bps) => Number(amount) - Math.floor(Number(amount) * Number(bps) / 10000);

export const blocksToSeconds = (blocks) => Number(blocks) * 600;

export const secondsToBlocks = (secs) => Math.ceil(Number(secs) / 600);

export const daysToBlocks = (days) => Math.round(Number(days) * 144);

export const blocksToDays = (blocks) => Number(blocks) / 144;

export const clamp = (v, mn, mx) => Math.min(Math.max(Number(v), Number(mn)), Number(mx));
