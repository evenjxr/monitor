// src/index.d.ts
import rrweb from "rrweb";

window.play = function (evnets: any[]) {
  const replayer = new rrweb.Replayer(evnets, {
    root: document.querySelector("#player")
    // unpackFn: rrweb.unpack
  } as any);
  replayer.play();
};
