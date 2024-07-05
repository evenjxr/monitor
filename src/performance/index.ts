/** @format */
import { po, poDisconnect } from "./performanceObserver"
import {
  IPerformanceEntry,
  IReportData,
  IperformanceConfig
} from "../typings/types"
import { D, W } from "../data/constants"
import { roundByTwo } from "../helpers/utils"
import { getVitalsScore } from "../helpers/vitalsScore"
import { getNavigationTiming } from "../helpers/getNavigationTiming"
import { getNetworkInformation } from "../helpers/getNetworkInformation"
import { perfObservers } from "./observerInstances"

const quota = [
  "fp",
  "fcp",
  "lcp",
  "dcl",
  "l",
  "fps", // 未实现
  "cls",
  "fid",
  "tti",
  "tbt",
  "resource"
]

// IperformanceContent {
//   fp: '',
//   fcp: '', good 1.8 improvement 3.0 poor
//   lcp: '',  good 2.5 improvement 4.0 poor

//   dcl: '',
//   l: '',
//   fps: ''

//   cls: '', good 0.1 improvement 0.25 poor
//   fid: '', good 0.1 improvement 0.3 poor
//   tti: '', performance.timing.domInteractive 可互动时间

//   longtasks: number
//   events: number
// }

export default class PerformanceQuotaCollect {
  private quota: any = {}
  private perfObservers: any = {}
  private performanceConfig: IperformanceConfig
  private tbtTotalTime: number = 0
  private clsNum: number = 0
  private resourceSize = {
    beacon: {
      size: 0,
      length: 0
    },
    css: {
      size: 0,
      length: 0
    },
    fetch: {
      size: 0,
      length: 0
    },
    img: {
      size: 0,
      length: 0
    },
    other: {
      size: 0,
      length: 0
    },
    script: {
      size: 0,
      length: 0
    },
    xmlhttprequest: {
      size: 0,
      length: 0
    }
  }

  timingInfo: any
  netInfo: any
  reportData: IReportData

  constructor(config: IperformanceConfig, reportData: IReportData) {
    //初始化
    if (typeof D.hidden !== "undefined") {
      D.addEventListener("visibilitychange", this.disconnectPerfObservers)
    }
    // if (W?.requestIdleCallback) {
    //   W.requestIdleCallback(this.disconnectPerfObservers)
    // }

    setTimeout(this.disconnectPerfObservers, 4000)

    this.performanceConfig = config
    this.initQuotaObservers()
    this.initNetAndNavigationTiming()
    this.reportData = reportData
  }

  initNetAndNavigationTiming() {
    // 记录系统DNS请求+白屏时间等
    this.timingInfo = getNavigationTiming()
    // 记录用户网速 H5+多普勒测试
    this.netInfo = getNetworkInformation()
  }

  private addQuotaItem = (name: string, info: any) => {
    this.quota[name] = info
    // console.log(name, info)
  }

  private paintQuotaCb = (performanceEntries: IPerformanceEntry[]) => {
    performanceEntries.forEach((entry) => {
      const { name, startTime } = entry
      const value =
        typeof startTime === "number" ? roundByTwo(startTime) : startTime
      this.addQuotaItem(name === "first-contentful-paint" ? "fcp" : "fp", {
        type: name,
        value,
        vitalsScorce: getVitalsScore(value, name),
        originData: JSON.stringify(entry)
      })
    })
    poDisconnect("paint")
  }

  private largestContentfulPaintQuotaCb = (
    performanceEntries: IPerformanceEntry[]
  ) => {
    const lastEntry = performanceEntries.pop()
    if (lastEntry) {
      const { entryType, renderTime, loadTime, element } = lastEntry
      const value = roundByTwo(renderTime || loadTime)
      this.addQuotaItem("lcp", {
        type: entryType,
        value,
        element: String(element),
        vitalsScorce: getVitalsScore(value, entryType),
        originData: JSON.stringify(lastEntry)
      })
    }
    poDisconnect("largestContentfulPaint")
  }

  private domConetentLoadedQuotaCb = (event: Event) => {
    // performance.timing.domContentLoadedEventStart - performance.timing.fetchStart
    if (event) {
      const { timeStamp, type } = event
      const value = roundByTwo(timeStamp)
      this.addQuotaItem("dcl", {
        type,
        value,
        vitalsScorce: "暂无标准",
        originData: JSON.stringify(event)
      })
    }
    D.removeEventListener("DOMContentLoaded", this.domConetentLoadedQuotaCb)
  }

