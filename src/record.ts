import { record } from "./rrweb/es/rrweb/src/index";
import { pack } from "./rrweb/es/rrweb/src/packer/pack";
let eventsMatrix: any = [];
let W: Window = window;

record({
  emit(event: {}[], isCheckout: boolean) {
    if (isCheckout) {
      eventsMatrix = [];
    }
    eventsMatrix.push(event);
  },
  recordCanvas: false,
  recordLog: false,
  sampling: {
    scroll: 200,
    input: "last"
  },
  mouseInteraction: {
    MouseUp: false,
    MouseDown: false,
    Click: true,
    ContextMenu: false,
    DblClick: false,
    Focus: false,
    Blur: false,
    TouchStart: false,
    TouchEnd: false
  },
  packFn: pack,
  checkoutEveryNth: 50
});

// 向后端传送最新的两个 event 数组
W.onerror = function () {
  let data = JSON.stringify(eventsMatrix);
  console.log("上传视频log", W.btoa(data));
  return true;
};
