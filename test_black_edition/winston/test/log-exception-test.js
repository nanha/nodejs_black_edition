/*
 * exception-test.js: Tests for exception data gathering in winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    path = require('path'),
    spawn = require('child_process').spawn,
    vows = require('vows'),
    winston = require('winston'),
    helpers = require('./helpers');

vows.describe('winston/logger/exceptions').addBatch({
  "When using winston": {
    "the unhandleException() method": {
      topic: function () {
        var that = this,
            child = spawn('node', [path.join(__dirname, 'fixtures', 'scripts', 'unhandle-exceptions.js')]),
            exception = path.join(__dirname, 'fixtures', 'logs', 'unhandle-exception.log');
        
        helpers.tryUnlink(exception);
        child.on('exit', function () {
          path.exists(exception, that.callback.bind(this, null));
        });
      },
      "should not write to the specified error file": function (err, exists) {
        assert.isTrue(!err);
        assert.isFalse(exists);
      }
    }
  }
}).export(module);
