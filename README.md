notify-js [![build status](https://secure.travis-ci.org/WebReflection/notify-js.svg)](http://travis-ci.org/WebReflection/notify-js)
=========
A simplified notification channel for global, or local, interaction.

In case of doubts, please read the [related blog entry](https://www.webreflection.co.uk/blog/2015/08/14/the-line-between-events-and-promises).


### API
There are 4 methods, described as such:

  * `notify.when(type[, callback])` to add a callback listener associated to a specific type/event or return a promise that will be resolved once the event is executed. If such type was already resolved, it will synchronously invoke the callback.
  * `notify.all(type, callback)` same as `when` but invoked every time the event occurs. The callback is mandatory and it's revokable via `drop`.
  * `notify.that(type[, any1[, any2[, ...]]])` aliased as `.about` resolves a type or returns a callback used to resolve the `type` with received arguments, once executed ( see examples )
  * `notify.drop(type, callback)` in case something hasn't happened yet and we changed our mind about waiting for the event, we can still remove it!
  * `notify.new()` create a new `notify`-like object. By default, `notify` is a global communication channel, but it brings this simple method that will create a new object for private communication purpose, if needed.

In order to use private channels, feel free to create unique IDs as type, or simply use a `Symbol`, whenever available.


#### Examples
```js
// assuming "data" event hasn't happened yet
notify.when("data", function (data) {
  console.log(data);
});

// whenever it will happen, resolve via {any:'value'}
notify.that("data", {any:'value'});
// all listeners waiting for it, will be triggered


// what if you add a listener after the `.that` call?
notify.when("data", function (data) {
  console.log('yep, instantly called!', data);
  // data will be exactly {any:'value'}
});


// what if we redefine data ?
notify.that("data", {another:'value'});
// from now on, whoever will ask `.when` data
// the value will be the updated one
// but every listener already fired and satisfied
// will be simply ignored


// what if I want to be sure the channel is private?
// feel free to use a Symbol as channel
var myPrivateSymbol = Symbol();
notify.when(myPrivateSymbol, ...);

// otherwise create a new notify like variable
var privateNotify = notify.new();
```

It is also possible to use `.that(type)` in order to generate a callback
that once invoked will resolve the type.

Example
```js
var fs = require('fs');
var notify = require('notify-js');


// before or after, it doesn't matter
notify.when('config-available', function (err, content) {
  if (err) console.warn('damn it');
  else console.log(content);
});


// at any time in the past, present, or future
fs.readFile(
  'config.json',
  notify.that('config-available')
);
```

Whenever the last `notify.that` will be executed, all listeners waiting for it will be triggered.



#### New in 1.2.0 - optional Promise behavior

If the `.when` method is **invoked without passing a callback**, it will return a `Promise` that will be resolved once the event will be called.

```js
// an ES7 future coming next  to you soon
var coords = await notify.when('geoposition:available');


// keep a promise for future .then(cb) usage
var getCoords = notify.when('geoposition:available');

// don't keep a promise, but use it as such
notify.when('geoposition:available').then(function (coords) {
  // use coords
});


// equivalent, NON Promise based result
notify.when('geoposition:available', function (coords) {
  // use coords
});
// if the callback is specified, no Promise will ever be
// created or returned to avoid resolution race and
// conflicts between these two different patterns
```
Please note this library is *not in charge of providing any polyfill*, so if a `Promise` is needed, please be sure your target engines support it. Alternatively, if there is no `Promise` constructor available, this library will throw a `ReferenceError`.



## Which file ?
Browsers could use [the minified version](https://github.com/WebReflection/notify-js/blob/master/build/notify-js.js), otherwise there is a [node module](https://github.com/WebReflection/notify-js/blob/master/build/notify-js.node.js)
which is also available via npm as `npm install notify-js`.



### Compatibility
Notify has been created in a full cross platform, browser, engine way, and it's compatible down to IE6 on Desktop, and every mobile browser I could test.

If it wasn't for [this Espruino bug](https://github.com/espruino/Espruino/issues/561) it would have worked in there too.

There is a [live test page](http://webreflection.github.io/notify-js/test/) which, if green, would indicate everything is fine.