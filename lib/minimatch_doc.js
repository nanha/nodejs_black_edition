exports.__doc__ = "NAME\n".yellow
    + "\tminimatch\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttp://startic.kr/njs/package/minimatch\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\tminimatch\n"
    + "\tA minimal matching utility.\n"
    + "\n"

    + "\tThis is the matching library used internally by npm.\n"
    + "\tEventually, it will replace the C binding in node-glob.\n"
    + "\tIt works by converting glob expressions into JavaScript RegExp objects.\n"
    + "\n"

    + "\tUsage\n"
    + "\tvar minimatch = require(\"minimatch\")\n"
    + "\n"

    + "\tminimatch(\"bar.foo\", \"*.foo\") // true!\n"
    + "\tminimatch(\"bar.foo\", \"*.bar\") // false!\n"
    ;
