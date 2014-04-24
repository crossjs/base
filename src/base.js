define(function (require, exports, module) {

/**
 * 基类
 *
 * @module Base
 */

'use strict';

var $ = require('$'),
  Class = require('class'),
  Events = require('events').prototype,

  Aspect = require('./aspect').prototype;

/**
 * 基类
 *
 * 扩展 Events 与 Aspect (AOP)
 *
 * @class Base
 * @constructor
 * @implements Events
 * @implements Aspect
 */
var Base = Class.create(Events, Aspect, {

  /**
   * 初始化函数，将自动执行；实现事件自动订阅与初始化参数
   *
   * @method initialize
   * @param {Object} options 参数
   */
  initialize: function (options) {
    // 初始化参数，只读
    this.__options = mergeDefaults(this, options || {});

    // 初始化事件订阅
    this.initEvents();
  },

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
   * 获取初始化后的数据/参数，支持多级获取，如：this.option('rules/remote')
   *
   * @method option
   * @param {String} [key] 键
   * @param {Mixed} [value] 值
   * @return {Mixed} 整个参数列表或指定参数值
   */
  option: function (key, value) {
    var options = this.__options;

    if (key === undefined) {
      return options;
    }

    function getOption () {
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

    function setOption () {
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

      extendOption(keyMap);
    }

    function extendOption (obj) {
      $.extend(true, options, obj);
    }

    if ($.isPlainObject(key)) {
      extendOption(key);
    } else {
      if (value === undefined) {
        return getOption();
      } else {
        setOption();
      }
    }

    return this;
  },

  /**
   * 事件订阅，以及AOP
   *
   * @method initEvents
   * @param {Object|Function} [events] 订阅事件列表
   * @return {Object} 当前实例
   */
  initEvents: function (events) {
    var self = this;

    events || (events = this.option('events'));

    if (!events) {
      return this;
    }

    $.each(events, function (event, callback) {
      var match = /^(before|after):(\w+)$/.exec(event);

      if (typeof callback === 'string') {
        callback = self[callback];
      }

      if (typeof callback !== 'function') {
        return true;
      }

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
   * 销毁当前组件对象
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
