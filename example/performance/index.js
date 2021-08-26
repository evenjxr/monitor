import Monitor from "../../src/index";

new Monitor({
  logUrl: "/log/api",
  elementTiming: true,
  resourceTiming: true,
  captureError: true,
  analyticsTracker: options => {
    console.log(options);
  }
});
