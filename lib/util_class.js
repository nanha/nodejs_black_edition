/**
 * Class, version 2.7
 * Copyright (c) 2006, 2007, 2008, Alex Arnell <alex@twologic.com>
 * Licensed under the new BSD License. See end of file for full license terms.
 * http://code.google.com/p/inheritance/
 */
global.Class = (function() {
  var __extending = {};

  return {
    extend: function(parent, def) {
      if (arguments.length == 1) { def = parent; parent = null; }
      var func = function() {
        if (arguments[0] ==  __extending) { return; }
        this.initialize.apply(this, arguments);
      };
      if (typeof(parent) == 'function') {
        func.prototype = new parent( __extending);
      }
      var mixins = [];
      if (def && def.include) {
        if (def.include.reverse) {
          // methods defined in later mixins should override prior
          mixins = mixins.concat(def.include.reverse());
        } else {
          mixins.push(def.include);
        }
        delete def.include; // clean syntax sugar
      }
      if (def) Class.inherit(func.prototype, def);
      for (var i = 0; (mixin = mixins[i]); i++) {
        Class.mixin(func.prototype, mixin);
      }
      return func;
    },
    mixin: function (dest, src, clobber) {
      clobber = clobber || false;
      if (typeof(src) != 'undefined' && src !== null) {
        for (var prop in src) {
          if (clobber || (!dest[prop] && typeof(src[prop]) == 'function')) {
            dest[prop] = src[prop];
          }
        }
      }
      return dest;
    },
    inherit: function(dest, src, fname) {
      if (arguments.length == 3) {
        var ancestor = dest[fname], descendent = src[fname], method = descendent;
        descendent = function() {
          var ref = this.parent; this.parent = ancestor;
          var result = method.apply(this, arguments);
          ref ? this.parent = ref : delete this.parent;
          return result;
        };
        // mask the underlying method
        descendent.valueOf = function() { return method; };
        descendent.toString = function() { return method.toString(); };
        dest[fname] = descendent;
      } else {
        for (var prop in src) {
          if (dest[prop] && typeof(src[prop]) == 'function') {
            Class.inherit(dest, src, prop);
          } else {
            dest[prop] = src[prop];
          }
        }
      }
      return dest;
    },
    singleton: function() {
      var args = arguments;
      if (args.length == 2 && args[0].getInstance) {
        var klass = args[0].getInstance(__extending);
        // we're extending a singleton swap it out for it's class
        if (klass) { args[0] = klass; }
      }

      return (function(args){
        // store instance and class in private variables
        var instance = false;
        var klass = Class.extend.apply(args.callee, args);
        return {
          getInstance: function () {
            if (arguments[0] == __extending) return klass;
            if (instance) return instance;
            return (instance = new klass());
          }
        };
      })(args);
    }
  };
})();

// finally remap Class.create for backward compatability with prototype
global.Class.create = function() {
  return Class.extend.apply(this, arguments);
};

/*
 *    def.js: Simple Ruby-style inheritance for JavaScript
 *
 *    Copyright (c) 2010 Tobias Schneider
 *    This script is freely distributable under the terms of the MIT license.
 *
 *    Featuring contributions by
 *    John-David Dalton
 *    Dmitry A. Soshnikov
 *    Devon Govett
 */

(function(global){
    // used to defer setup of superclass and properties
    var deferred;
    
    function extend(source){
        var prop, target = this.prototype;
        
        for(var key in source) if(source.hasOwnProperty(key)){
            prop = target[key] = source[key];
            // check if we're overwriting an existing function
            if('function' == typeof prop){
                // mark each method with its name and surrounding class
                prop._name = key;
                prop._class = this;
            }
        }
        
        return this;
    }
    
    // calls same method as its caller but in the superclass
    // based on http://github.com/shergin/legacy by Valentin Shergin
    function base(){
        // cross browser support > strict mode compatibility
        var caller = arguments.callee.caller;
        // arguments automatically passed to super if none provided
        return caller._class._super.prototype[caller._name]
            .apply(this, arguments.length ? arguments : caller.arguments);
    }
    
    function def(context, klassName){
        klassName || (klassName = context, context = global);
        // create class on given context (defaults to global object)
        var Klass = context[klassName] = function Klass(){
            if(context != this){
                // called as a constructor
                // allow init to return a different class/object
                return this.init && this.init.apply(this, arguments);
            }
            // called as a function - defer setup of superclass and properties
            deferred._super = Klass;
            deferred._props = arguments[0] || { };
        }
        
        // make this class extendable
        Klass.extend = extend;
        
        // called as function to set properties
        deferred = function(props){
            return Klass.extend(props);
        };
        
        // dummy subclass
        function Subclass(){ }
        
        // valueOf is called to setup inheritance from a superclass
        deferred.valueOf = function(){
            var Superclass = deferred._super;
            
            if(!Superclass){
                return Klass;
            }
            // inherit from superclass
            Subclass.prototype = Superclass.prototype;
            var proto = Klass.prototype = new Subclass;
            // reference base and superclass
            Klass._class = Klass;
            Klass._super = Superclass;
            
            Klass.toString = function(){
              return klassName;  
            };
            // enforce the constructor to be what we expect
            proto.constructor = Klass;
            // to call original methods in the superclass
            proto._super = base;
            // set properties
            deferred(deferred._props);
        };
        
        return deferred;
    }
    
    // expose def to the global object
    global.def = def;
}(global));
