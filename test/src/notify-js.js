/**
 * // assuming "data" event hasn't happened yet
 * notify.when("data", function (data) {
 *   console.log(data);
 * });
 *
 * // whenever it will happen
 * notify.that("data", {any:'value'});
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
        args: null,
        cb: []
      });
  }

  function that(type) {
    var
      len = arguments.length,
      i = 1,
      info = get(type),
      cb
    ;
    // in case it's invoked
    // without any error or value
    if (i === len) {
      // creates a callback
      // that once  invoked will resolve
      return function () {
        var args = [type];
        args.push.apply(args, arguments);
        return that.apply(null, args);
      };
    }
    // in  every other case
    // resolve the type with any amount
    // of arguments received
    else {
      info.args = [];
      while (i < len) info.args.push(arguments[i++]);
      i = 0;
      len = info.cb.length;
      // be sure the list of waiting listeners
      // will be cleaned up so these won't
      // every be notified more than  once
      // ( unless these are passed again via `.when` )
      // NOTE:  .splice(0) would be enough
      //        but IE8 wants the length too
      cb = info.cb.splice(0, len);
      // notify all of them
      while (i < len) cb[i++].apply(null, info.args);
    }
  }

  // freeze, if possible, the notify object
  // to be sure no other scripts can change its methods
  return (O.freeze || O)({

    // There are two ways to use this method
    //
    // .when(type, callback)
    //    add a listener to a generic type
    //    whenever such type will happen
    //    or if it happened already
    //    invoke the callback with the resolved value
    //
    // .when(type)
    //    return a new Promise that will be resolved
    //    once the notification will happen
    //
    //    notify.when('event').then(function (data) { ... });
    //
    when: function when(type, callback) {
      var info = get(type), out;
      if (arguments.length === 1) {
        out = new Promise(function (resolve) {
          callback = resolve;
        });
      }
      if (info.args) {
        callback.apply(null, info.args);
      } else if(indexOf.call(info.cb, callback) < 0) {
        info.cb.push(callback);
      }
      return out;
    },

    // .about is an alias for .that
    // There are two ways to use this method
    //
    // .about(type)
    //    will return a callback
    //    that will try to resolve once executed
    //    fs.readFile('setup.json', notify.about('setup.json'))
    //
    // overload
    // .that(type, any1[, any2[, ...]])
    //    resolve type passing anyValue around
    //
    //    // through one argument
    //    notify.that('some-event', {all: 'good'});
    //    // through more arguments
    //    notify.that('some-event', null, 'OK');
    //
    about: that,
    that: that,

    // if we set a listener through `.when`
    // and this hasn't been notified yet
    // but we changed our mind about such notification
    // we can still remove such listener via `.drop`
    drop: function drop(type, callback) {
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