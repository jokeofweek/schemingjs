/* Based off: http://www.scheme.com/tspl2d/grammar.html */

start = program

program = form*

form = val:(definition / expression) whitespace* { return val; }


/* Definitions */


definition 
  = variable_definition
  / "(begin " definitions:variable_definition* ")" { return {type: 'definitions', value: definitions}; }

definition_consume = d:definition whitespace* {return d;}

variable 
  = k:identifier whitespace* {return {type: 'variable', identifier: k}; }

variable_definition
  = "(define " k:identifier whitespace* v:expression_consume ")" { return {type: 'define', identifier: k, value: v}; }


/* Expression */ 


expression 
  = constant
  / variable
  / if
  / lambda
  / quote
  / application

expression_consume = e:expression whitespace* {return e;}

constant 
  = value:(boolean / number) { return {type: 'constant', value: value}; }

if
  = "(if " cond:expression_consume true_branch:expression_consume false_branch:expression_consume ")"
    { return {type: 'if', condition: cond, true_branch: true_branch, false_branch: false_branch}; }
  / "(if " cond:expression_consume true_branch:expression_consume ")"
    { return {type: 'if', condition: cond, true_branch: true_branch, false_branch: undefined}; }

body 
  = defs:definition_consume* exprs:expression_consume+ { return {type: 'body', values: defs.concat(exprs)}; }

formals 
  = v:variable { return {values: [v.identifier], variadic: false}; }
  / "(" v:(variable*) ")" { return {values: v.map(function(v) { return v.identifier; }), variadic: false}; }
  / "(" v:(variable+) whitespace*"."whitespace* rest:variable ")" { return {values: v.concat([rest]).map(function(v) { return v.identifier; }), variadic: true}; }

lambda 
  = "(lambda" whitespace+ formals:formals whitespace* body:body ")" { return {type: 'lambda', formals: formals, body: body}; }

application
  = "(" first:expression_consume rest:expression_consume* ")" { return {type: 'application', first: first, rest: rest}; }

quote 
  = "(quote " d:datum_consume ")" {return d; }
  / "'" d:datum_consume {return d; }


/* Identifiers */


identifier
  = initial:initial rest:subsequent* { return (initial + rest.join('')).toLowerCase(); }
  / "..."
  / [+-]

initial
  = letter:[A-Za-z]
  / [!$%&*/:<=>?~_^]

subsequent
  = letter:[A-Za-z] { return letter; }
  / digit:[0-9] { return '' + digit; }
  / [.+-?!]


/* Data */


datum 
  = constant
  / list
  / abbreviation
  / v:symbol  { return {type: 'symbol', value: v}; }
datum_consume = d:datum whitespace* {return d;}


number "number" 
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }
  / "-" digits:[0-9]+ { return -parseInt(digits.join(""), 10); }

boolean 
  = "#t" { return true; }
  / "#f" { return false; }

symbol = identifier

abbreviation 
 = "'" d:datum { return {type: 'quote', value: d}; }

cons_list
 = ")" { return Scheme.EMPTY_PAIR; }
 / "." whitespace* v:datum_consume ")" { return v; }
 / car:datum_consume cdr:cons_list { return {type: 'pair', car: car, cdr: cdr}; }

list = "(" v:cons_list { return v; }

/* General */


whitespace = [\t\v\f \u00A0\uFEFF\r\n]