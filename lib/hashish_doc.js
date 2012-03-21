exports.__doc__ = "NAME\n".yellow
    + "\thashish\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttps://github.com/substack/node-hashish\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\tHashish\n"
    + "\tHashish is a node.js library for manipulating hash data structures. It is distilled from the finest that ruby, perl, and haskell have to offer by way of hash/map interfaces.\n"

    + "\n"
    + "\tHashish provides a chaining interface, where you can do:\n"
    + "\n"

    + "\tvar Hash = require('hashish');\n"
    + "\n"

    + "\tHash({ a : 1, b : 2, c : 3, d : 4 })\n"
    + "\t    .map(function (x) { return x * 10 })\n"
    + "\t    .filter(function (x) { return x < 30 })\n"
    + "\t    .forEach(function (x, key) {\n"
    + "\t        console.log(key + ' => ' + x);\n"
    + "\t    })\n"
    + "\t;\n"
    + "\tOutput:\n"
    + "\n"

    + "\ta => 10\n"
    + "\tb => 20\n"
    + "\n"
    + "\tSome functions and attributes in the chaining interface are terminal, like .items or .detect(). They return values of their own instead of the chain context.\n"

    + "\n"
    + "\tEach function in the chainable interface is also attached to Hash in chainless form:\n"
    + "\n"

    + "\tvar Hash = require('hashish');\n"
    + "\tvar obj = { a : 1, b : 2, c : 3, d : 4 };\n"
    + "\n"

    + "\tvar mapped = Hash.map(obj, function (x) {\n"
    + "\t    return x * 10\n"
    + "\t});\n"
    + "\n"

    + "\tconsole.dir(mapped);\n"
    + "\tOutput:\n"
    + "\n"

    + "\t{ a: 10, b: 20, c: 30, d: 40 }\n"
    + "\tIn either case, the 'this' context of the function calls is the same object that the chained functions return, so you can make nested chains.\n"
    + "\n"
    ;
