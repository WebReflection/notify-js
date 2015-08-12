/*!
Copyright (C) 2015 by Andrea Giammarchi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/
var notify = (function () {
/**
 * // assuming "data" event hasn't happened yet
 * notify.when("data", function (data) {
 *   console.log(data);
 * });
 *
 * // whenever it will happen
 * notify.about("data", {any:'value'});
 * // all listeners waiting for it, will be triggered
 *
 *
 * // what if you add a listener after the `.about` call?
 * notify.when("data", function (data) {
 *   console.log('yep, instantly called!', data);
 * });
 *
 *
 * // what if we redefine data ?
 * notify.about("data", {another:'value'});
 * // from now on, whoever will ask `.when` data
 * // the value will be the updated one
 * // but every listener already fired and satisfied
 * // will be simply ignored
 *
 *
 * // what if I want to be sure the channel is private?
 * // feel free to use a Symbol as channel
 * var myPrivateSymbol = Symbol();
 * notify.when(myPrivateSymbol, ...);
 *
 * // otherwise create a new notify like variable
 * var privateNotify = notify.new();
 */
function create(O) {'use strict';

  var
    // create a dictionary, fallback as regular object
    _ = (O.create || O)(null),
    // dictionaries don't have this method, botrrow it
    hOP = O.prototype.hasOwnProperty,
    // IE < 9 doesn't have this method, shim it
    indexOf = Array.prototype.indexOf || function indexOf(v) {
      var i = this.length;
      while (i-- && this[i] !== v) {}
      return i;
    }
  ;

  // check if a private _[type] is known
  // if not, create the info object
  // returns such object either cases
  function get(type) {
    return hOP.call(_, type) ?
      _[type] :
      (_[type] = {
        notified: false,
        value: null,
        cb: []
      });
  }

  // freeze, if possible, the notify object
  // to be sure no other scripts can change its methods
  return (O.freeze || O)({

    // add a listener to a generic type
    // whenever such type will happen
    // or if it happened already
    // invoke the callback with the resolved value
    when: function (type,  callback) {
      var info = get(type);
      if (info.notified) {
        callback(info.value);
      } else if(indexOf.call(info.cb, callback) < 0) {
        info.cb.push(callback);
      }
    },

    // resolve a generic type through a value
    // whatever listener is waiting for this
    // type to be resolved, will be notified
    // with the specified value as parameter
    // if no listeners is waiting for it
    // next time `.when` will be used
    // the callback will be invoked with
    // current parameter as first argument
    about: function (type, value) {
      var
        info = get(type),
        // 0 would be enough
        // but IE8 wants the length too
        // be sure the list of waiting listeners
        // will be cleaned up so these won't
        // every be notified more than  once
        // ( unless these are passed again via `.when` )
        cb = info.cb.splice(0, info.cb.length),
        i = 0
      ;
      info.notified = true;
      info.value = value;
      // notify all of them
      while (i < cb.length) cb[i++](value);
    },

    // if we set a listener through `.when`
    // and this hasn't been notified yet
    // but we changed our mind about such notification
    // we can still remove such listener via `.drop`
    drop: function (type, callback) {
      var
        cb = get(type).cb,
        i = indexOf.call(cb, callback)
      ;
      if (-1 < i) cb.splice(i, 1);
    },

    // create a new notify-like object
    'new': function () {
      return create(O);
    }
  });
}
return create(Object);

}());