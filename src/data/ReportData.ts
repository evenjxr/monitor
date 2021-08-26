import { Askpriority, IReportData, ITrackerOptions } from "../typings/types";
import { W, WN } from "./constants";

class ReportData implements IReportData {
  private logUrl: string;
  constructor(options: ITrackerOptions) {
    const { logUrl } = options;
    this.logUrl = logUrl;
  }

  sendToAnalytics(level: Askpriority, body: object, uri?: string) {
    let logurl = this.logUrl;
    let query: string = JSON.stringify(body);
    if (uri) logurl = uri;
    if (level === Askpriority.URGENT) {
      if (!!W.fetch) {
        fetch(logurl, { body: query, method: "POST", keepalive: true });
      } else {
        let xhr: XMLHttpRequest | null = new XMLHttpRequest();
        xhr.open("post", logurl, true);
        // 设置请求头
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(query);
        xhr.onload = function (e) {
          xhr = null;
        };
      }
    } else if (level === Askpriority.IDLE) {
      if (!!WN.sendBeacon) {
        navigator.sendBeacon(logurl, query);
      } else {
        let img: HTMLImageElement | null = new Image();
        img.src = `${logurl}?body=${query}`;
        img.onload = function () {
          img = null;
        };
      }
    }
  }
}

export default ReportData;
