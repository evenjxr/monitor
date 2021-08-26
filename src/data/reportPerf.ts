import { config } from "../config";
import { visibility } from "../helpers/onVisibilityChange";
import { pushTask } from "../helpers/utils";
import { IVitalsScore } from "../typings/types";
// import { getNavigationTiming } from "../helpers/getNavigationTiming";

// 上报细节
export const reportPerf = function (
  measureName: string,
  data: any,
  eventProperties: object,
  vitalsScorce: IVitalsScore
): void {
  pushTask(() => {
    if (visibility.isHidden) return; //页面被隐藏
    config.analyticsTracker({
      metricName: measureName,
      data,
      eventProperties,
      vitalsScorce
    });
  });
};
