exports.__doc__ = "NAME\n".yellow
    + "\t_optimist\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttps://github.com/substack/node-optimist\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\toptimist\n"
    + "\t----------\n"
    + "\tOptimist is a node.js library for option parsing for people who hate option parsing. More specifically, this module is for people who like all the --bells and -whistlz of program usage but think optstrings are a waste of time.\n"
    + "\n"

    + "\tWith optimist, option parsing doesn't have to suck (as much).\n"
    + "\n"

    + "\texamples\n"
    + "\t----------\n"
    + "\tWith Optimist, the options are just a hash! No optstrings attached.\n"
    + "\txup.js:\n"
    + "\n"

    + "\t#!/usr/bin/env node\n"
    + "\tvar argv = _optimist.argv;\n"
    + "\n"

    + "\tif (argv.rif - 5 * argv.xup > 7.138) {\n"
    + "\t    console.log('Buy more riffiwobbles');\n"
    + "\t}\n"
    + "\telse {\n"
    + "\t    console.log('Sell the xupptumblers');\n"
    + "\t}\n"
    + "\n"
    + "\t$ ./xup.js --rif=55 --xup=9.52\n"
    + "\tBuy more riffiwobbles\n"
    + "\n"

    + "\t$ ./xup.js --rif 12 --xup 8.1\n"
    + "\tSell the xupptumblers\n"
    + "\n"
    ;
