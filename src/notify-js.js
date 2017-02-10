const create = O => {

  let invoke = true;

  const
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