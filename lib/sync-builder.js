/*!
 * sync-builder v0.9.0 (2014-10-18)
 * Wrapper to run asynchronous code in a synchronous way.
 * https://github.com/andrusieczko/sync-builder
 * 
 * Copyright 2014 Karol Andrusieczko
 * Released under MIT license
 */

var SyncBuilder = function(obj) {
  var properties = [],
    prop;
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

if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = SyncBuilder;
  }
  exports.SyncBuilder = SyncBuilder;
} else {
  var globalVariable = window || root;
  globalVariable.SyncBuilder = SyncBuilder;
}