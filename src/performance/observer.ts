import { config } from "../config";
import { perfObservers } from "./observerInstances";
import {
  initElementTiming,
  initFirstPaint,
  initLargestContentfulPaint,
  initLayoutShift,
  initFirstInputDelay,
  initResourceTiming,
  initTotalBlockingTime
} from "./paint";
import { po, poDisconnect } from "./performanceObserver";

export const initPerformanceObserver = (): void => {
  console.log("性能监控开始");
  perfObservers["paint"] = po("paint", initFirstPaint);
  perfObservers["firstInput"] = po("first-input", initFirstInputDelay);
  perfObservers["largestContentfulPaint"] = po(
    "largest-contentful-paint",
    initLargestContentfulPaint
  );
  if (config.isResourceTiming) {
    perfObservers["resource"] = po("resource", initResourceTiming);
  }
  perfObservers["layoutShift"] = po("layout-shift", initLayoutShift);
  if (config.isElementTiming) {
    perfObservers["element"] = po("element", initElementTiming);
  }
  perfObservers["longtask"] = po("longtask", initTotalBlockingTime);
};

export const disconnectPerfObserversHidden = (): void => {
  [
    "paint",
    "first-input",
    "largest-contentful-paint",
    "resource",
    "layout-shift",
    "element",
    "longtask"
  ].forEach(ele => {
    poDisconnect(ele);
  });
};
