//remove:
var main = require('../build/notify-js.node.js');
//:remove

wru.test([
  {
    name: "main",
    test: function () {
      wru.assert(typeof main == "object");
      // wru.assert(0);
    }
  }
]);
