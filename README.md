sync-builder
============

Wrapper to build asynchronous code in a synchronous way.

Example:

    var utils = {

      async: function() {
        var deferred = Q.defer();
        setTimeout(function() {
          console.log("async");
          deferred.resolve();
        }, 100);
        return deferred.promise;
      },

      sync: function() {
        console.log("sync")
      }

    };

    var builder = SyncBuilder(utils);
    builder
      .async().sync().async().async().sync()
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

## Wrap your object instance

Let's consider John, who has to work to earn money. John spends 1 second to get 500 cents:

    var Person = function(budget, salary) {
      this.budget = budget;
      this.salary = salary;
    };
    Person.prototype = {
      goToWork: function() {
        return Q.Promise(function(resolve) {
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

If we run code synchronously, we get not desired results:

    var johnKowalski = new Person(1000, 500);
    johnKowalski.goToWork();
    johnKowalski.printBudget(); // prints 1000

Using the wrapper, we get the expected result:

    var johnKowalski = new Person(1000, 500);
    var builder = new SyncBuilder(johnKowalski);
    builder
      .goToWork()
      .printBudget()
      .build(); // prints 1500