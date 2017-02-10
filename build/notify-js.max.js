/*!
Copyright (C) 2015-2017 by Andrea Giammarchi

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
var notify = (function () {'use strict';
const create = O => {

  var
    _ = O.create(null),
    drop = (type, callback) => {
      const fn = wm.get(callback);
      if (fn) {
        wm.delete(callback);
        drop(type, fn);
      } else {
        const
          cb = get(type).cb,
          i = cb.indexOf(callback)
        ;
        if (~i) cb.splice(i, 1);
      }
    },
    get = type => (_[type] || (_[type] = {args: null, cb: []})),
    invoke = true,
    resolve = value => Promise.resolve(value),
    that = (type, ...args) => {
      let i = 0, len = args.length;
      if (len < 1)
        return (...args) => that(...[type, ...args]);
      else {
        const
          info = get(type),
          cb = info.cb.splice(i, (len = info.cb.length))
        ;
        info.args = args;
        // something wrong with babili 0.0.11: the following would fail
        // while (i < len) resolve(cb[i++]).then(cb => cb(...args));
        // so I need this silly work around
        const babili = [...args];
        while (i < len) resolve(cb[i++]).then(cb => cb(...babili));
      }
    },
    when = (type, ...args) => {
      const info = get(type), arr = info.args;
      let out, callback = args[0];
      if (args.length < 1)
        out = new Promise(r => (callback = r));
      if (invoke && arr)
        resolve().then(() => callback(...arr));
      else if(!info.cb.includes(callback))
        info.cb.push(callback);
      return out;
    },
    wm = new WeakMap
  ;

  return O.freeze({
    about: that,
    all: (type, callback) => {
      if (!wm.get(callback)) {
        const fn = (...args) => {
          invoke = false;
          when(type, fn);
          invoke = true;
          resolve().then(callback(...args));
        };
        wm.set(callback, fn);
        when(type, fn);
      }
    },
    drop,
    new: () => create(O),
    that,
    when
  });
};
return create(Object);

}());