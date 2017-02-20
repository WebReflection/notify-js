notify-js [![build status](https://secure.travis-ci.org/WebReflection/notify-js.svg)](http://travis-ci.org/WebReflection/notify-js) [![Coverage Status](https://coveralls.io/repos/github/WebReflection/notify-js/badge.svg?branch=master)](https://coveralls.io/github/WebReflection/notify-js?branch=master)
=========

A simplified global or private notification channel for values that happened in the past,
and those that will happen in the future.
[Related blog entry](https://www.webreflection.co.uk/blog/2015/08/14/the-line-between-events-and-promises).


## API
There are 2 main methods such `.that(type[, any1[, any2[, ...]]])` and `.when(type[, callback])`,
plus 3 extra helpers such `.drop(type, callback)`, `.all(type, callback)`, and `.new()`.


### notify.that(type[, ...])
This method is useful to notify about a generic channel.

```js
// whenever it happens ...
navigator.geolocation.getCurrentPosition(info => {
  // ... notify anyone asking for 'geo:position'
  notify.that('geo:position', info);
});

// equivalent shortcut, will resolve
// with the first argument
navigator.geolocation.getCurrentPosition(
  notify.that('geo:position')
);

// NodeJS API compatible
fs.readFile(
  'package.json',
  notify.that('fs:package.json')
);
```


#### notify.that(type) and Promises
This method can also be used as middleware, passing along whatever first argument it receives.

```js
// middleware
connectToDb
  // resolves and returns the value
  .then(notify.that('db:connected'))
  .then(readDatabaseInfo);
```


### notify.when(type[, callback])
Usable both through callbacks or as `Promise`, the `.when` method asks for a channel and resolves it once available.

```js
// using a callback
notify.when('geo:position', info => {
  console.log(info.coords);
});

// Promise based
notify.when('geo:position').then(info => {
  console.log(info.coords);
})
```

It doesn't matter if `.when` is used before or after a channel has been resolved, it will always pass along the last known resolved value.

```js
// log on 'timer' channel (will log 123)
notify.when('timer', console.log);

// resolves the channel with value 1
notify.that('timer', 123);

setTimeout(() => {
  // log resolved 'timer' channel value
  // (will log 123)
  notify.when('timer', console.log);
}, 200);
```


#### Callback or Promise ?
If you are resolving older APIs like NodeJS `require('fs').readFileSync`,
you probably want to use a callback because the resolution will pass along two arguments instead of one.

```js
fs.readFile(
  'package.json',
  (err, blob) => {
    notify.that('fs:package.json', err, blob);
  }
);

notify.when('fs:package.json', (err, blob) => {
  if (err) return console.error(err);
  console.log(blob.toString());
});
```

As previously mentioned, you can still use the shortcut to resolve with all arguments once that happens.

```js
fs.readFile(
  'package.json',
  notify.that('fs:package.json')
);
```


### notify.drop(type, callback)
Usable only for callbacks registered via `notify.when(type, callback)`,
the `.drop` method avoid triggering the channel in the immediate present or future.

```js
function log(value) {
  console.log(value);
}

// wait for it to happen
notify.when('happened', log);

// change your mind
notify.drop('happened', log);

// whenever it happens
// nothing will be logged
notify.that('happened', 'nope');
```
This method is particularly handy in conjunction of the `notify.all(type, callback)` method.


### notify.all(type, callback)
In case you'd like to react every time a channel is updated,
this method will register the `callback` and invoke it with the latest resolution each time.

```js
// each position change
navigator.geolocation.watchPosition(
  // update with latest info
  notify.that('geo:position')
);


// react to all position changes
notify.all(
  'geo:position',

  // tracker
  info => {
    console.log(info.coords);
  }
);
```

Registered callbacks can be dropped through the `notify.drop(type, callback)` method.

### notify.new()
There are basically two ways to have a private notification channel:

  * using a private `Symbol` as channel, like in `notify.when(privateSymbol).then(log)`
  * create a local version of the notifier that will share nothing with the main one, like in `const notifyPVT = notify.new();`


## Which file ?
Browsers could use [the minified version](https://github.com/WebReflection/notify-js/blob/master/build/notify-js.js), otherwise there is a [node module](https://github.com/WebReflection/notify-js/blob/master/build/notify-js.node.js)
which is also available via npm as `npm install notify-js`.


## Compatibility
This library is compatible with every JS engine since ES3, both browser and server,
but a `Promise` polyfill might be needed to use Promise based patterns.
