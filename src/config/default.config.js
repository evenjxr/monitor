
export default {
  postUrl: '',
  postType: 'fetch',
  error: {
    autoReport: true,
    type: ['consoleError', 'unhandledrejection', 'networkError', 'iframe', 'globalError', 'other'],
    cache: true,
    cacheMaxLength: 10,
  },
  performance: {
    sample: 0.5,
    autoReport: true,
    sensoryIndex: true,
    quota: [],
    // disableSensoryImageIndex: true,
    // interactToStopObserver: true,
    // noCheckOuterMutaCount: false,
    // fstPerfSample: 0.5,
    // fstPerfAnalysis: false,
    // logSlowView: false,
    // delay: 0,
    // logFirstScreen: false,
    // ignoreIframe: true,
    // mainResourceNumber: 5,
    // timeThreshold: 5
  }
}

