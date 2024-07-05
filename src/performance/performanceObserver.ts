// 创建一个异步订阅机制
import { C } from '../data/constants';
import { IPerformanceObserverType } from '../typings/types';
import { perfObservers } from './observerInstances';

export const po = (
  eventType: IPerformanceObserverType,
  cb: (performanceEntries: any[]) => void
) => {
  try {
    const perfObserver = new PerformanceObserver((entryList) => {
      cb(entryList.getEntries());
    });
    // buffered 不立即执行， 实例化等待被调用
    perfObserver.observe({
      type: eventType,
      buffered: true
    });
    return perfObserver;
  } catch (e) {
    C.warn('monitor.js', e);
  }
  return null;
};

export const poDisconnect = (observer: string) => {
  if (perfObservers[observer]) perfObservers[observer].disconnect()
  delete perfObservers[observer]
}
