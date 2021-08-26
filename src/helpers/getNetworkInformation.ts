import { WN } from "../data/constants";
import {
  EffectiveConnectiontype,
  IMonitorNetworkInformation
} from "../typings/types";

export let et: EffectiveConnectiontype = "4g";
export let sd: boolean = false;

export const getNetworkInformation = (): IMonitorNetworkInformation => {
  if ("connection" in WN) {
    const dataConnection = (WN as any).connection;
    if (typeof dataConnection !== "object") {
      return {};
    }
    et = dataConnection.effectiveType;
    sd = !!dataConnection.saveData;
    return {
      downlink: dataConnection.downlink,
      effectiveType: dataConnection.effectiveType,
      rtt: dataConnection.rtt,
      saveData: sd
    };
  } else {
    // todo 这里用多普勒测速发或者直接用图片探测法
  }
  return {};
};
