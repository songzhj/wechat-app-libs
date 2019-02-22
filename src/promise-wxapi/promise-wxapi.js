/**
 * promise wxapi
 */

// wechat-app doesn't support Proxy in low system version
import ProxyPolyfill from './proxy.min';

const MyProxy = new ProxyPolyfill();

const wxapi = new MyProxy(wx, {
  get(target, property) {
    if (property === Symbol.toStringTag) {
      return '--wxapi';
    }

    if (property in wx) {
      return obj => new Promise(((resolve, reject) => {
        obj = obj || {};
        obj.success = (...args) => {
          resolve(...args);
        };
        obj.fail = (err) => {
          reject(err);
        };
        obj.complete = () => { };
        wx[property](obj);
      }));
    }

    if (property in target) {
      return target[property];
    }

    throw new Error(`No Such wxapi${property}`);
  },

  set(val) {
    return val;
  },
});

export default wxapi;
