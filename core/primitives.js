(function(window, undefined) {

var primitives = {};

var makePrimitive = function(name, formals, func) {
  primitives[name] = {
    type: 'primitive',
    formals: formals,
    callback: func
  }
};

var makePair = function(car, cdr) {
  return {
    type: 'pair',
    car: car,
    cdr: cdr
  };
};

var TRUE = {type: 'constant', value: true};
var FALSE = {type: 'constant', value: false};

var makeFormals = function(values, variadic) {
  return {    
    values: values,
    variadic: !!variadic
  };
};

makePrimitive('car', makeFormals(['p']), function(environment, p) {
  Scheme.Marshall.expectType('pair', p);
  return p.car;
});

makePrimitive('cdr', makeFormals(['p']), function(environment, p) {
  Scheme.Marshall.expectType('pair', p);
  return p.cdr;
});

makePrimitive('cons', makeFormals(['car', 'cdr']), function(environment, car, cdr) {
  return makePair(car, cdr);
});

makePrimitive('null?', makeFormals(['l']), function(environment, l) {
  return l === Scheme.EMPTY_PAIR ? TRUE : FALSE;
});

makePrimitive('eval', makeFormals(['datum']), function(environment, datum) {
  return Scheme.eval(environment, Scheme.parser.parse(Scheme.stringify(datum))[0]);
});

makePrimitive('list', makeFormals(['vals'], true), function(environment, vals) {
  return vals;
});

Scheme.setupEnvironment = function(environment) {
  for (var key in primitives) {
    environment.defineValue(key, primitives[key]);
  }
};

})(window);