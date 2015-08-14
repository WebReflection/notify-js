notify-js [![build status](https://secure.travis-ci.org/WebReflection/notify-js.svg)](http://travis-ci.org/WebReflection/notify-js)
=========
A simplified notification channel for global, or local, interaction.


### API
There are 4 methods, described as such:

  * `notify.when(type, callback)` to add a listener associated to a specific type/event. If such type was already resolved, it will synchronously invoke the callback.
  * `notify.about(type, any1[, any2[, ...]])` returns a callback used to resolve the `type` with received arguments, once executed,
    or resolve directly type passing one or more arguments. Whatever listener was waiting for it, it will be invoked with those parameters. Whatever listener will be added in the future through `when` it'll be instantly resolved with those values.
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
notify.about("data", {any:'value'});
// all listeners waiting for it, will be triggered


// what if you add a listener after the `.about` call?
notify.when("data", function (data) {
  console.log('yep, instantly called!', data);
  // data will be exactly {any:'value'}
});


// what if we redefine data ?
notify.about("data", {another:'value'});
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

It is also possible to use `.about(type)` in order to generate a callback
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
  notify.about('config-available')
);
```

Whenever the last `notify.about` will be executed, all listeners waiting for it will be triggered.


## Which file ?
Browsers could use [the minified version](build/notify-js.js), otherwise there is a [node module](build/notify-js.node.js)
which is also available via npm as `npm install notify-js`.



### Compatibility
Notify has been created in a full cross platform, browser, engine way, and it's compatible down to IE6 on Desktop, and every mobile browser I could test.

If it wasn't for [this Espruino bug](https://github.com/espruino/Espruino/issues/561) it would have worked in there too.