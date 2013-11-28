(function(window, undefined) {
"use strict";

var stringifyTable = {};

Scheme.stringify = function(form) {
  return stringifyTable[form.type](form);
};
Scheme.registerStringifyForm = function(name, func) {
  stringifyTable[name] = func;
};


})(window);