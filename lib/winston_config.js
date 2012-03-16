/*
 * config.js: Default settings for all levels that winston knows about 
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var config = exports, 
    allColors = exports.allColors = {};

config.addColors = function (colors) {
  mixin(allColors, colors);
};

config.colorize = function (level) {
  return level[allColors[level]];
};

//
// Export config sets
//
config.cli    = require('winston_config_cli_config');
config.npm    = require('winston_config_npm_config');
config.syslog = require('winston_config_syslog_config');

//
// Add colors for pre-defined config sets
//
config.addColors(config.npm.colors);
config.addColors(config.syslog.colors);

function mixin (target) {
  var args = Array.prototype.slice.call(arguments, 1);

  args.forEach(function (a) {
    var keys = Object.keys(a);
    for (var i = 0; i < keys.length; i++) {
      target[keys[i]] = a[keys[i]];
    }
  });
  return target;
};
