

const config = {
  project: 'demo',
  version: '1.0.0',
  isPro: true,
  postUrl: '',
  postType: 'fetch',
  error: {
    autoReport: true,
    type: ['consoleError', 'unhandledrejection', 'networkError', 'iframe', 'globalError', 'other'],
    cache: true,
    cacheMaxLength: 10,
  },
  performance: {
    sample: 1,
    autoReport: true,
    isKeepOriginData: true,
    networkInfo: true,
  },
  storageInfo: true,
}

export type Tconfig = typeof config

export default config

