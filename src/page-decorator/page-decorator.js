/**
 * change list:
 *  - page.query
 *  - page.noop
 *  - page.wx
 *  - page.getUrlParams
 *  - page.redirectTo
 *  - page.navigateTo
 *  - page.toast
 *  - default page.onStateChange
 *  - com.noop
 *  - com.wx
 *  - com.getUrlParams
 *  - com.redirectTo
 *  - com.navigateTo
 *  - com.toast
 */
// import wxapi from './promise-wxapi';

const noop = () => {};

/**
 * 拼接url参数
 * @param params
 * @returns {string}
 */
const getUrlParams = params => Object.keys(params)
  .filter(key => params[key])
  .map(key => `${key}=${encodeURIComponent(params[key])}`)
  .join('&');

/**
 * wx.redirectTo的升级版
 * 可以更方便的传递参数，同时promise化
 * @param url {String}
 * @param params {Object}
 * @returns {Promise<any>}
 */
const redirectTo = (url, params) => {
  let urlParams = '';
  if (params) {
    urlParams = `?${getUrlParams(params)}`;
  }
  return new Promise((resolve, reject) => {
    wx.redirectTo({
      url: url + urlParams,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * wx.navigateTo的升级版
 * 可以更方便的传递参数，同时promise化
 * @param url {String}
 * @param params {Object}
 * @returns {Promise<any>}
 */
const navigateTo = (url, params) => {
  let urlParams = '';
  if (params) {
    urlParams = `?${getUrlParams(params)}`;
  }
  return new Promise((resolve, reject) => {
    wx.navigateTo({
      url: url + urlParams,
      success: resolve,
      fail: reject,
    });
  });
};

/**
 * 简洁写法的（无icon）toast
 * @param content
 * @param duration
 * @returns {Promise<any>}
 */
const toast = (content, duration = 1500) => {
  return new Promise((resolve, reject) => {
    wx.showToast({
      title: content,
      duration,
      icon: 'none',
      success: resolve,
      fail: reject,
    });
  });
};


/**
 * 每个页面加载FZY4JW--GB1-0字体
 */
function loadFonts() {
  if (wx.loadFontFace) {
    wx.loadFontFace({
      family: 'FZY4JW--GB1-0',
      source: 'url("https://img-pub.fbcontent.cn/166b0140bf54426.ttf")',
    });
  }
}

/**
 * Page装饰器
 * @param config
 * @param preTask
 * @returns {{}}
 */
function configDecorator(config, preTask) {
  const newConfig = { ...config };

  // default onStateChange
  const originOnStateChange = newConfig.onStateChange || noop;
  newConfig.onStateChange = function onStateChange(...params) {
    const [newState] = params;
    this.setData({ ...newState, ...originOnStateChange.apply(this, params) });
  };

  // onLoad
  const originOnLoad = newConfig.onLoad;
  if (originOnLoad) {
    newConfig.onLoad = function onLoad(...params) {
      loadFonts();
      const [options] = params;
      const decodeOptions = {};
      Object.keys(options).forEach((item) => {
        decodeOptions[item] = decodeURIComponent(options[item]);
      });
      this.query = decodeOptions;
      if (newConfig.waitApp) {
        preTask.then(() => originOnLoad.apply(this, params));
      } else {
        originOnLoad.apply(this, params);
      }
    };
  }

  // onShow
  const originOnShow = newConfig.onShow;
  if (originOnShow) {
    newConfig.onShow = function onShow() {
      if (newConfig.waitApp) {
        preTask.then(() => originOnShow.apply(this));
      } else {
        originOnShow.apply(this);
      }
    };
  }

  // noop
  newConfig.noop = noop;

  // wxapi
  // newConfig.wx = wxapi;

  // urlParams
  newConfig.getUrlParams = getUrlParams;

  // redirectTo
  newConfig.redirectTo = redirectTo;

  // navigateTo
  newConfig.navigateTo = navigateTo;

  // toast
  newConfig.toast = toast;

  return newConfig;
}

/**
 * Component装饰器
 * @param config
 * @returns {{}}
 */
function comConfigDecorator(config) {
  const newConfig = { ...config };

  // 组件的方法需要向methods中挂载
  if (!newConfig.methods) {
    newConfig.methods = {};
  }

  // noop
  newConfig.methods.noop = noop;

  // wxapi
  // newConfig.methods.wx = wxapi;

  // urlParams
  newConfig.methods.getUrlParams = getUrlParams;

  // redirectTo
  newConfig.methods.redirectTo = redirectTo;

  // navigateTo
  newConfig.methods.navigateTo = navigateTo;

  // toast
  newConfig.methods.toast = toast;

  return newConfig;
}

export default function (preTask = Promise.resolve()) {
  const originPage = Page;
  Page = function Page(config) {
    originPage(configDecorator(config, preTask));
  };
  const originCom = Component;
  Component = function Component(config) {
    originCom(comConfigDecorator(config));
  };
}
