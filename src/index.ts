/** @format */

import ConfigManager from "./config"
import { isPerformanceSupported } from "./tools/isSupported"
import { W, WN } from "./data/constants"
import reportData from "./data/reportApi"
import ErrorTrace from "./error"
import { IMonitorOptions, IReportData } from "./typings/types"
import PerformanceQuotaCollect from "./performance"
import { convertToKB } from "./helpers/utils"
import { checkIsSpider, parseUserAgent } from "./tools/utils"

export default class Monitor {
  private v = "1.0.0"
  static _instance: null | InstanceType<typeof Monitor> = null
  private reportData: any
  private configManager: InstanceType<typeof ConfigManager> | null = null
  private projectInfo: any = {}
  private userAgentInfo: any = {}

  constructor(options: Partial<IMonitorOptions> = {}, reportFun?: IReportData) {
    if (!(this instanceof Monitor)) return
    if (Monitor._instance) return Monitor._instance
    if (checkIsSpider()) return
    const { postUrl } = options
    if (!postUrl) throw new Error(`监控平台${this.v}提示未配置上报url`)
    this.configManager = new ConfigManager(options)
    this.reportData =
      reportFun || (reportData(this.configManager.reportCofing) as IReportData)
    this.initError()
    this.initPerformance()

    // 管理离线缓存数据
    if (WN && WN.storage && typeof WN.storage.estimate === "function") {
      WN.storage.estimate().then(this.getStorageEstmateInfo)
    }

    Monitor._instance = this
    this.projectInfo = this.configManager?.baseInfo
    this.userAgentInfo = parseUserAgent(WN?.userAgent as string)
  }

  addError = (error: any, extraInfo?: object) => {}

  mergeInfo = (params: any, url?: string) => {
    if (Array.isArray(params)) {
      params.map((e) => {
        return {
          userAgentInfo: this.userAgentInfo,
          ...this.projectInfo,
          ...e
        }
      })
    } else if (typeof params === "object") {
      params = {
        userAgentInfo: this.userAgentInfo,
        ...this.projectInfo,
        ...params
      }
    }
    this.reportData(params, url)
  }

  initError() {
    this.addError = new ErrorTrace(
      this.configManager?.errConfig,
      this.mergeInfo
    ).addError
  }

  initPerformance() {
    if (!isPerformanceSupported) return
    const { sample } = this.configManager?.performanceCofing
    if ("PerformanceObserver" in W && Math.random() <= sample) {
      new PerformanceQuotaCollect(
        this.configManager?.performanceCofing,
        this.mergeInfo
      )
    }
  }

  getStorageEstmateInfo(storageInfo: StorageEstimate) {
    const estimateUsageDetails =
      "usageDetails" in storageInfo ? (storageInfo as any).usageDetails : {}
    const { quota, usage } = storageInfo
    const { caches, indexedDB, serviceWorkerRegistrations } =
      estimateUsageDetails
    console.log(3333, {
      quota: convertToKB(quota),
      usage: convertToKB(usage),
      caches: convertToKB(caches),
      indexedDB: convertToKB(indexedDB),
      serviceWorkerRegistrations: convertToKB(serviceWorkerRegistrations)
    })
    // ("storageEstimate", {
    //   quota: convertToKB(quota),
    //   usage: convertToKB(usage),
    //   caches: convertToKB(caches),
    //   indexedDB: convertToKB(indexedDB),
    //   serviceWorkerRegistrations: convertToKB(serviceWorkerRegistrations)
    // });
  }
}
