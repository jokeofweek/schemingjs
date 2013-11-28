(function(window, undefined) {
"use strict";

var $ = Scheme.eval;
var register = function(name, evalFunc, strFunc) {
  if (evalFunc) {
    Scheme.registerEvalForm(name, evalFunc);
  }
  if (strFunc) {
    Scheme.registerStringifyForm(name, strFunc);
  }
};

register('define', function(environment, form) {
  // Put the value in the environment.
  environment.defineValue(form.identifier, 
      $(environment, form.value));
});

register('variable', function(environment, form) {
  return environment.getValue(form.identifier);
});

var stringifyString = function(value) {
  return '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
};

register('constant', function(environment, form) {
  return form;
}, function(form) {
  if (form.value === true) return '#t';
  else if (form.value === false) return '#f';
  else if (typeof form.value === 'string') return stringifyString(form.value);
  return form.value;
});

register('lambda', function(environment, form) {
  // Append the outer scope to the lambda.
  var extendedForm = Object.create(form);
  extendedForm.outerScope = environment;
  return extendedForm;
}, function(form) {
  return '#<procedure>';
});

register('if', function(environment, form) {
  var cond = $(environment, form.condition);
  var isFalse = Scheme.Marshall.isType('constant', cond) && cond.value === false;
  if (!isFalse) {
    return $(environment, form.true_branch);
  } else {
    // Make sure we have a false branch!
    if (form.false_branch) {
      return $(environment, form.false_branch);
    }
  }
});

register('body', function(environment, form) {
  // Evaluate each expression, returning the last result.
  var result;
  for (var i = 0; i < form.values.length; i++) {
    result = $(environment, form.values[i]);
  }
  return result;
});

var toList = function(values) {
  var head = Scheme.EMPTY_PAIR;  
  var i = values.length;
  while (i > 0) {
    i--;
    head = {
      type: 'pair',
      car: values[i],
      cdr: head
    };
  }
  return head;
};

var extractArguments = function(formals, values) {
  if (formals.variadic) {
    if (values.length < formals.values.length - 1) {
      throw new Scheme.InterpreterException('Expected at least ' + (formals.values.length - 1) + ' arguments, but received ' + values.length);
    }
    var args = values.slice(0, formals.values.length - 1);
    args.push(toList(values.slice(formals.values.length - 1)));
    return args;
  } else {
    if (values.length !== formals.values.length) {
      throw new Scheme.InterpreterException('Expected ' + formals.values.length + ' arguments, but received ' + values.length);
    }
    return values;
  }
}

register('application', function(environment, form) {
  var func = $(environment, form.first);

  // If it's a primitive, then re-route to primitive.
  if (Scheme.Marshall.isType('primitive', func)) {
    var args = extractArguments(func.formals, form.rest);
    var scope = new Scheme.Environment(environment);

    return func.callback.apply(null, [environment].concat(args.map(function(e) {return $(scope, e)})));
  }
  Scheme.Marshall.expectType('lambda', func);

  var args = extractArguments(func.formals, form.rest);

  // Build the new scope.
  var scope = new Scheme.Environment(func.outerScope);
  scope.extend(environment);
  for (var i = 0; i < func.formals.values.length; i++) {
    scope.defineValue(func.formals.values[i], $(scope, args[i]));
  }

  // Eval the lambda in the scope.
  return $(scope, func.body);
}); 

register('empty-pair', function(environment, form) {
  return form;
}, function(form) {
  return '()';
});

var cdrStringify = function(form) {
  if (form === Scheme.EMPTY_PAIR) {
    return '';
  } else if (Scheme.Marshall.isType('pair', form)) {
    return ' ' + Scheme.stringify(form.car) + cdrStringify(form.cdr);
  } else {
    return ' . ' + Scheme.stringify(form);
  }
};

register('pair', function(environment, form) {
  return {
    type: 'pair',
    car: $(environment, form.car),
    cdr: $(environment, form.cdr),
  }
}, function(form) {
  return '(' + Scheme.stringify(form.car) + cdrStringify(form.cdr) + ')';
});

register('symbol', function(environment, form) {
  return form;
}, function(form) {
  return form.value;
});

register('quote', function(environment, form) {
  return form;
}, function(form) {
  return "'" + Scheme.stringify(form.value);
});

})(window);