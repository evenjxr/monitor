export interface IMonitorConsumOptons {
  beacon: number;
  css: number;
  fetch: number;
  img: number;
  other: number;
  script: number;
  total: number;
  xmlhttprequest: number;
}
export interface IMonitorNavigationTiming {
  fetchTime?: number;
  workerTime?: number;
  totalTime?: number;
  downloadTime?: number;
  timeToFirstByte?: number;
  headerSize?: number;
  dnsLookupTime?: number;
  tcpTime?: number;
  whileTime?: number;
  domTime?: number;
  loadTime?: number;
  parseDomTime?: number;
}
export type EffectiveConnectiontype =
  | "2g"
  | "3g"
  | "4g"
  | "5g"
  | "slow-2g"
  | "lte";
export interface IMonitorNetworkInformation {
  downlink?: number;
  rtt?: number;
  effectiveType?: EffectiveConnectiontype;
  saveData?: boolean;
}

export type IMonitorData =
  | number
  | IMonitorNavigationTiming
  | IMonitorNetworkInformation;

export type IVitalsScore = "good" | "needsImprovement" | "poor" | null;

// 回调给用户的数据
export interface IAnalyticsTrackerOptions {
  metricName: string;
  data: number;
  eventProperties: object;
  // navigatorInformation: object;
  // customProperties?: object;
  vitalsScorce: IVitalsScore; // 分数
}

export type ErrorTypes = [
  "consoleError",
  "unhandledrejection",
  "networkError",
  "iframeError",
  "globalError",
  "other"
]

export type PartialErrorTypes = Partial<Record<ErrorTypes[number], true>>

export interface IerrorConfig {
  autoReport: boolean
  type: (keyof PartialErrorTypes)[]
  cache: boolean
  cacheMaxLength: number
}


export interface IperformanceConfig {
  sample: number
  autoReport: true
}

// 用户初始化参数
export interface IMonitorOptions {
  postUrl: string
  postType: sendDataType
  error: IerrorConfig
  // resourceTiming: boolean;
  // elementTiming: boolean;
  // analyticsTracker?: (options: IAnalyticsTrackerOptions) => void;
  // maxTime: number;
  // logUrl?: string;
  // captureError?: boolean;
}

export type IReportData = (body: object, url?: string) => void

export interface IMonitorConfig {
  isResourceTiming: boolean
  isElementTiming: boolean
  reportData: IReportData
  analyticsTracker: (options: IAnalyticsTrackerOptions) => void
  maxTime: number
}

export interface IperfObservers {
  [measureName: string]: any
}

// 约束可以被订阅的性能指标
export type IPerformanceObserverType =
  | "first-input"
  | "largest-contentful-paint"
  | "layout-shift"
  | "longtask"
  | "measure"
  | "navigation"
  | "paint"
  | "element"
  | "resource"

export type IPerformanceEntryInitiatorType =
  | "beacon"
  | "css"
  | "fetch"
  | "img"
  | "other"
  | "script"
  | "xmlhttprequest"

// 通过订阅回调 得到的具体的性能参数信息
export declare interface IPerformanceEntry {
  processingStart: number
  decodedBodySize?: number
  duration: number
  entryType: IPerformanceObserverType
  initiatorType?: IPerformanceEntryInitiatorType
  loadTime: number
  name: string
  renderTime: number
  startTime: number
  hadRecentInput?: boolean
  value?: number
  identifier?: string
  element?: HTMLElement
}

// 度量指标数据
export interface IMetricMap {
  [measureName: string]: boolean
}

export interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: DOMHighResTimeStamp
  target?: Node
}

export enum Askpriority {
  URGENT = 1,
  IDLE = 2
}

export enum sendDataType {
  beacon = "beacon",
  imageLoad = "imageLoad",
  fetch = "fetch",
  xhr = "xhr"
}
