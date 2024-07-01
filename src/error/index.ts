/** @format */
import { W, D } from "../data/constants"
import { IReportData, IerrorConfig, PartialErrorTypes } from "../typings/types"

type Tcategory = "jsError" | "networkError" | "iframeError"
type TsecCategory =
  | "consoleError"
  | "unhandledrejection"
  | "eventError"
  | "loadError"

type ErrorInfo = {
  category: Tcategory
  secCategory: TsecCategory
  level: "info" | "warning" | "error"
  message: string
  type?: string
  scriptURI?: string
  lineno?: number
  colno?: number
  stack?: any
}

class ErrorTrace {
  private cacheError: ErrorInfo[]
  private errorConfig: IerrorConfig
  private report: (params: ErrorInfo[]) => void
  constructor(errorConfig: IerrorConfig, reportData: IReportData) {
    this.cacheError = []
    this.errorConfig = errorConfig
    const { autoReport, type } = this.errorConfig
    this.run(type)
    this.report = reportData
    if (autoReport) this.detectLeaveReport()
  }

  // 监听页面卸载事件, 自动上报
  detectLeaveReport() {
    const originOnbeforeunload = W?.onbeforeunload
    const originErrorManage = this
    W.onbeforeunload = function () {
      if (originErrorManage.cacheError.length > 0) {
        originErrorManage.report(originErrorManage.cacheError)
      }
      const args = Array.prototype.slice.call(arguments)
      originOnbeforeunload && originOnbeforeunload.call(W, ...args)
    }
  }

  public parseError(error: Error) {
    try {
      const message = error.message || error.name || "Invalid_Error"
      const stack = error.stack
      if (stack) {
        const type = String(stack).split(":")[0]
        const mathInfo = String(stack).match("https?://[^\n]+")
        const info = mathInfo?.[0] ? mathInfo?.[0] : ""
        const jsReg = /https?:\/\/(\S)+\.js/
        const scriptUrl = jsReg.test(info) ? info?.match(jsReg)[0] : info
        const rowCols = info.match(":(\\d+):(\\d+)")
        const tmp: any = {
          type: type || "error",
          message,
          stack,
          scriptURI: scriptUrl
        }
        if (rowCols?.[1]) {
          tmp.lineno = rowCols?.[1]
        }
        if (rowCols?.[2]) {
          tmp.colno = rowCols?.[2]
        }
        return tmp
      }
    } catch (err) {
      return null
    }
  }

  private handleErrorItem(error: ErrorInfo) {
    const { cache, cacheMaxLength } = this.errorConfig
    if (!cache) {
      this.report([error])
    } else {
      this.cacheError.push(error)
      if (this.cacheError.length >= cacheMaxLength) {
        this.report(this.cacheError.splice(0, cacheMaxLength))
      }
    }
  }

  private handleEventError = (
    e: ErrorEvent,
    category: Tcategory = "jsError",
    secCategory: TsecCategory = "eventError"
  ) => {
    e.preventDefault()
    const { error, filename, lineno, colno } = e
    const { message, stack } = error || {}
    this.handleErrorItem({
      category,
      secCategory,
      level: "error",
      message,
      scriptURI: filename,
      lineno,
      colno,
      stack
    })
  }

  // 加载错误的回调对象是个 Event 不是 Error
  private handleEvent = (
    e: Event,
    category: Tcategory = "networkError",
    secCategory: TsecCategory = "loadError",
    ifame = W
  ) => {
    if (!e) return
    let target = e.target || e.srcElement
    const isElementTarget =
      target instanceof ifame.HTMLScriptElement ||
      target instanceof ifame.HTMLLinkElement ||
      target instanceof ifame.HTMLImageElement
    // 处理加载错误
    if (isElementTarget) {
      const { url, src, href, tagName, baseURI, outerHTML } = target as any
      this.handleErrorItem({
        category,
        secCategory: "loadError",
        level: "error",
        message: `加载标签${tagName}资源错误\r\nlink:${src || href || url}`,
        scriptURI: baseURI,
        stack: outerHTML
      })
    }
  }

