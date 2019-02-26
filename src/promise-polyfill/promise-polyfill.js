const originThen = Promise.prototype.then;

/**
 * Promise finally
 * @param callback
 * @returns {*|Promise}
 */
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return originThen.call(
    this,
    value => P.resolve(callback()).then(() => value === Promise.break ? undefined : value),
    reason => P.resolve(callback()).then(() => { throw reason; }),
  );
};

/**
 * Promise break
 */
Promise.break = Symbol('break');

Promise.prototype.then = function (...param) {
  const onFulfilled = param[0];

  if (onFulfilled) {
    param[0] = (p) => {
      if (p === Promise.break) {
        return p;
      }
      return onFulfilled(p);
    };
  }

  return originThen.apply(this, param);
};
