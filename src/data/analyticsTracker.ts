import { IAnalyticsTrackerOptions } from "../typings/types";

const analyticsTracker = (options: IAnalyticsTrackerOptions): void => {
  const {
    metricName,
    eventProperties,
    data,
    // navigatorInformation,
    vitalsScorce
  } = options;
  console.log("自己的分析", options);
};
export default analyticsTracker;
