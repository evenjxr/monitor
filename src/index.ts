/** @format */

import ConfigManager from "./config"
// import { IMonitorOptions } from "./typings/types";
// import { isPerformanceSupported } from "./tools/isSupported";
// import { D, W, WN } from "./data/constants";
// import {
//   disconnectPerfObserversHidden,
//   initPerformanceObserver
// } from "./performance/observer";
import reportData from "./data/reportData"
// import { logData } from "./data/log";
// import { getNavigationTiming } from "./helpers/getNavigationTiming";
// import { didVisibilityChange } from "./helpers/onVisibilityChange";
// import { getNetworkInformation } from "./helpers/getNetworkInformation";
// import { reportStorageEstmate } from "./data/storageEstimate";
import ErrorTrace from "./error"
import { IMonitorOptions, IReportData } from "./typings/types"

export default class Monitor {
  private v = "1.0.0"
  private reportData: IReportData
  private configManager: InstanceType<typeof ConfigManager>
  constructor(options: Partial<IMonitorOptions> = {}) {
    const { postUrl } = options
    if (!postUrl) throw new Error(`监控平台${this.v}提示未配置上报url`)
    this.configManager = new ConfigManager(options)
    this.reportData = reportData(this.configManager.reportCofing)
    this.initError()
    this.initPerformance()

    // // 集合数据汇总
    // config.isElementTiming = !!elementTiming;
    // config.isResourceTiming = !!resourceTiming;
    // config.maxTime = maxTime || config.maxTime;

    // if (!isPerformanceSupported) return;
    // if ("PerformanceObserver" in W) initPerformanceObserver();

    // //初始化
    // if (typeof D.hidden !== "undefined") {
    //   D.addEventListener(
    //     "visibilitychange",
    //     didVisibilityChange.bind(this, disconnectPerfObserversHidden)
    //   );
    // }

    // // 记录系统DNS请求+白屏时间等
    // logData("navigationTiming", getNavigationTiming());
    // // 记录用户网速 H5+多普勒测试
    // logData("networkInfomation", getNetworkInformation());
    // // 管理离线缓存数据
    // if (WN && WN.storage && typeof WN.storage.estimate === "function") {
    //   WN.storage.estimate().then(reportStorageEstmate);
    // }
  }

  initError() {
    new ErrorTrace(this.configManager.errConfig, this.reportData)
  }

  initPerformance() {}
}
