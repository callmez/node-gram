const _ = require('lodash')
const axios = require('axios')
const Promise = require('bluebird')
const toArrayBuffer = require('to-arraybuffer')

// Promise.config({ cancellation: true }) // TODO 解决 cannot enable cancellation after promises are in use

// @see https://github.com/mattlewis92/angular-bluebird-promises

// In regards to: https://github.com/petkaantonov/bluebird#for-library-authors
// My reasoning behind not doing this is to prevent bundling bluebird code with this library

function $q(resolve, reject) {
  return new Promise(resolve, reject);
}

$q.prototype = Promise.prototype;
_.extend($q, {
  resolve: Promise.resolve,
  reject: Promise.reject,
  all: Promise.all,
  race: Promise.race,
  when: Promise.resolve,
  props: Promise.props,
});

//Make bluebird API compatible with angular's subset of Q
//Adapted from: https://gist.github.com/petkaantonov/8363789 and https://github.com/petkaantonov/bluebird-q

$q.defer = function() {
  const deferred = {};
  deferred.promise = $q((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise.progressCallbacks = [];
  deferred.notify = function(progressValue) {
    deferred.promise.progressCallbacks.forEach(cb => typeof cb === 'function' && cb(progressValue));
  };
  return deferred;
};

const originalAll = $q.all;
$q.all = function(promises) {
  if (typeof promises === 'object' && !Array.isArray(promises)) {
    return $q.props(promises);
  } else {
    return originalAll(promises);
  }
};

const originalThen = $q.prototype.then;
$q.prototype.then = function(fulfilledHandler, rejectedHandler, progressHandler) {
  if (this.progressCallbacks) {
    this.progressCallbacks.push(progressHandler);
  }
  return originalThen.call(this, fulfilledHandler, rejectedHandler, progressHandler);
};

const originalFinally = $q.prototype.finally;
$q.prototype.finally = function(finallyHandler, progressHandler) {
  if (this.progressCallbacks) {
    this.progressCallbacks.push(progressHandler);
  }
  return originalFinally.call(this, finallyHandler);
};


// @see angular.$timeout
var deferreds = {};
var $timeout = (fn, delay, invokeApply) => {
  if (!_.isFunction(fn)) {
    invokeApply = delay;
    delay = fn;
    fn = noop;
  }

  var args = [].slice.call(arguments, 3),
    // skipApply = (typeof invokeApply !== 'undefined' && !invokeApply),
    deferred = $q.defer(),
    promise = deferred.promise,
    timeoutId;

  timeoutId = setTimeout(function() {
    try {
      deferred.resolve(fn.apply(null, args));
    } catch (e) {
      deferred.reject(e);
    } finally {
      delete deferreds[promise.$$timeoutId];
    }
  }, delay);

  promise.$$timeoutId = timeoutId;
  deferreds[timeoutId] = deferred;

  return promise;
}
$timeout.cancel = function(promise) {
  if (promise && promise.$$timeoutId in deferreds) {
    // deferreds[promise.$$timeoutId].reject('canceled');
    deferreds[promise.$$timeoutId].promise.cancel();
    delete deferreds[promise.$$timeoutId];
    return clearTimeout(promise.$$timeoutId);
  }
  return false;
};

var $http = axios.create({
  transformResponse: [
    // Node 的buffer 和 chrome的 ArrayBuffer 有差异, 所以不发送buffer格式
    data => Buffer.isBuffer(data) ? toArrayBuffer(data) : data
  ]
})

module.exports = {
  $q,
  $timeout,
  $http,
  $interval: (fn, delay) => {
    return new Promise((resolve, reject) => {
      setInterval(() => {
        try {
          resolve(fn());
        } catch (e) {
          reject(e);
        }
      }, delay)
    })
  },
}
