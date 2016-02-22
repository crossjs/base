
# API 说明

- order: 3

---

## defaults

默认参数设置，可通过 .option 设置  

```js
var Animal = Base.extend({
  defaults: {
    name: '大象'
  },
  say: function() {
    this.option('feature', '会飞的')
    console.log('我是' + this.option('feature') + this.option('name'));
  }
});
```

## state `.state([state])`

存取状态

## option `.option(key, value, context, override)`

```js
var baseA = new Base({
  x: 2,
  y: 3,
  z: { a: 1 }
});
baseA.option('z/a'); // => 1
```

存取初始化后的数据/参数，支持多级存取

## initEvents `.initEvents()`

初始化订阅事件

## destroy `.destroy()`

销毁当前组件实例
