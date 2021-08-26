import { W } from "../data/constants";

export const roundByTwo = (num: number) => {
  return parseFloat(num.toFixed(2));
};

export const pushTask = (cb: any): void => {
  if ("requestIdleCallback" in W) {
    W.requestIdleCallback(cb, {
      timeout: 3000
    });
  }
};

export const convertToKB = (amount: number | undefined): number => {
  return amount ? parseFloat((amount / 1024 / 1024).toFixed(2)) : 0;
};
