/** @format */

import type { IVitalsScore } from "../typings/types"

export const getVitalsScore = (
  data: number,
  measureName: string
): IVitalsScore => {
  if (measureName === "first-contentful-paint") {
    return data < 1.8 * 1000
      ? "good"
      : data < 3 * 1000
      ? "needsImprovement"
      : "poor"
  } else if (measureName === "first-paint") {
    return data < 2000 ? "good" : data < 4000 ? "needsImprovement" : "poor"
  } else if (measureName === "layout-shift") {
    return data < 0.1 ? "good" : data < 0.25 ? "needsImprovement" : "poor"
  } else if (measureName === "largest-contentful-paint") {
    return data < 2.5 * 1000
      ? "good"
      : data < 4 * 1000
      ? "needsImprovement"
      : "poor"
  } else if (measureName === "fmp") {
    return data < 2.5 ? "good" : data < 4 ? "needsImprovement" : "poor"
  } else if (measureName === "first-input") {
    return data < 100 ? "good" : data < 300 ? "needsImprovement" : "poor"
  }
  return null
}
