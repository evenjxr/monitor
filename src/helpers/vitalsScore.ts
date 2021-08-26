import type { IVitalsScore } from "../typings/types";
// export type IVitalsScore = "good" | "needsImprovement" | "poor" | null;

export const getVitalsScore = (
  data: number | object,
  measureName: string
): IVitalsScore => {
  if (measureName === "fcp") {
    return data < 1.8 * 1000
      ? "good"
      : data < 3 * 1000
      ? "needsImprovement"
      : "poor";
  } else if (measureName === "fp") {
    return data < 2000 ? "good" : data < 4000 ? "needsImprovement" : "poor";
  } else if (measureName === "cls") {
    return data < 0.1 ? "good" : data < 0.25 ? "needsImprovement" : "poor";
  } else if (measureName === "lcp") {
    return data < 2.5 ? "good" : data < 4 ? "needsImprovement" : "poor";
  } else if (measureName === "fmp") {
    return data < 2.5 ? "good" : data < 4 ? "needsImprovement" : "poor";
  } else if (measureName === "fid") {
    // ms
    return data < 100 ? "good" : data < 300 ? "needsImprovement" : "poor";
  }
  return null;
};
