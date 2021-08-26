import { config } from "../config";
import { W } from "../data/constants";
import { Askpriority } from "../typings/types";

type ErrorInfo = {};
class ErrorTrace {
  private errorInfo: ErrorInfo;
  constructor() {
    this.errorInfo = {};
  }
  //全局捕获同步+异步错误
  private globalError() {
    W.onerror = (
      eventOrMessage: Event | string,
      scriptURI?: string,
      lineno?: number,
      clono?: number,
      error?: Error
    ): boolean => {
      const errorInfo = {
        type: "jsError",
        scriptURI,
        lineno,
        clono,
        error
      };
      config.reportData.sendToAnalytics(Askpriority.IDLE, errorInfo);
      return true;
    };
  }
  // 资源挂载失败
  private networkError() {
    W.addEventListener(
      "error",
      function (e: ErrorEvent) {
        if (e.target !== W) {
          config.reportData.sendToAnalytics(Askpriority.IDLE, {
            msg: "网路错误",
            type: "resourceError",
            target: e.target
          });
        }
      },
      true
    );
  }
  // 异步Promise错误
  private promiseError() {
    W.addEventListener("unhandledrejection", function (e) {
      e.preventDefault();
      config.reportData.sendToAnalytics(Askpriority.IDLE, {
        msg: "promise错误",
        type: "unhandledrejection",
        target: e.reason
      });
      return true;
    });
  }

  private iframeError() {
    const frames = W.frames;
    for (let i = 0; i < frames.length; i++) {
      frames[i].addEventListener(
        "error",
        e => {
          console.log(e);
        },
        true
      );

      frames[i].addEventListener(
        "unhandledrejection",
        e => {
          console.log(e);
        },
        true
      );
    }
  }

  public run() {
    this.networkError();
    this.globalError();
    this.promiseError();
  }
}

export default ErrorTrace;
