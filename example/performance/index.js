import Monitor from "../../src/index";

new Monitor({
  postUrl: 'http://localhost:3000/api/log',
  postType: 'beacon',
  error: {
    autoReport: true,
    type: ['consoleError', 'unhandledrejection', 'networkError', 'iframeError', 'globalError', 'other'],
    cache: true,
    cacheMaxLength: 2,
  },
});