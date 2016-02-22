var expect = require('expect.js');
var Base = require('../base');
var $ = require('jquery');

function isObj (obj) {
  return !!(obj &&
            Object.prototype.toString.call(obj) === '[object Object]' &&
            obj.constructor &&
            // obj.constructor.prototype &&
            obj.constructor.prototype.hasOwnProperty &&
            obj.constructor.prototype.hasOwnProperty('isPrototypeOf'));
}

describe('isObj', function() {
  it('number', function() {
    expect(isObj(1)).to.be(false);
  });

  it('string', function() {
    expect(isObj('1')).to.be(false);
  });

  it('{}', function() {
    expect(isObj({})).to.be.ok();
  });

  it('[]', function() {
    expect(isObj([])).not.to.be.ok();
  });

  it('node', function() {
    expect(isObj(document.body)).not.to.be.ok();
  });

  it('$(node)', function() {
    expect(isObj($(document.body))).not.to.be.ok();
  });

  it('new Base', function() {
    var base = new Base();
    expect(isObj(base)).not.to.be.ok();
  });
});

describe('aspect', function() {

  it('before/after', function() {
    var index = 0;
    var BaseA = Base.extend({
      defaults: {
        index: 0
      },
      show: function() {
        index = 1;
      }
    });
    var baseA = new BaseA();
    baseA.before('show', function() {
    
    });
  });
});

describe('pandora-base', function() {

  it('new', function() {
    expect(new Base()).not.equal(new Base());
  });

  it('constructor', function() {
    var BaseA = Base.extend();
    var baseA = new BaseA();

    expect(baseA.constructor).to.be(BaseA);
    expect(baseA.constructor).not.to.equal(Base);
  });

  it('instanceof', function() {
    var BaseA = Base.extend();
    var baseA = new BaseA();

    expect( baseA instanceof BaseA).to.be.ok();
    expect( baseA instanceof Base).to.be.ok();
  });

  it('extend', function() {
    var BaseA = Base.extend({
      world: 'earth',
      hello: function () {
        return 'hello ' + this.world;
      }
    });
    var baseA = new BaseA();

    expect(baseA.world).to.be('earth');
    expect(baseA.hello()).to.be('hello earth');
  });

  it('destroy', function() {
    var BaseA = Base.extend({
    });
    var baseA = new BaseA({
    });
    baseA.destroy();
    baseA.destroy();

    expect(baseA.__options).to.be(undefined);
  });

  it('state', function() {
    var BaseA = Base.extend({
    });
    var baseA = new BaseA({
    });
    expect(baseA.state()).to.be(undefined);
    baseA.state(1);
    expect(baseA.state()).to.be(1);
  });

  it('option/get', function() {
    var BaseA = Base.extend({
      defaults: {
        y: 5,
        z: 4
      }
    });
    var events = {
      a: function () {
      },
      b: function () {
      }
    };
    var baseA = new BaseA({
      x: 2,
      y: 3,
      z: { a: 1 },
      events: events
    });
    expect(baseA.option()).to.eql({
      x: 2,
      y: 3,
      z: { a: 1 },
      events: events
    });

    expect(baseA.option('y')).to.be(3);
    expect(baseA.option('z/a')).to.be(1);
    expect(baseA.option('z/b')).to.be(undefined);
    expect(baseA.option('w')).to.be(undefined);
    expect(baseA.option('events')).to.eql(events);
    
    
  });

  it('option/set', function() {
    var BaseA = Base.extend({
    });
    var baseA = new BaseA({
    });
    expect(baseA.option('a/b/c/d', '1')).to.be(baseA);
    expect(baseA.option('a')).to.eql({b:{c:{d:'1'}}});
    expect(baseA.option('a/b')).to.eql({c:{d:'1'}});
    expect(baseA.option('a/b/c')).to.eql({d:'1'});
    expect(baseA.option('a/b/c/d')).to.equal('1');
    expect(baseA.option('a/b/c/d/e')).to.equal(undefined);
    expect(baseA.option('hasOwnProperty')).to.equal(undefined);
    expect(baseA.option('b')).to.equal(undefined);
    expect(baseA.option({a: '2'})).to.be(baseA);
    expect(baseA.option('a')).to.be('2');
    expect(baseA.option('a/b')).to.be(undefined);
    expect(baseA.option()).to.eql({a: '2'});
  });

  it('option/set/array', function() {
    var BaseA = Base.extend({
    });
    var baseA = new BaseA({
    });
    baseA.option('a', [1,2]);
    expect(baseA.option('a')).to.eql([1,2]);
    
    baseA.option('a', [3]);
    expect(baseA.option('a')).to.eql([3,2]);
    
    baseA.option('a', 3);
    expect(baseA.option('a')).to.equal(3);

    baseA.option('a', {b:[1,2]});
    expect(baseA.option('a/b')).to.eql([1,2]);

    baseA.option('a/b', [3]);
    expect(baseA.option('a/b')).to.eql([3,2]);

    baseA.option('a/b', 3);
    expect(baseA.option('a/b')).to.be(3);
  });

  it('option/set/null', function() {
    var BaseA = Base.extend({
    });
    var baseA = new BaseA({
    });
    baseA.option('a', 'test');
    expect(baseA.option('a')).to.be('test');
    baseA.option('a', null);
    expect(baseA.option('a')).to.be(null);
    baseA.option('a/b', 'test');
    expect(baseA.option('a/b')).to.be('test');
    baseA.option('a/b', null);
    expect(baseA.option('a/b')).to.be(null);
  });

  it('events', function() {
    var base = new Base({
      events: {
        test: function (e, t) {
          this.t = t;
          this.e = e;
        },
        test2: 'setup',
        test3: 'nothing'
      }
    });
    base.fire('test', '2');
    expect(base.e.type).to.be('test');
    expect(base.t).to.be('2');
    base.off('test');
    base.fire('test', '4');
    expect(base.t).to.be('2');
  });

  it('AOP', function() {
    var BaseA = Base.extend({
      hello: function () {
        return 'hello ' + this.option('world');
      }
    });
    var baseA = new BaseA({
      events: {
        'before:hello': function () {
          if (this.option('world') === 'mars') {
            return false;
          }
          this.option('world', 'mars');
          expect(true).to.be.ok();
        },
        'after:hello': function (e, result) {
          expect(true).to.be.ok();
        },
        'after:hello2': function (e, result) {
        }
      },
      world: 'earth'
    });
    expect(baseA.hello()).to.be('hello mars');
    expect(baseA.hello()).to.be(undefined);
  });

});
