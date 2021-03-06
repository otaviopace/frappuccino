// Generated by CoffeeScript 2.4.1
(function() {
  var FULFILLED, PENDING, Promise, REJECTED, asap;

  asap = require('asap');

  PENDING = 'PENDING';

  FULFILLED = 'FULFILLED';

  REJECTED = 'REJECTED';

  Promise = class Promise {
    constructor(executor) {
      this.fulfill = this.fulfill.bind(this);
      this.reject = this.reject.bind(this);
      this.state = PENDING;
      this.called = false;
      this.queue = [];
      this.doResolve(executor);
    }

    wrapCb(cb) {
      return (value) => {
        if (this.called) {
          return;
        }
        this.called = true;
        return cb(value);
      };
    }

    doResolve(executor) {
      var error;
      try {
        return executor(this.wrapCb(this.fulfill), this.wrapCb(this.reject));
      } catch (error1) {
        error = error1;
        return this.reject(error);
      }
    }

    fulfill(value) {
      var error, isPromise, isThenable, thenFn;
      if (value === this) {
        return this.reject(new TypeError);
      }
      if (value && (typeof value === 'object' || typeof value === 'function')) {
        try {
          thenFn = value.then;
        } catch (error1) {
          error = error1;
          return this.reject(error);
        }
        isPromise = thenFn === this.then && this instanceof Promise;
        if (isPromise) {
          this.state = FULFILLED;
          this.value = value;
          return this.finale();
        }
        isThenable = typeof thenFn === 'function';
        if (isThenable) {
          return this.doResolve(thenFn.bind(value));
        }
      }
      this.state = FULFILLED;
      this.value = value;
      return this.finale();
    }

    reject(reason) {
      this.state = REJECTED;
      this.value = reason;
      return this.finale();
    }

    finale() {
      var callbacks, i, len, ref, results;
      ref = this.queue;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        callbacks = ref[i];
        results.push(this.handle(callbacks));
      }
      return results;
    }

    handleResolved({promise, onFulfilled, onRejected}) {
      return asap(() => {
        var cb, error, value;
        cb = (this.state === FULFILLED ? onFulfilled : onRejected);
        if (typeof cb !== 'function') {
          if (this.state === FULFILLED) {
            promise.fulfill(this.value);
          } else {
            promise.reject(this.value);
          }
          return;
        }
        try {
          value = cb(this.value);
          return promise.fulfill(value);
        } catch (error1) {
          error = error1;
          return promise.reject(error);
        }
      });
    }

    handle(data) {
      var promise;
      promise = this;
      while (promise.state !== REJECTED && promise.value instanceof Promise) {
        promise = promise.value;
      }
      if (promise.state === PENDING) {
        return promise.queue.push(data);
      } else {
        return promise.handleResolved(data);
      }
    }

    then(onFulfilled, onRejected) {
      var promise;
      promise = new Promise(function() {});
      this.handle({promise, onFulfilled, onRejected});
      return promise;
    }

  };

  module.exports = Promise;

}).call(this);
