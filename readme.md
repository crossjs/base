# Base

---
Base 基类，提供 [Class](http://10.5.121.139:3001/package/pandora-class)、[Events](http://10.5.121.139:3001/package/pandora-events)、Aspect 支持。
---


## Install

```
$ spm install pandora-base --save
```

## Usage


### extend `Base.extend(properties)`

基于 Base 创建子类

```js

var Base = require('pandora-base');
// car.js
var Car = Base.extend({
  defaults: {
    name: '普通的车'
  },
  say: function () {
    this.fire('someEvent', this.option('name'));
  }
});
// 实例化
var car = new Car({
  name: '神车',
  events: {
    someEvent: function (e, name) {
      console.log('我是' + name);
    }
  }
});
// 调用方法
car.say();
// 控制台将输出：
// 我是神车
```

### Base 与 Class 的关系

Base 是使用 `Class` 创建的一个基础类，默认混入了  `Events`、`Aspect` 模块：

```js

// base.js
var Class = require('pandora-class');
var Events = require('pandora-events');
var Aspect = require('./lib/aspect');

var Base = Class.create({
  mixins: [Events, Aspect],

  initialize: function(options) {
    ...
  },

  ...
});

...

```

