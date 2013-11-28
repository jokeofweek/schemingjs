(function(window, undefined){
"use strict";

var generateException = function(type) {
  function genericException(message) {
    this._message = message;
  }
  genericException.prototype.toString = function() {
    return type + ': ' + this._message;
  };
  return genericException;
};

window.Scheme.InterpreterException = generateException('InterpreterException');
window.Scheme.MarshallException = generateException('MarshallException');

})(window);