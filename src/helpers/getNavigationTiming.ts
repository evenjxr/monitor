import { WP } from "../data/constants";
import { isPerformanceSupported } from "../tools/isSupported";
import { IMonitorNavigationTiming } from "../typings/types";

export const getNavigationTiming = (): IMonitorNavigationTiming => {
  if (!isPerformanceSupported()) return {};
  const n = WP.getEntriesByType("navigation")[0] as any;
  if (!n) return {};
  const responseStart = n.responseStart;
  const responseEnd = n.responseEnd;
  return {
    fetchTime: responseEnd - n.fetchStart,
    workerTime: n.workerStart > 0 ? responseEnd - n.workerStart : 0,
    totalTime: responseEnd - n.requestStart,
    downloadTime: responseEnd - responseStart,
    timeToFirstByte: responseStart - n.requestStart,
    headerSize: n.transferSize - n.encodedBodySize || 0,
    dnsLookupTime: n.domainLookupEnd - n.domainLookupStart,
    // TCP建立时间
    tcpTime: n.connectEnd - n.connectStart || 0,
    // 白屏时间
    whileTime: n.responseStart - n.navigationStart || 0,
    // dom渲染完成时间
    domTime: n.domContengLoadedEventEnd - n.navigationStart || 0,
    // 页面onload时间
    loadTime: n.loadEventEnd - n.navigationStart || 0,
    // 页面解析dom耗时
    parseDomTime: n.domComplete - n.domInteractive || 0
  };
};
