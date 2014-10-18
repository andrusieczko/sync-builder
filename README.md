sync-builder [![Build Status](https://travis-ci.org/andrusieczko/sync-builder.svg?branch=master)](https://travis-ci.org/andrusieczko/sync-builder)
============

Wrapper to run asynchronous code in a synchronous way.

Let you transform this:

    utils.async().then(function() {
      utils.sync();
      return utils.async();
    }).then(function() {
      return utils.async();
    }).then(function() {
      utils.sync();
    }).then(function() {
      console.log("done");
    });

into this:

    SyncBuilder(utils)
      .async()
      .sync()
      .async()
      .async()
      .sync()
      .build(function() {
        console.log("done");
      });

## Installation

### bower

    $ bower sync-builder --save

and include `lib/sync-builder.js` or `lib/sync-builder.min.js` and use it globally (`SyncBuilder`) or using *AMD* or *CommonJS* (`sync-builder`).

### npm

    $ npm install sync-builder --save

and use it:

    var SyncBuilder = require('sync-builder');

### Download

Download the source file: [sync-builder.js](https://raw.githubusercontent.com/andrusieczko/sync-builder/master/lib/sync-builder.js) or production version: [sync-builder.min.js](https://raw.githubusercontent.com/andrusieczko/sync-builder/master/lib/sync-builder.min.js).


## Example

    var utils = {

      async: function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            console.log("async");
            resolve();
          }, 0);
        });
      },

      sync: function() {
        console.log("sync")
      }

    };

    var builder = SyncBuilder(utils);
    builder
      .async()
      .sync()
      .async()
      .async()
      .sync()
      .build(function() {
        console.log("done");
      });

Expected output order:

    async
    sync
    async
    async
    sync
    done

To achieve the same without `SyncBuilder`:

    utils.async().then(function() {
      utils.sync();
      return utils.async();
    }).then(function() {
      return utils.async();
    }).then(function() {
      utils.sync();
    }).then(function() {
      console.log("done");
    });

## Wrap your object instance

Let's consider John, who has to work to earn money. John spends 1 second to get 500 cents:

    var Person = function(budget, salary) {
      this.budget = budget;
      this.salary = salary;
    };
    Person.prototype = {
      goToWork: function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            this.budget += this.salary;
            resolve();
          }.bind(this), 1000);
        }.bind(this));
      },
      printBudget: function() {
        console.log(this.budget);
      }
    };

If we run code synchronously, we don't get desired results:

    var johnKowalski = new Person(1000, 500);
    johnKowalski.goToWork(); // adds 500 to budget after 1 second
    johnKowalski.printBudget(); // prints 1000 immediately

Using the wrapper, we get the expected result:

    var johnKowalski = new Person(1000, 500);
    var builder = new SyncBuilder(johnKowalski);
    builder
      .goToWork()
      .printBudget()
      .build(); // prints 1500 after 1 second

## Motivation

I had a set of utils method to test my component:

    // given component
    var testUtils = {
      checkWidth: function(width) {
        equal(component.width, width);
      },
      click: function() {
        component.click(); // async, ready on 'ready' event
      },
      move: function(x) {
        component.move(); // async, ready on 'moved' event
      }
    }

To get it working, I had to use promises:

    // given component
    var testUtils = {
      checkWidth: function(width) {
        equal(component.width, width);
      },
      click: function() {
        component.click(); // async

        return new Promise(function(resolve) {
          component.on('ready', function() {
            resolve();
          }
        });
      },
      move: function(x) {
        component.move(); // async

        return new Promise(function(resolve) {
          component.on('moved', function() {
            resolve();
          });
        });
      }
    }

The best I could do with `then` chaining was:

    testUtils.checkWidth(100);
    testUtils.click().then(function() {
      testUtils.checkWidth(100);
      return testUtils.move();
    }).then(function() {
      testUtils.checkWidth(150);
      return testUtils.click();
    }).then(function() {
      testUtils.checkWidth(100);
    });

which is not bad but clearly not readable... Using `SyncBuilder`, we can achieve the same functionality in a readable way:

    var testUtilsBuilder = new SyncBuilder(testUtils);
    testUtilsBuilder
      .checkWidth(100)
      .click()
      .checkWidth(100)
      .move()
      .checkWidth(150)
      .click()
      .checkWidth(150)
      .build();

Isn't it more understandable? :)

## API

SyncBuilder wraps all the methods from your object (whether it's a literal or an instance) and make it public to you.

If you want to create synchronous function, you should not return anything.
If you want to create a asynchronous function, you should return a `Promise`.
The only requirement for being a `Promise` is to have a `then` function that is called after your asyncronous code was run.

    var utils = {
      sync: function() {
        // your code
      },
      async: function() {
        // your async code
        return promise;
      }
    }

Don't forget to call `build()` method at the end!

    new SyncBuilder().async().sync().build();

`build()` method itself takes a callback to be called after all the methods:

    new SyncBuilder().async().sync().build(function() {
      console.log("I'm done");
    });

You can pass a context and arguments to `build()` method as well:

    new SyncBuilder().async().sync().build(function(a1, a2) {
      // this === context
      // a1 === arg1
      // a2 === arg2
      console.log("I'm done");
    }, context, arg1, arg2);

### Arguments

You can pass arguments to your functions:

    var utils = {

      async: function(text) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            console.log(text);
            resolve();
          }, 0);
        });
      },

      sync: function(text, number) {
        console.log(text, number)
      }

    };

    new SyncBuilder(utils)
      .async("I'm asynchronous")
      .sync("Sync here", 1)
      .sync("Again sync", 2)
      .build();

the result:

    I'm asynchronous
    Sync here 1
    Again sync 2

### Promises

In the examples, I used *ES6 Promises* syntax. Here is which browsers support it at the moment: [http://kangax.github.io/compat-table/es6/#Promise](http://kangax.github.io/compat-table/es6/#Promise).

You can use any other library like [q](https://github.com/kriskowal/q) or [jQuery promise](http://api.jquery.com/promise/).