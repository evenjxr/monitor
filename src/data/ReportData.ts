/** @format */

import { IReportData, sendDataType } from "../typings/types"
import { W, WN } from "./constants"

type Tparams = {
  postUrl: string
  postType: sendDataType
}

export default function ({ postUrl, postType }: Tparams): IReportData {
  let report: (body: any, url: string) => void
  if (postType === sendDataType.fetch) {
    report = function (body, url) {
      return fetch(url, { body, method: "POST", keepalive: true })
    }
  } else if (postType === sendDataType.xhr) {
    report = function (body, url) {
      let xhr: XMLHttpRequest | null = new XMLHttpRequest()
      xhr.open("post", url, true)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.send(body)
      xhr.onload = function (e) {
        xhr = null
      }
    }
  } else if (postType === sendDataType.beacon) {
    report = function (body, url) {
      return navigator.sendBeacon(url, body)
    }
  } else if (postType === sendDataType.imageLoad) {
    report = function (body, url) {
      let img: HTMLImageElement | null = new Image()
      img.src = `${url}?body=${JSON.stringify(body)}`
      img.onload = function () {
        img = null
      }
    }
  }
  return function (data, path) {
    let query: string = JSON.stringify(data)
    report(query, path || postUrl)
  }
}
