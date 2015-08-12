notify-js [![build status](https://secure.travis-ci.org/WebReflection/notify-js.svg)](http://travis-ci.org/WebReflection/notify-js)
=========
A simplified notification channel for global, or local, interaction.


### API
There are 4 methods, described as such:

  * `notify.when(type, callback)` to add a listener associated to a specific type/event. If such type was already resolved, it will synchronously invoke the callback.
  * `notify.about(type, value)` to resolve a type/event with a value. Whatever listener was waiting for it, it will be invoked with such value passed as argument. Whatever listener will be added in the future through `when` it'll be instantly resolved with such value.
  * `notify.drop(type, callback)` in case something hasn't happened yet and we changed our mind about waiting for the event, we can still remove it!
  * `notify.new()` create a new `notify`-like object. By default, `notify` is a global communication channel, but it brings this simple method that will create a new object for private communication purpose, if needed.

In order to use private channels, feel free to create unique IDs as type, or simply use a `Symbol`, whenever available.


#### Example
```js
// assuming "data" event hasn't happened yet
notify.when("data", function (data) {
  console.log(data);
});

// whenever it will happen
notify.about("data", {any:'value'});
// all listeners waiting for it, will be triggered


// what if you add a listener after the `.about` call?
notify.when("data", function (data) {
  console.log('yep, instantly called!', data);
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

### Compatibility
Notify has been created in a full cross platform, browser, engine way, and it's compatible down to IE6 on Desktop, and every mobile browser I could test.

If it wasn't for [this Espruino bug](https://github.com/espruino/Espruino/issues/561) it would have worked in there too.