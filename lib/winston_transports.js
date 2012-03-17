/*
 * transports.js: Set of all transports Winston knows about
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var fs = require('fs'),
    path = require('path'),
    common = require('winston_common');

var transports = exports;

//
// Setup all transports as lazy-loaded getters.
//
['console.js', 'file.js', 'webhook.js', 'loggly.js', 'couchdb.js'].forEach(function (file) {
  var transport = file.replace('.js', ''),
      name  = common.capitalize(transport);

  transports.__defineGetter__(name, function () {
    return require('winston_transports_' + transport)[name];
  });
});
