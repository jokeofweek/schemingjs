(function(window, undefined) {
"use strict";

var evalTable = {};

Scheme.eval = function(environment, form) {
  return evalTable[form.type](environment, form);
};

Scheme.registerEvalForm = function(name, func) {
  evalTable[name] = func;
};

})(window);