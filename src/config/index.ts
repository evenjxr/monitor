import analyticsTracker from "../data/analyticsTracker";
import ReportData from "../data/ReportData";
import { IMonitorConfig } from "../typings/types";

export const config: IMonitorConfig = {
  reportData: new ReportData({
    logUrl: "hole"
  }),
  analyticsTracker: analyticsTracker,
  isElementTiming: false,
  isResourceTiming: false,
  maxTime: 15000
};
