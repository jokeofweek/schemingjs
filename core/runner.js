(function(window, undefined){
"use strict";

Scheme.run = function(code, compiledCallback, outputCallback) {
  var tree;

  // Generate the AST
  try {
    tree = Scheme.parser.parse(code);
    compiledCallback(tree, true);
  } catch (e) {
    compiledCallback(e, false);
    return;
  }

  // Create the global environment.
  var environment = new Scheme.Environment();
  Scheme.setupEnvironment(environment);
  
  // Evaluate each statement, keeping only the last one and outputting it.
  var result;
  for (var i = 0; i < tree.length; i++) {
    //try {
      result = Scheme.eval(environment, tree[i]);
    //} catch (e) {
    //  outputCallback(e, false);
    //  return;
    //}
  }
  outputCallback(result ? Scheme.stringify(result) : 'Success!', true);
};


})(window);