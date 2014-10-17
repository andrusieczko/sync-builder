/**
 * Wrapper to build asynchronous code in a synchronous way
 * Example:
 *
 * var obj = {
 *
 *   m1: function() {
 *     var deferred = Q.defer();
 *     setTimeout(function() {
 *       console.log("m1");
 *       deferred.resolve();
 *     })
 *     return deferred.promise;
 *   },
 *
 *   m2: function() {
 *     console.log("m2")
 *   }
 *
 * };
 *
 * var builder = SyncBuilder(obj);
 * builder.m1().m2().m1().m1().m2().build(function() { console.log("done") });
 *
 * Expected output order (in new lines):
 * m1, m2, m1, m1, m2, done
 */

var SyncBuilder = function(obj) {
  var properties = [], prop;
  for (prop in obj) {
    properties.push(prop);
  }
  properties.forEach(function(propertyName) {
    if (typeof(propertyName) === "string" && typeof(obj[propertyName]) === "function") {
      var method = obj[propertyName];
      this[propertyName] = function() {
        this.methods.push({
          func: method,
          args: [].slice.call(arguments),
          ctx: obj
        });
        return this;
      }.bind(this);
    }
  }.bind(this));
};

SyncBuilder.prototype = {
  methods: [],
  build: function(callback, ctx, args) {
    if (!this.methods.length) {
      callback.apply(ctx, args);
      return this;
    }
    var funcObj = this.methods.shift();
    var result = funcObj.func.apply(funcObj.ctx, funcObj.args);
    if (result && result.then) {
      result.then(function() {
        this.build(callback, ctx, args);
      }.bind(this));
    } else {
      this.build(callback, ctx, args);
    }
  }
};

export
default SyncBuilder;
