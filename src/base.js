define(function (require, exports, module) {

/**
 * 基类
 *
 * @module Base
 */

'use strict';

var Class = require('class'),
  Events = require('events');

var Aspect = require('./aspect');

/**
 * 基类
 *
 * 实现 事件订阅 与 Aspect (AOP)
 *
 * @class Base
 * @constructor
 * @implements Events
 * @implements Aspect
 *
 * @example
 * ```
 * // 创建子类
 * var SomeBase = Base.extend({
 *   someMethod: function () {
 *     this.fire('someEvent');
 *   }
 * });
 * // 实例化
 * var someBase = new SomeBase({
 *   events: {
 *     someEvent: function () {
 *       console.log('someEvent fired');
 *     }
 *   }
 * });
 * // 调用方法
 * someBase.someMethod();
 * // 控制台将输出：
 * // someEvent fired
 * ```
 */
var Base = Class.create({

  /**
   * 初始化函数，将自动执行；执行参数初始化与订阅事件初始化
   *
   * @method initialize
   * @param {Object} options 参数
   */
  initialize: function (options) {
    Base.superclass.initialize.apply(this, arguments);

    // 初始化参数
    this.__options = mergeDefaults(this, options || {});

    // 初始化订阅事件
    this.initEvents();
  },

  mixins: [Events.prototype, Aspect.prototype],

  /**
   * 默认参数，子类自动继承并覆盖
   *
   * @property {Object} defaults
   * @type {Object}
   */
  defaults: { },

  /**
   * 存取状态
   *
   * @method state
   * @param {Number} [state] 状态值
   * @return {Mixed} 当前状态值或当前实例
   */
  state: function (state) {
    if (state === undefined) {
      return this.__state;
    }

    this.__state = state;
    return this;
  },

  /**
   * 存取初始化后的数据/参数，支持多级存取，
   * 如：this.option('rules/remote') 对应于 { rules: { remote: ... } }
   *
   * @method option
   * @param {String} [key] 键
   * @param {Mixed} [value] 值
   * @param {Object} [context] 上下文
   * @return {Mixed} 整个参数列表或指定参数值
   */
  option: function (key, value, context, override) {
    var options = context || this.__options;

    if (key === undefined) {
      return options;
    }

    function get () {
      var keyArr = key.split('/');

      while ((key = keyArr.shift())) {
        if (options.hasOwnProperty(key)) {
          options = options[key];
        } else {
          return undefined;
        }
      }

      return options;
    }

    function set () {
      var keyMap = {};

      function recruit (obj, arr) {
        key = arr.shift();

        if (key) {
          obj[key] = recruit({}, arr);
          return obj;
        }

        return value;
      }

      recruit(keyMap, key.split('/'));

      copy(options, keyMap, override);
    }

    function isObj (obj) {
      return Object.prototype.toString.call(obj) === '[object Object]';
    }

    function copy (target, source, override) {
      var p, obj;
      for (p in source) {
        obj = source[p];

        if (!override && isObj(obj)) {
          isObj(target[p]) || (target[p] = {});
          copy(target[p], obj, false);
        } else {
          target[p] = obj;
        }
      }
    }

    if (typeof key === 'string') {
      if (value === undefined) {
        return get();
      } else {
        set();
      }
    } else {
      // plain object
      copy(options, key, override);
    }

    return this;
  },

  /**
   * 事件订阅，以及AOP
   *
   * @method initEvents
   * @param {Object|Function} [events] 事件订阅列表
   * @return {Object} 当前实例
   */
  initEvents: function (events) {
    var self = this;

    events || (events = this.option('events'));

    if (!events) {
      return this;
    }

    $.each(events, function (event, callback) {
      var match;

      if (typeof callback === 'string') {
        callback = self[callback];
      }

      if (typeof callback !== 'function') {
        return true;
      }

      match = /^(before|after):(\w+)$/.exec(event);

      if (match) {
        // AOP
        self[match[1]](match[2], callback);
      } else {
        // Subscriber
        self.on(event, callback);
      }
    });

    return this;
  },

  /**
   * 销毁当前组件实例
   * @method destroy
   */
  destroy: function () {
    var prop;

    // 移除事件订阅
    this.off();

    // 移除属性
    for (prop in this) {
      if (this.hasOwnProperty(prop)) {
        delete this[prop];
      }
    }

    this.destroy = function() { };
  }

});

function mergeDefaults(instance, options) {
  var arr = [options],
    proto = instance.constructor.prototype;

  while (proto) {
    if (proto.hasOwnProperty('defaults')) {
      arr.unshift(proto.defaults);
    }

    proto = proto.constructor.superclass;
  }

  arr.unshift(true, {});

  return $.extend.apply(null, arr);
}

module.exports = Base;

});
