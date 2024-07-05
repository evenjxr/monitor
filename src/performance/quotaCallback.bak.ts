/** @format */

import {
  IPerformanceEntry,
  IPerformanceEntryInitiatorType
} from "../typings/types"
import { perfObservers } from "./observerInstances"
import { po, poDisconnect } from "./performanceObserver"
import { logMetirc, metrics } from "../data/log"

export const initFirstPaint = (performanceEntries: IPerformanceEntry[]) => {
  performanceEntries.forEach((entry) => {
    if (entry.name === "first-paint") {
      logMetirc(entry.startTime, "fp", entry)
    } else if (entry.name == "first-contentful-paint") {
      logMetirc(entry.startTime, "fcp", entry)
    }
  })
  poDisconnect("paint")
}

export const initLargestContentfulPaint = (
  performanceEntries: IPerformanceEntry[]
) => {
  const lastEntry = performanceEntries.pop()
  if (lastEntry) {
    logMetirc(lastEntry.renderTime || lastEntry.loadTime, "lcp", {
      performanceEntry: lastEntry
    })
  }
  poDisconnect("largestContentfulPaint")
}

export const initElementTiming = (performanceEntries: IPerformanceEntry[]) => {
  const lastEntry = performanceEntries.pop()
  if (lastEntry) {
    logMetirc(lastEntry.renderTime || lastEntry.loadTime, "fmp", {
      performanceEntry: lastEntry
    })
  }
  poDisconnect("element")
}

let totalTime = 0
export const initTotalBlockingTime = (
  performanceEntries: IPerformanceEntry[]
): void => {
  performanceEntries.forEach((entry) => {
    if (entry.name !== "self" || entry.startTime > metrics.fcp) return
    // 长任务超过50ms就是block
    const blockingTime = entry.duration - 50
    if (blockingTime > 0) {
      totalTime += blockingTime
    }
  })
  logMetirc(totalTime, "tbt", {
    performanceEntries
  })
  poDisconnect("longtask")
}
let resourceSize = {
  beacon: 0,
  css: 0,
  fetch: 0,
  img: 0,
  other: 0,
  script: 0,
  xmlhttprequest: 0
}
let totalSize = 0
export const initResourceTiming = (performanceEntries: IPerformanceEntry[]) => {
  performanceEntries.forEach((entry) => {
    if (config.isResourceTiming) {
      if (entry.decodedBodySize && entry.initiatorType) {
        const bodySize = entry.decodedBodySize / 1000
        resourceSize[entry.initiatorType] += bodySize
        totalSize += bodySize
      }
    }
  })
  logMetirc(
    {
      totalSize: totalSize.toFixed(2),
      ...resourceSize
    },
    "resource",
    {}
  )
  poDisconnect("resource")
}

export const initFirstInputDelay = (
  performanceEntries: IPerformanceEntry[]
) => {
  // 取最后的一位为我们希望所获取的时间点
  const lastEntry = performanceEntries.pop()
  if (lastEntry) {
    logMetirc(lastEntry.processingStart - lastEntry.startTime, "fid", {
      performanceEntry: lastEntry
    })
  }
  poDisconnect("firstInput")
}

let cls = 0
export const initLayoutShift = (performanceEntries: IPerformanceEntry[]) => {
  performanceEntries.forEach((entry) => {
    if (!entry.hadRecentInput && entry.value) {
      cls += entry.value
    }
  })
  logMetirc(cls, "cls", {
    performanceEntry: performanceEntries[0]
  })
  poDisconnect("layoutShift")
}
