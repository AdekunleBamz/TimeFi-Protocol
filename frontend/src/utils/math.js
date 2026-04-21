
export const microStxToStx = (v) => Number(v) / 1e6;

export const stxToMicroStx = (v) => Math.round(Number(v) * 1e6);

export const calcFee = (amount, bps) => Math.floor(Number(amount) * Number(bps) / 10000);

export const calcNetAmount = (amount, bps) => Number(amount) - Math.floor(Number(amount) * Number(bps) / 10000);
