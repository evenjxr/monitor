interface Navigator {
  userAgent: string
  estimate: any
  storage: any
  deviceMemory?: number
  hardwareConcurrency?: number
  connection?: string
  effectiveType?: string
  serviceWorker?: {
    controller?: string
  }
  sendBeacon?: string
}

export const W = window;
export const C = W.console;
export const D = document;
export const WN = W.navigator as unknown as Navigator;
export const WP = W.performance;
export const V = "1.0.0"

// 获取用户的内存
export const getDM = () => WN.deviceMemory ?? 0;
// 获取用户的CPU核数
export const getHC = () => WN.hardwareConcurrency ?? 0;