  private loadQuotaCb = (event: Event) => {
    if (event) {
      const { timeStamp, type } = event
      const value = roundByTwo(timeStamp)
      this.addQuotaItem("l", {
        type,
        value,
        vitalsScorce: "暂无标准",
        originData: timeStamp
      })
    }
    W.removeEventListener("load", this.domConetentLoadedQuotaCb)
  }

  private layoutShiftQuotaCb = (performanceEntries: IPerformanceEntry[]) => {
    performanceEntries.forEach((entry) => {
      if (!entry.hadRecentInput && entry.value) {
        this.clsNum += entry.value
      }
    })
    this.clsNum = roundByTwo(this.clsNum)
    this.addQuotaItem("cls", {
      type: "layout-shift",
      value: this.clsNum,
      vitalsScorce: getVitalsScore(this.clsNum, "layout-shift"),
      originData: ""
    })
    // poDisconnect("layoutShift")
  }

  private firstInputQuotaCb = (performanceEntries: IPerformanceEntry[]) => {
    // 取最后的一位为我们希望所获取的时间点
    const lastEntry = performanceEntries.pop()
    if (lastEntry) {
      const { entryType, processingStart, startTime } = lastEntry
      const value = roundByTwo(processingStart - startTime)
      this.addQuotaItem("fid", {
        type: entryType,
        value,
        vitalsScorce: getVitalsScore(value, entryType),
        originData: JSON.stringify(lastEntry)
      })
    }
    // poDisconnect("firstInput")
  }

  private totalBlockingTimeQuotaCb = (
    performanceEntries: IPerformanceEntry[]
  ): void => {
    performanceEntries.forEach((entry) => {
      if (entry.name === "self" && entry.startTime > this.quota.fcp?.value) {
        // 长任务超过50ms就是block
        const blockingTime = entry.duration - 50
        if (blockingTime > 0) {
          this.tbtTotalTime += blockingTime
        }
      }
    })
    this.addQuotaItem("tbt", {
      type: "longtask",
      value: this.tbtTotalTime,
      vitalsScorce: "暂无标准"
    })
    poDisconnect("longtask")
  }

  private resourceQuotaCb = (performanceEntries: IPerformanceEntry[]) => {
    performanceEntries.forEach((entry) => {
      if (entry.decodedBodySize && entry.initiatorType) {
        const bodySize = entry.decodedBodySize / 1024
        this.resourceSize[entry.initiatorType].size += bodySize
        this.resourceSize[entry.initiatorType].length += 1
      }
    })
    let size = 0
    Object.values(this.resourceSize).map((e) => (size += e.size))
    this.addQuotaItem("resource", {
      type: "resource",
      size: roundByTwo(size),
      originData: this.resourceSize
    })

    // console.log(1111, this.resourceSize)
    // logMetirc(
    //   {
    //     totalSize: totalSize.toFixed(2),
    //     ...resourceSize
    //   },
    //   "resource",
    //   {}
    // )
    // poDisconnect("resource")
    // }
  }

  initQuotaObservers() {
    perfObservers["paint"] = po("paint", this.paintQuotaCb)
    perfObservers["largestContentfulPaint"] = po(
      "largest-contentful-paint",
      this.largestContentfulPaintQuotaCb
    )
    D.addEventListener("DOMContentLoaded", this.domConetentLoadedQuotaCb)
    W.addEventListener("load", this.loadQuotaCb)

    perfObservers["layoutShift"] = po("layout-shift", this.layoutShiftQuotaCb)
    perfObservers["firstInput"] = po("first-input", this.firstInputQuotaCb)
    perfObservers["longtask"] = po("longtask", this.totalBlockingTimeQuotaCb)
    //
    // perfObservers["element"] = po("element", initElementTiming)
    this.perfObservers["resource"] = po("resource", this.resourceQuotaCb)
  }

  disconnectPerfObservers = (): void => {
    ;[
      "paint",
      "firstInput",
      "largestContentfulPaint",
      "resource",
      "layoutShift",
      "element"
      // "longtask"
    ].forEach((ele) => {
      poDisconnect(ele)
    })
    console.log("上报")
    this.reportData(this.quota)
  }
}
