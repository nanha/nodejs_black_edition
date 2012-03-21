exports.__doc__ = "NAME\n".yellow
    + "\t_underscore\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttp://documentcloud.github.com/underscore\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\tUnderscore.js is a utility-belt library for JavaScript that provides support for the usual functional suspects (each, map, reduce, filter...) without extending any core JavaScript objects."
    + "\n"
    + "\teach\n".red
    + "\t-----\n"
    + "\t_.each(list, iterator, [context]) Alias: forEach\n"
    + "\tIterates over a list of elements, yielding each in turn to an iterator function. The iterator is bound to the context object, if one is passed. Each invocation of iterator is called with three arguments: (element, index, list). If list is a JavaScript object, iterator's arguments will be (value, key, list). Delegates to the native forEach function if it exists.\n"
    + "\n"

    + "\t_.each([1, 2, 3], function(num){ alert(num); });\n"
    + "\t=> alerts each number in turn...\n"
    + "\t_.each({one : 1, two : 2, three : 3}, function(num, key){ alert(num); });\n"
    + "\t=> alerts each number in turn...\n"
    + "\n"
    + "\n"
    + "\tmap\n".red
    + "\t-----\n"
    + "\t_.map(list, iterator, [context]) Alias: collect \n"
    + "\tProduces a new array of values by mapping each value in list through a transformation function (iterator). If the native map method exists, it will be used instead. If list is a JavaScript object, iterator's arguments will be (value, key, list).\n"
    + "\n"

    + "\t_.map([1, 2, 3], function(num){ return num * 3; });\n"
    + "\t=> [3, 6, 9]\n"
    + "\t_.map({one : 1, two : 2, three : 3}, function(num, key){ return num * 3; });\n"
    + "\t=> [3, 6, 9]\n"
    + "\n"
    + "\n"
    + "\tetc... go to url: http://documentcloud.github.com/underscore\n".cyan
    ;
