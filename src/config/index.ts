import analyticsTracker from "../data/analyticsTracker";
import ReportData from "../data/reportData"
import defaultConfig from "./default.config"
import { IMonitorConfig, IMonitorOptions } from "../typings/types"

// export const config: IMonitorConfig = {
//   reportData: new ReportData({
//     logUrl: "hole"
//   }),
//   analyticsTracker: analyticsTracker,
//   isElementTiming: false,
//   isResourceTiming: false,
//   maxTime: 15000
// };

export default class ConfigManager {
  config: typeof defaultConfig
  constructor(options: Partial<IMonitorOptions> = {}) {
    this.config = Object.assign({}, defaultConfig, options)
  }

  get errConfig() {
    return this.config.error
  }

  get reportCofing() {
    const { postUrl, postType } = this.config
    return {
      postUrl,
      postType
    }
  }
}
