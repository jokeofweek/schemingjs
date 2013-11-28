(function(window, undefined) {
"use strict";

function Environment(parent) {
  this._parent = parent;
  this._values = {};
}

Environment.prototype.getParent = function() {
  return this._parent;
};

Environment.prototype.getValue = function(symbol) {
  var current = this;
  // Iterate up the environment chain until we find a match.
  do {
    if (current._values[symbol] !== undefined) {
      return current._values[symbol];
    }
  } while ((current = current._parent) != null);
  // We couldn't find the value!
  throw new Scheme.InterpreterException('Undefined variable: ' + symbol);
};

Environment.prototype.getValues = function() {
  var parentKeys = this._parent ? this._parent.getValues() : [];
  return parentKeys.concat(Object.keys(this._values));
};

Environment.prototype.isValueDefined = function(symbol) {
  var current = this;
  // Iterate up the environment chain until we find a match.
  do {
    if (current._values[symbol] !== undefined) {
      return true;
    }
  } while ((current = current._parent) != null);
  return false;
};

Environment.prototype.extend = function(environment) {
  // Copies all non-defined values
  var values = environment.getValues();
  for (var i = values.length - 1; i >= 0; i--) {
    if (!this.isValueDefined(values[i])) {
      this.defineValue(values[i], environment.getValue(values[i]));
    }
  };
};

Environment.prototype.defineValue = function(symbol, value) {
  this._values[symbol] = value;
};

window.Scheme.Environment = Environment;

})(window);