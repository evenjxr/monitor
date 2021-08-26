import { roundByTwo } from "../helpers/utils";
import { getVitalsScore } from "../helpers/vitalsScore";
import { reportPerf } from "./reportPerf";

export const metrics: any = {};

// 处理计算指标(同步)
export const logData = (measureName: string, metric: any): void => {
  Object.keys(metric).forEach(key => {
    if (typeof metric[key] === "number") {
      metric[key] = roundByTwo(metric[key]);
    }
  });
  reportPerf(measureName, metric, {}, null);
};

// 处理原生指标(异步)
export const logMetirc = (
  vlaue: number | object,
  measureName: string,
  eventProperties: object
): void => {
  const data = typeof vlaue === "number" ? roundByTwo(vlaue) : vlaue;
  const vitalsScorce = getVitalsScore(data, measureName);
  metrics[measureName] = data;
  reportPerf(measureName, data, eventProperties, vitalsScorce);
};
