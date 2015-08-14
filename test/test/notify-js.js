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
      notify.about('test-when', r);
      wru.assert('it was invoked', i === 1);
      notify.about('test-when', r);
      wru.assert('it was NOT invoked', i === 1);
      notify.when('test-when', increase);
      wru.assert('it was invoked again', i === 2);
    }
  },{
    name: 'about',
    test: function () {
      var
        r1 = Math.random(),
        r2 = r1 + Math.random(),
        v
      ;
      function about(value) { v = value; }
      notify.when('test-about', about);
      wru.assert(v === undefined);
      notify.about('test-about', r1);
      wru.assert(v === r1);
      v = null;
      notify.when('test-about', about);
      notify.about('test-about', r2);
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
      notify.about('test-drop', r);
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
      other.about('test-new', r);
      wru.assert('it was invoked as other', which === 'other');
      notify.about('test-new', r);
      wru.assert('it was invoked as notify', which === 'othernotify');
    }
  },{
    name: 'multiple arguments',
    test: function () {
      var args;
      function increase() { args = arguments; }
      notify.when('test-multiple-arguments', increase);
      notify.about('test-multiple-arguments', 1, 2);
      wru.assert(args[0] === 1 && args[1] === 2);
    }
  },{
    name: 'create callback',
    test: function () {
      var args;
      function increase() { args = arguments; }
      notify.when('test-create-callback', increase);
      var fn = notify.about('test-create-callback');
      wru.assert('a function is returned', typeof fn === 'function');
      wru.assert('nothing was resolved', !args);
      fn('a', 'b', 'c');
      wru.assert('listeners was invoked',
        args[0] === 'a' &&
        args[1] === 'b' &&
        args[2] === 'c'
      );
    }
  }
]);