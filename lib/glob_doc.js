exports.__doc__ = "NAME\n".yellow
    + "\tglob\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttps://github.com/isaacs/node-glob\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\tGlob\n"
    + "\tThis is a glob implementation in JavaScript. It uses the minimatch library to do its matching.\n"
    + "\n"

    + "\tAttention: node-glob users!\n"
    + "\tThe API has changed dramatically between 2.x and 3.x. This library is now 100% JavaScript, and the integer flags have been replaced with an options object.\n"

    + "\n"
    + "\tAlso, there's an event emitter class, proper tests, and all the other things you've come to expect from node modules.\n"

    + "\n"
    + "\tAnd best of all, no compilation!\n"
    + "\n"

    + "\tUsage\n"
    + "\t------\n"
    + "\tvar glob = require(\"glob\")\n".green
    + "\n"

    + "\t// options is optional\n".green
    + "\tglob(\"**/*.js\", options, function (er, files) {\n".green
    + "\t  // files is an array of filenames.\n".green
    + "\t  // If the `nonull` option is set, and nothing\n".green
    + "\t  // was found, then files is [\"**/*.js\"]\n".green
    + "\t  // er is an error object or null.\n".green
    + "\t})\n".green
    ;
