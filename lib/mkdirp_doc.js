exports.__doc__ = "NAME\n".yellow
    + "\tmkdirp\n"
    + "\n"
    + "MODULE DOCS\n".yellow
    + "\thttp://startic.kr/njs/package/mkdirp\n"
    + "\n"
    + "DESCRIPTION\n".yellow
    + "\tmkdirp\n"
    + "\tLike mkdir -p, but in node.js!\n"
    + "\n"

    + "\texample\n".red
    + "\t----------\n"
    + "\tpow.js\n"
    + "\t---------------------------------\n"
    + "\tvar mkdirp = require('mkdirp');\n".green
    + "\n"

    + "\tmkdirp('/tmp/foo/bar/baz', function (err) {\n".green
    + "\t    if (err) console.error(err)\n".green
    + "\t    else console.log('pow!')\n".green
    + "\t});\n".green
    + "\t---------------------------------\n"
    + "\n"
    + "\tOutput\n".red
    + "\t----------\n"
    + "\tpow!\n"
    + "\n"

    + "\tAnd now /tmp/foo/bar/baz exists, huzzah!\n"
    + "\n"

    + "\tmethods\n".red
    + "\t---------------------------------\n"
    + "\tvar mkdirp = require('mkdirp');\n".green
    + "\t---------------------------------\n"
    + "\n"

    + "\t---------------------------------\n"
    + "\tmkdirp(dir, mode, cb)\n".green
    + "\t---------------------------------\n"
    + "\tCreate a new directory and any necessary subdirectories at dir with octal\n"
    + "\tpermission string mode.\n"
    + "\n"

    + "\tIf mode isn't specified, it defaults to 0777 & (~process.umask()).\n"
    + "\n"

    + "\t---------------------------------\n"
    + "\tmkdirp.sync(dir, mode)\n".green
    + "\t---------------------------------\n"
    + "\tSynchronously create a new directory and any necessary subdirectories at dir\n"
    + "\twith octal permission string mode.\n"
    + "\n"

    + "\tIf mode isn't specified, it defaults to 0777 & (~process.umask()).\n"
    ;
