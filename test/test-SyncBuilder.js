var Promise = require('es6-promise').Promise;
var expect = require('expect.js');

var SyncBuilder = require('../lib/sync-builder');

describe('SyncBuilder', function() {

  it('should work with classes', function(done) {
    // given
    var result;

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
          }.bind(this), 0);
        }.bind(this));
      },
      printBudget: function() {
        result = this.budget;
      }
    };
    var johnKowalski = new Person(1000, 500);
    var builder = new SyncBuilder(johnKowalski);

    // when
    builder.goToWork().printBudget().build(function() {
      // then
      expect(result).to.equal(1500);

      done();
    });

  });

  it('should be possible to pass arguments in methods', function(done) {
    // given
    var result = [];
    var obj = {
      a: function(arg1, arg2, arg3) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            result.push(arg1);
            result.push(arg2);
            result.push(arg3);
            resolve();
          }, 0);
        });
      },
      b: function() {
        result.push([].slice.call(arguments));
      }
    };
    var builder = new SyncBuilder(obj);

    // when
    builder.a(1, 2, 3).a(4, 5, 6).b(7).build(function() {

      // then
      expect(result).to.eql([1, 2, 3, 4, 5, 6, [7]]);

      done();
    });

  });

  it('should call some methods in a synchronous way', function(done) {
    // given
    var result = [];

    var obj = {
      async: function() {
        return new Promise(function(resolve) {
          setTimeout(function() {
            result.push('async');
            resolve();
          }, 0);
        });
      },

      sync: function() {
        result.push('sync');
      }
    };
    var expectedCtx = {
      name: "ctx"
    };
    var expectedArgs = ['my', 'args'];
    var builder = new SyncBuilder(obj);

    // when
    builder.sync().async().async().sync().build(function(first, second) {

      // then
      expect(this).to.equal(expectedCtx);
      expect(first).to.equal('my');
      expect(second).to.equal('args');
      expect(result).to.eql(['sync', 'async', 'async', 'sync']);
      done();
    }, expectedCtx, expectedArgs);

  });
});