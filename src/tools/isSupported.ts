import { WP } from "../data/constants";

export const isPerformanceSupported = (): boolean => {
  return WP && !!WP.getEntriesByType && !!WP.now && !!WP.mark;
};
