/** @format */

import { W } from "../data/constants"

const spiderList = [
  "baiduspider",
  "googlebot",
  "bingbot",
  "yammybot",
  "360spider",
  "haosouspider",
  "youdaobot",
  "sogou news spider",
  "yisouspider",
  "mtdp-infosec",
  "mtdp-searchspider",
  "yandexbot",
  "yandexmobilebot"
]

export function getUserAgent() {
  return (W.navigator && W.navigator.userAgent) || ""
}

export function checkIsSpider() {
  try {
    let ua = getUserAgent().toLowerCase()
    for (let i = 0; i < spiderList.length; i++) {
      if (ua.indexOf(spiderList[i]) > -1) return true
    }
  } catch (e) {
    console.error(e)
  }
  return false
}

export function parseUserAgent(userAgent: string) {
  const result = {
    browser: "",
    version: "",
    os: "",
    isMobile: false
  }

  // 浏览器信息
  const browserRegex = {
    Chrome: /Chrome\/(\d+\.\d+)/,
    Firefox: /Firefox\/(\d+\.\d+)/,
    Safari: /Version\/(\d+\.\d+).*Safari/,
    Edge: /Edg\/(\d+\.\d+)/,
    Opera: /Opera\/(\d+\.\d+)/,
    UCBrowser: /UCBrowser\/(\d+\.\d+)/,
    WechatBrowser: /MicroMessenger\/(\d+\.\d+)/,
    QQBrowser: /QQBrowser\/(\d+\.\d+)/
  }

  for (const browser in browserRegex) {
    const match = userAgent.match(browserRegex[browser])
    if (match) {
      result.browser = browser
      result.version = match[1]
      break
    }
  }

  // 操作系统信息
  const osRegex = {
    Windows: /Windows NT (\d+\.\d+)/,
    MacOS: /Mac OS X (\d+(?:\_\d+)?)/,
    Linux: /Linux/,
    Android: /Android (\d+\.\d+)/,
    iOS: /iPhone OS (\d+(?:\_\d+)?)/
  }

  for (const os in osRegex) {
    const match = userAgent.match(osRegex[os])
    if (match) {
      result.os = os === "Linux" ? os : os + (match[1] ? " " + match[1] : "")
      break
    }
  }

  // 移动设备检测
  const mobileRegex =
    /Mobile|iPhone|iPad|Android|BlackBerry|IEMobile|Opera Mini/i
  result.isMobile = mobileRegex.test(userAgent)

  return result
}
