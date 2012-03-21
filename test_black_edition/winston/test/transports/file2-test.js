/*
 * file-test.js: Tests for instances of the File transport
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    fs = require('fs'),
    assert = require('assert'),
    winston = require('winston'),
    helpers = require('../helpers');

var stream = fs.createWriteStream(path.join(__dirname, '..', 'fixtures', 'logs', 'testfile.log')),
    fileTransport = new (winston.transports.File)({ filename: path.join(__dirname, '..', 'fixtures', 'logs', 'testfilename.log') }),
    streamTransport = new (winston.transports.File)({ stream: stream });

vows.describe('winston/transports/file').addBatch({
  "An instance of the File Transport": {
    "when passed a valid filename": {
      "should have the proper methods defined": function () {
        //console.log(fileTransport instanceof winston.transports.File);
      }
    }
  }
}).export(module);
