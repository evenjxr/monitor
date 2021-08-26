import { config } from "./config";
import { IMonitorOptions, IReportData } from "./typings/types";
import { isPerformanceSupported } from "./tools/isSupported";
import { D, W, WN } from "./data/constants";
import {
  disconnectPerfObserversHidden,
  initPerformanceObserver
} from "./performance/observer";
import ReportData from "./data/ReportData";
import { logData } from "./data/log";
import { getNavigationTiming } from "./helpers/getNavigationTiming";
import { didVisibilityChange } from "./helpers/onVisibilityChange";
import { getNetworkInformation } from "./helpers/getNetworkInformation";
import { reportStorageEstmate } from "./data/storageEstimate";
import ErrorTrace from "./error";

export default class Monitor {
  private v = "1.0.0";
  private reportData: IReportData;
  constructor(options: Partial<IMonitorOptions> = {}) {
    const {
      analyticsTracker,
      resourceTiming,
      elementTiming,
      maxTime,
      logUrl,
      captureError
    } = options;
    if (!logUrl) throw new Error(`监控平台${this.v}提示未传递logUrl`);
    //实例化上传对象
    const insReportData: IReportData = new ReportData({
      logUrl
    });
    // 对外暴露
    this.reportData = insReportData;
    config.reportData = insReportData;
    // 集合数据汇总
    if (analyticsTracker) config.analyticsTracker = analyticsTracker;
    config.isElementTiming = !!elementTiming;
    config.isResourceTiming = !!resourceTiming;
    config.maxTime = maxTime || config.maxTime;
    if (captureError) {
      // 开启错误跟踪
      const errorTrace = new ErrorTrace();
      errorTrace.run();
    }
    if (!isPerformanceSupported) return;
    if ("PerformanceObserver" in W) initPerformanceObserver();

    //初始化
    if (typeof D.hidden !== "undefined") {
      D.addEventListener(
        "visibilitychange",
        didVisibilityChange.bind(this, disconnectPerfObserversHidden)
      );
    }

    // 记录系统DNS请求+白屏时间等
    logData("navigationTiming", getNavigationTiming());
    // 记录用户网速 H5+多普勒测试
    logData("networkInfomation", getNetworkInformation());
    // 管理离线缓存数据
    if (WN && WN.storage && typeof WN.storage.estimate === "function") {
      WN.storage.estimate().then(reportStorageEstmate);
    }
  }
}
