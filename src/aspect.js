
/**
 * 基类
 *
 * @module Base
 */

'use strict';

/**
 * Aspect 在指定的方法执行前或执行后插入特定函数。
 *
 * http://http://en.wikipedia.org/wiki/Aspect-oriented_programming
 *
 * @class Aspect
 * @constructor
 */
var Aspect = function () { };

Aspect.prototype = {

  /**
   * 方法执行前执行，`callback`返回`false`则阻止原函数执行
   * @method before
   * @param {String} methodName 方法名
   * @param {Function} callback 回调函数
   * @return {Object} 当前实例
   */
  before: function (methodName, callback) {
    return wave.call(this, 'before', methodName, callback);
  },

  /**
   * 方法执行后执行
   * @method after
   * @param {String} methodName 方法名
   * @param {Function} callback 回调函数
   * @return {Object} 当前实例
   */
  after: function (methodName, callback) {
    return wave.call(this, 'after', methodName, callback);
  }

};

function wave (when, methodName, callback) {
  /*jshint validthis: true*/
  var method = this[methodName];

  if (method) {
    if (!method.__aspected) {
      wrap.call(this, methodName);
    }

    this.on(when + ':' + methodName, callback);
  }

  return this;
}

function wrap (methodName) {
  /*jshint validthis: true*/
  var method = this[methodName];

  this[methodName] = function () {
    var args = Array.prototype.slice.call(arguments),
      result;

    // before
    if (this.fire.apply(this, ['before:' + methodName].concat(args)) === false) {
      return;
    }

    // method
    result = method.apply(this, arguments);

    // after
    this.fire.apply(this, ['after:' + methodName, result].concat(args));

    return result;
  };

  this[methodName].__aspected = true;
}

module.exports = Aspect;

