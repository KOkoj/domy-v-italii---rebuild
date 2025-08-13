export const centsToEuros = (cents: number) => Number((cents / 100).toFixed(2));
export const eurosToCents = (euros: number) => Math.round(euros * 100);
