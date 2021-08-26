import { convertToKB } from "../helpers/utils";
import { logData } from "./log";

export const reportStorageEstmate = (storageInfo: StorageEstimate) => {
  const estimateUsageDetails =
    "usageDetails" in storageInfo ? (storageInfo as any).usageDetails : {};
  const { quota, usage } = storageInfo;
  const { caches, indexedDB, serviceWorkerRegistrations } =
    estimateUsageDetails;
  logData("storageEstimate", {
    quota: convertToKB(quota),
    usage: convertToKB(usage),
    caches: convertToKB(caches),
    indexedDB: convertToKB(indexedDB),
    serviceWorkerRegistrations: convertToKB(serviceWorkerRegistrations)
  });
};
