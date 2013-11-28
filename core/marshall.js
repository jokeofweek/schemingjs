(function(window, undefined) {
"use strict";

Scheme.Marshall = {};

Scheme.Marshall.expectType = function(type, form) {
  if (!Scheme.Marshall.isType(type, form)) {
    throw new Scheme.MarshallException('Expected type ' + type + ' but received ' + form.type);
  }
};

Scheme.Marshall.isType = function(type, form) {
  return form.type === type;
};

})(window);