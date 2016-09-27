//remove:
var notify = require('../build/notify-js.node.js');
//:remove

wru.test([
  {
    name: "main",
    test: function () {
      wru.assert(typeof notify == "object");
      // wru.assert(0);
    }
  },{
    name: 'when',
    test: function  () {
      var i = 0, r = Math.random();
      function increase() { i++; }
      notify.when('test-when', increase);
      wru.assert('did not happen', i === 0);
      notify.that('test-when', r);
      wru.assert('it was invoked', i === 1);
      notify.that('test-when', r);
      wru.assert('it was NOT invoked', i === 1);
      notify.when('test-when', increase);
      wru.assert('it was invoked again', i === 2);
    }
  },{
    name: 'that',
    test: function () {
      var
        r1 = Math.random(),
        r2 = r1 + Math.random(),
        v
      ;
      function about(value) { v = value; }
      notify.when('test-about', about);
      wru.assert(v === undefined);
      notify.that('test-about', r1);
      wru.assert(v === r1);
      v = null;
      notify.when('test-about', about);
      notify.that('test-about', r2);
      notify.when('test-about', about);
      wru.assert(v === r2);
    }
  },{
    name: 'drop',
    test: function () {
      var i = 0, r = Math.random();
      function increase() { i++; }
      notify.when('test-drop', increase);
      notify.drop('test-drop', increase);
      notify.that('test-drop', r);
      wru.assert('it was NOT invoked', i === 0);
    }
  },{
    name: 'new',
    test: function () {
      var other = notify['new']();
      var which = '', r = Math.random();
      other.when('test-new', function () {
        which += 'other';
      });
      notify.when('test-new', function () {
        which += 'notify';
      });
      other.that('test-new', r);
      wru.assert('it was invoked as other', which === 'other');
      notify.that('test-new', r);
      wru.assert('it was invoked as notify', which === 'othernotify');
    }
  },{
    name: 'multiple arguments',
    test: function () {
      var args;
      function increase() { args = arguments; }
      notify.when('test-multiple-arguments', increase);
      notify.that('test-multiple-arguments', 1, 2);
      wru.assert(args[0] === 1 && args[1] === 2);
    }
  },{
    name: 'create callback',
    test: function () {
      var args;
      function increase() { args = arguments; }
      notify.when('test-create-callback', increase);
      var fn = notify.that('test-create-callback');
      wru.assert('a function is returned', typeof fn === 'function');
      wru.assert('nothing was resolved', !args);
      fn('a', 'b', 'c');
      wru.assert('listeners was invoked',
        args[0] === 'a' &&
        args[1] === 'b' &&
        args[2] === 'c'
      );
    }
  }, {
    name: 'all',
    test: function () {
      var i = 0, r = Math.random();
      function increase() { i++; }
      notify.all('test-all', increase);
      wru.assert('did not happen', i === 0);
      notify.that('test-all', r);
      wru.assert('it was invoked', i === 1);
      notify.that('test-all', r);
      wru.assert('it was invoked', i === 2);
      notify.drop('test-all', increase);
      notify.that('test-all', r);
      wru.assert('it was NOT invoked again', i === 2);
    }
  }
].concat(typeof Promise !== 'undefined' ? [
  {
    name: '.when(type):Promise',
    test:  function () {
      var v = Math.random(), args;
      function increase() { args = arguments; }
      var p = notify.when('test-promise');
      wru.assert('an object has been returned', typeof p === 'object');
      wru.assert('nothing was resolved', !args);
      notify.that('test-promise', v);
      p.then(wru.async(function (value) {
        wru.assert('the value is the right one', value === v);
      }));
    }
  }
] : []));