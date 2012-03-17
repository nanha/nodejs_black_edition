/*
 * winston.js: Top-level include defining Winston.
 *
 * (C) 2010 Charlie Robbins
 * MIT LICENCE
 *
 */

var winston = exports;

//
// Expose version using `pkginfo`
//
//require('pkginfo')(module, 'version');

//
// Include transports defined by default by winston
//
winston.transports = require('winston_transports');

//
// Expose utility methods 
//
var common             = require('winston_common');
winston.hash           = common.hash;
winston.clone          = common.clone;
winston.longestElement = common.longestElement;
winston.exception      = require('winston_exception');
winston.config         = require('winston_config');
winston.addColors      = winston.config.addColors; 

//
// Expose core Logging-related prototypes.
//
//winston.Container      = require('winston_container').Container;
winston.Container = (function() {
    //
    // ### function Container (options)
    // #### @options {Object} Default pass-thru options for Loggers
    // Constructor function for the Container object responsible for managing
    // a set of `winston.Logger` instances based on string ids.
    //
    var Container = function (options) {
      this.loggers = {};
      this.options = options || {};
      this.default = {
        transports: [
          new winston.transports.Console({
            level: 'silly',
            colorize: false
          })
        ]
      }
    };

    //
    // ### function get / add (id, options)
    // #### @id {string} Id of the Logger to get
    // #### @options {Object} **Optional** Options for the Logger instance
    // Retreives a `winston.Logger` instance for the specified `id`. If
    // an instance does not exist, one is created. 
    //
    Container.prototype.get = Container.prototype.add = function (id, options) {
      if (!this.loggers[id]) {
        options = common.clone(options || this.options || this.default);
        options.transports = options.transports || [];

        if (options.transports.length === 0 && (!options || !options['console'])) {
          options.transports.push(this.default.transports[0]);
        }

        Object.keys(options).forEach(function (key) {
          if (key === 'transports') {
            return;
          }
          
          var name = common.capitalize(key);

          if (!winston.transports[name]) {
            throw new Error('Cannot add unknown transport: ' + name);
          }
          
          var namedOptions = options[key];
          namedOptions.id = id;
          options.transports.push(new (winston.transports[name])(namedOptions));
        });

        this.loggers[id] = new winston.Logger(options);
      }

      return this.loggers[id];
    };

    //
    // ### function close (id)
    // #### @id {string} **Optional** Id of the Logger instance to find
    // Returns a boolean value indicating if this instance
    // has a logger with the specified `id`.
    //
    Container.prototype.has = function (id) {
      return !!this.loggers[id];
    };

    //
    // ### function close (id)
    // #### @id {string} **Optional** Id of the Logger instance to close
    // Closes a `Logger` instance with the specified `id` if it exists. 
    // If no `id` is supplied then all Loggers are closed.
    //
    Container.prototype.close = function (id) {
      var self = this;
      
      function _close (id) {
        if (!self.loggers[id]) {
          return;
        }

        self.loggers[id].close();
        delete self.loggers[id];
      }
      
      return id ? _close(id) : Object.keys(this.loggers).forEach(function (id) {
        _close(id);
      });
    };

    return Container;
})();

winston.Logger         = require('winston_logger').Logger;
winston.Transport      = require('winston_transports_transport').Transport;

//
// We create and expose a default `Container` to `winston.loggers` so that the 
// programmer may manage multiple `winston.Logger` instances without any additional overhead.
//
// ### some-file1.js
//
//     var logger = require('winston').loggers.get('something');
//
// ### some-file2.js
//
//     var logger = require('winston').loggers.get('something');
//
winston.loggers = new winston.Container();

//
// We create and expose a 'defaultLogger' so that the programmer may do the
// following without the need to create an instance of winston.Logger directly:
//
//     var winston = require('winston');
//     winston.log('info', 'some message');
//     winston.error('some error'); 
//
var defaultLogger = new winston.Logger({ 
  transports: [new winston.transports.Console()] 
});

//
// Pass through the target methods onto `winston.
//
var methods = [
  'log', 
  'add', 
  'remove', 
  'profile', 
  'startTimer',
  'extend', 
  'cli', 
  'handleExceptions', 
  'unhandleExceptions'
];
common.setLevels(winston, null, defaultLogger.levels);
methods.forEach(function (method) {
  winston[method] = function () {
    return defaultLogger[method].apply(defaultLogger, arguments);
  };
});

//
// ### function cli ()
// Configures the default winston logger to have the
// settings for command-line interfaces: no timestamp,
// colors enabled, padded output, and additional levels.
//
winston.cli = function () {
  winston.padLevels = true;
  common.setLevels(winston, defaultLogger.levels, winston.config.cli.levels);
  defaultLogger.setLevels(winston.config.cli.levels);
  winston.config.addColors(winston.config.cli.colors);
  
  if (defaultLogger.transports.console) {
    defaultLogger.transports.console.colorize = true;
    defaultLogger.transports.console.timestamp = false;
  }
  
  return winston;
};

//
// ### function setLevels (target)
// #### @target {Object} Target levels to use
// Sets the `target` levels specified on the default winston logger.
//
winston.setLevels = function (target) {
  common.setLevels(winston, defaultLogger.levels, target);
  defaultLogger.setLevels(target);
};

//
// Define getters / setters for appropriate properties of the 
// default logger which need to be exposed by winston.
//
['emitErrs', 'exitOnError', 'padLevels', 'level', 'levelLength', 'stripColors'].forEach(function (prop) {
  Object.defineProperty(winston, prop, {
    get: function () {
      return defaultLogger[prop];
    },
    set: function (val) {
      defaultLogger[prop] = val;
    }
  });
});

//
// @default {Object} 
// The default transports and exceptionHandlers for 
// the default winston logger.
//
Object.defineProperty(winston, 'default', {
  get: function () {
    return {
      transports: defaultLogger.transports,
      exceptionHandlers: defaultLogger.exceptionHandlers
    };
  }
});
