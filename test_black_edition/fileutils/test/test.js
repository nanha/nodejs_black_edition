var fs = require('fileutils'),
    assert = require('assert');

exports['file copy & move'] = function() {
    try {
        fs.unlinkSync(__dirname + '/foo.txt');
        fs.unlinkSync(__dirname + '/bar.txt');
        fs.unlinkSync(__dirname + '/baz.txt');
    } catch (e) {}

    fs.touch(__dirname + '/foo.txt', function() {
        fs.copy(__dirname + '/foo.txt', __dirname + '/bar.txt', function (err) {
            if (err) {
                throw err;
            }
            fs.move(__dirname + '/bar.txt', __dirname + '/baz.txt', function (err) {
                if (err) {
                    throw err;
                }

                fs.unlinkSync(__dirname + '/foo.txt');
                fs.unlinkSync(__dirname + '/baz.txt');
                assert.ok(true);
            });
        });
    });
};