  private handleUnhandledrejection = (
    e: PromiseRejectionEvent,
    category: Tcategory = "jsError"
  ) => {
    e?.preventDefault()
    try {
      let reason = e.reason
      if (reason) {
        let message = reason.message || reason?.name || "unhandledrejection"
        let stack = reason.stack || reason.toString() || reason
        const err = this.parseError(reason)
        if (err) {
          const { message, stack, scriptURI, lineno, colno } = err
          this.handleErrorItem({
            category,
            secCategory: "unhandledrejection",
            level: "warning",
            message,
            stack,
            scriptURI,
            lineno,
            colno
          })
        } else {
          this.handleErrorItem({
            category,
            secCategory: "unhandledrejection",
            level: "warning",
            message,
            stack
          })
        }
      }
    } catch (err) {}
  }

  //eventError
  private eventError() {
    W.addEventListener("error", this.handleEventError)
    // W.onerror = (
    //   message,
    //   scriptURI,
    //   lineno,
    //   colno,
    //   event
    // ): boolean => {
    //   this.handleErrorItem({
    //     category: 'jsError',
    //     secCategory: 'eventError',
    //     level: 'error',
    //     message: typeof message === 'string' ? message : String(message),
    //     scriptURI,
    //     lineno,
    //     colno,
    //     stack: event?.stack,
    //   })
    //   return true;
    // };
  }

  // 资源挂载失败
  private networkError() {
    W.addEventListener("error", this.handleEvent, true)
  }

  // 异步Promise错误
  private promiseError() {
    W.addEventListener(
      "unhandledrejection",
      this.handleUnhandledrejection,
      false
    )
  }

  private consoleError() {
    if (W.console) {
      const originConsoleError = W.console.error
      const ErrorManager = this
      W.console.error = function () {
        const args = Array.prototype.slice.call(arguments)
        if (!(args && args.length)) return
        args.forEach((e) => {
          if (e instanceof W.ErrorEvent) {
            e?.preventDefault()
            ErrorManager.handleEventError(e, "jsError", "consoleError")
          } else if (e instanceof W.Error) {
            const err = ErrorManager.parseError(e)
            if (err) {
              const { message, stack, scriptURI, lineno, colno, type } = err
              ErrorManager.handleErrorItem({
                category: "jsError",
                secCategory: "consoleError",
                level: "error",
                message,
                stack,
                scriptURI,
                lineno,
                colno,
                type
              })
            }
          } else if (typeof e === "string") {
            ErrorManager.handleErrorItem({
              category: "jsError",
              secCategory: "consoleError",
              level: "error",
              message: e
            })
          }
        })
        originConsoleError && originConsoleError.call(W.console, ...args)
      }
    }
  }

  private iframeError() {
    D.addEventListener("DOMContentLoaded", () => {
      const frames = W.frames
      for (let i = 0; i < frames.length; i++) {
        frames[i].addEventListener(
          "error",
          (e) => {
            if (e instanceof frames[i].ErrorEvent) {
              e?.preventDefault()
              this.handleEventError(e, "iframeError")
            } else if (e instanceof frames[i].Event) {
              this.handleEvent(
                e,
                "iframeError",
                "loadError",
                frames[i] as typeof W
              )
            }
          },
          true
        )
        frames[i].addEventListener(
          "unhandledrejection",
          (e: PromiseRejectionEvent) => {
            this.handleUnhandledrejection(e, "iframeError")
          },
          false
        )
      }
    })
  }

  public run(type: (keyof PartialErrorTypes)[]) {
    if (type.indexOf("networkError") > -1) this.networkError()
    if (type.indexOf("globalError") > -1) this.eventError()
    if (type.indexOf("unhandledrejection") > -1) this.promiseError()
    if (type.indexOf("iframeError") > -1) this.iframeError()
    if (type.indexOf("consoleError") > -1) this.consoleError()
  }
}

export default ErrorTrace
