/** @format */

import analyticsTracker from "../data/analyticsTracker"
import defaultConfig, { Tconfig } from "./default.config"
import { IMonitorConfig, IMonitorOptions, IerrorConfig } from "../typings/types"
import { Tparams } from "../data/reportApi"

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
  config: Tconfig
  constructor(options: Partial<IMonitorOptions> = {}) {
    this.config = Object.assign(
      {},
      defaultConfig,
      options
    ) as typeof defaultConfig
  }

  get errConfig() {
    return this.config.error as IerrorConfig
  }

  get reportCofing() {
    const { postUrl, postType } = this.config
    return {
      postUrl,
      postType
    } as Tparams
  }

  get performanceCofing() {
    const { performance } = this.config
    return performance
  }

  get baseInfo() {
    const { project, version } = this.config

    return {
      project,
      version,
      pageUrl: location.href
    }
  }
}
