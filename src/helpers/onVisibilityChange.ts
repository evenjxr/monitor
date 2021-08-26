import { D } from "../data/constants";

export const visibility = {
  isHidden: false
};

export const onVisibilityChange = function (cb: Function) {
  if (D.hidden) {
    cb();
    visibility.isHidden = D.hidden;
  }
};

export const didVisibilityChange = function () {};
