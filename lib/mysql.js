var mysql = exports;
var hashish = (function() {
    var Traverse = (function() {
        function Traverse (obj) {
            if (!(this instanceof Traverse)) return new Traverse(obj);
            this.value = obj;
        }

        Traverse.prototype.get = function (ps) {
            var node = this.value;
            for (var i = 0; i < ps.length; i ++) {
                var key = ps[i];
                if (!Object.hasOwnProperty.call(node, key)) {
                    node = undefined;
                    break;
                }
                node = node[key];
            }
            return node;
        };

        Traverse.prototype.has = function (ps) {
            var node = this.value;
            for (var i = 0; i < ps.length; i ++) {
                var key = ps[i];
                if (!Object.hasOwnProperty.call(node, key)) {
                    return false;
                }
                node = node[key];
            }
            return true;
        };

        Traverse.prototype.set = function (ps, value) {
            var node = this.value;
            for (var i = 0; i < ps.length - 1; i ++) {
                var key = ps[i];
                if (!Object.hasOwnProperty.call(node, key)) node[key] = {};
                node = node[key];
            }
            node[ps[i]] = value;
            return value;
        };

        Traverse.prototype.map = function (cb) {
            return walk(this.value, cb, true);
        };

        Traverse.prototype.forEach = function (cb) {
            this.value = walk(this.value, cb, false);
            return this.value;
        };

        Traverse.prototype.reduce = function (cb, init) {
            var skip = arguments.length === 1;
            var acc = skip ? this.value : init;
            this.forEach(function (x) {
                if (!this.isRoot || !skip) {
                    acc = cb.call(this, acc, x);
                }
            });
            return acc;
        };

        Traverse.prototype.paths = function () {
            var acc = [];
            this.forEach(function (x) {
                acc.push(this.path); 
            });
            return acc;
        };

        Traverse.prototype.nodes = function () {
            var acc = [];
            this.forEach(function (x) {
                acc.push(this.node);
            });
            return acc;
        };

        Traverse.prototype.clone = function () {
            var parents = [], nodes = [];
            
            return (function clone (src) {
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i] === src) {
                        return nodes[i];
                    }
                }
                
                if (typeof src === 'object' && src !== null) {
                    var dst = copy(src);
                    
                    parents.push(src);
                    nodes.push(dst);
                    
                    forEach(Object_keys(src), function (key) {
                        dst[key] = clone(src[key]);
                    });
                    
                    parents.pop();
                    nodes.pop();
                    return dst;
                }
                else {
                    return src;
                }
            })(this.value);
        };

        function walk (root, cb, immutable) {
            var path = [];
            var parents = [];
            var alive = true;
            
            return (function walker (node_) {
                var node = immutable ? copy(node_) : node_;
                var modifiers = {};
                
                var keepGoing = true;
                
                var state = {
                    node : node,
                    node_ : node_,
                    path : [].concat(path),
                    parent : parents[parents.length - 1],
                    parents : parents,
                    key : path.slice(-1)[0],
                    isRoot : path.length === 0,
                    level : path.length,
                    circular : null,
                    update : function (x, stopHere) {
                        if (!state.isRoot) {
                            state.parent.node[state.key] = x;
                        }
                        state.node = x;
                        if (stopHere) keepGoing = false;
                    },
                    'delete' : function (stopHere) {
                        delete state.parent.node[state.key];
                        if (stopHere) keepGoing = false;
                    },
                    remove : function (stopHere) {
                        if (Array_isArray(state.parent.node)) {
                            state.parent.node.splice(state.key, 1);
                        }
                        else {
                            delete state.parent.node[state.key];
                        }
                        if (stopHere) keepGoing = false;
                    },
                    keys : null,
                    before : function (f) { modifiers.before = f },
                    after : function (f) { modifiers.after = f },
                    pre : function (f) { modifiers.pre = f },
                    post : function (f) { modifiers.post = f },
                    stop : function () { alive = false },
                    block : function () { keepGoing = false }
                };
                
                if (!alive) return state;
                
                if (typeof node === 'object' && node !== null) {
                    state.keys = Object_keys(node);
                    
                    state.isLeaf = state.keys.length == 0;
                    
                    for (var i = 0; i < parents.length; i++) {
                        if (parents[i].node_ === node_) {
                            state.circular = parents[i];
                            break;
                        }
                    }
                }
                else {
                    state.isLeaf = true;
                }
                
                state.notLeaf = !state.isLeaf;
                state.notRoot = !state.isRoot;
                
                // use return values to update if defined
                var ret = cb.call(state, state.node);
                if (ret !== undefined && state.update) state.update(ret);
                
                if (modifiers.before) modifiers.before.call(state, state.node);
                
                if (!keepGoing) return state;
                
                if (typeof state.node == 'object'
                && state.node !== null && !state.circular) {
                    parents.push(state);
                    
                    forEach(state.keys, function (key, i) {
                        path.push(key);
                        
                        if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                        
                        var child = walker(state.node[key]);
                        if (immutable && Object.hasOwnProperty.call(state.node, key)) {
                            state.node[key] = child.node;
                        }
                        
                        child.isLast = i == state.keys.length - 1;
                        child.isFirst = i == 0;
                        
                        if (modifiers.post) modifiers.post.call(state, child);
                        
                        path.pop();
                    });
                    parents.pop();
                }
                
                if (modifiers.after) modifiers.after.call(state, state.node);
                
                return state;
            })(root).node;
        }

        function copy (src) {
            if (typeof src === 'object' && src !== null) {
                var dst;
                
                if (Array_isArray(src)) {
                    dst = [];
                }
                else if (src instanceof Date) {
                    dst = new Date(src);
                }
                else if (src instanceof Boolean) {
                    dst = new Boolean(src);
                }
                else if (src instanceof Number) {
                    dst = new Number(src);
                }
                else if (src instanceof String) {
                    dst = new String(src);
                }
                else if (Object.create && Object.getPrototypeOf) {
                    dst = Object.create(Object.getPrototypeOf(src));
                }
                else if (src.__proto__ || src.constructor.prototype) {
                    var proto = src.__proto__ || src.constructor.prototype || {};
                    var T = function () {};
                    T.prototype = proto;
                    dst = new T;
                    if (!dst.__proto__) dst.__proto__ = proto;
                }
                
                forEach(Object_keys(src), function (key) {
                    dst[key] = src[key];
                });
                return dst;
            }
            else return src;
        }

        var Object_keys = Object.keys || function keys (obj) {
            var res = [];
            for (var key in obj) res.push(key)
            return res;
        };

        var Array_isArray = Array.isArray || function isArray (xs) {
            return Object.prototype.toString.call(xs) === '[object Array]';
        };

        var forEach = function (xs, fn) {
            if (xs.forEach) return xs.forEach(fn)
            else for (var i = 0; i < xs.length; i++) {
                fn(xs[i], i, xs);
            }
        };

        forEach(Object_keys(Traverse.prototype), function (key) {
            Traverse[key] = function (obj) {
                var args = [].slice.call(arguments, 1);
                var t = Traverse(obj);
                return t[key].apply(t, args);
            };
        });

        return Traverse;
    })();

    function Hash (hash, xs) {
        if (Array.isArray(hash) && Array.isArray(xs)) {
            var to = Math.min(hash.length, xs.length);
            var acc = {};
            for (var i = 0; i < to; i++) {
                acc[hash[i]] = xs[i];
            }
            return Hash(acc);
        }
        
        if (hash === undefined) return Hash({});
        
        var self = {
            map : function (f) {
                var acc = { __proto__ : hash.__proto__ };
                Object.keys(hash).forEach(function (key) {
                    acc[key] = f.call(self, hash[key], key);
                });
                return Hash(acc);
            },
            forEach : function (f) {
                Object.keys(hash).forEach(function (key) {
                    f.call(self, hash[key], key);
                });
                return self;
            },
            filter : function (f) {
                var acc = { __proto__ : hash.__proto__ };
                Object.keys(hash).forEach(function (key) {
                    if (f.call(self, hash[key], key)) {
                        acc[key] = hash[key];
                    }
                });
                return Hash(acc);
            },
            detect : function (f) {
                for (var key in hash) {
                    if (f.call(self, hash[key], key)) {
                        return hash[key];
                    }
                }
                return undefined;
            },
            reduce : function (f, acc) {
                var keys = Object.keys(hash);
                if (acc === undefined) acc = keys.shift();
                keys.forEach(function (key) {
                    acc = f.call(self, acc, hash[key], key);
                });
                return acc;
            },
            some : function (f) {
                for (var key in hash) {
                    if (f.call(self, hash[key], key)) return true;
                }
                return false;
            },
            update : function (obj) {
                if (arguments.length > 1) {
                    self.updateAll([].slice.call(arguments));
                }
                else {
                    Object.keys(obj).forEach(function (key) {
                        hash[key] = obj[key];
                    });
                }
                return self;
            },
            updateAll : function (xs) {
                xs.filter(Boolean).forEach(function (x) {
                    self.update(x);
                });
                return self;
            },
            merge : function (obj) {
                if (arguments.length > 1) {
                    return self.copy.updateAll([].slice.call(arguments));
                }
                else {
                    return self.copy.update(obj);
                }
            },
            mergeAll : function (xs) {
                return self.copy.updateAll(xs);
            },
            has : function (key) { // only operates on enumerables
                return Array.isArray(key)
                    ? key.every(function (k) { return self.has(k) })
                    : self.keys.indexOf(key.toString()) >= 0;
            },
            valuesAt : function (keys) {
                return Array.isArray(keys)
                    ? keys.map(function (key) { return hash[key] })
                    : hash[keys]
                ;
            },
            tap : function (f) {
                f.call(self, hash);
                return self;
            },
            extract : function (keys) {
                var acc = {};
                keys.forEach(function (key) {
                    acc[key] = hash[key];
                });
                return Hash(acc);
            },
            exclude : function (keys) {
                return self.filter(function (_, key) {
                    return keys.indexOf(key) < 0
                });
            },
            end : hash,
            items : hash
        };
        
        var props = {
            keys : function () { return Object.keys(hash) },
            values : function () {
                return Object.keys(hash).map(function (key) { return hash[key] });
            },
            compact : function () {
                return self.filter(function (x) { return x !== undefined });
            },
            clone : function () { return Hash(Hash.clone(hash)) },
            copy : function () { return Hash(Hash.copy(hash)) },
            length : function () { return Object.keys(hash).length },
            size : function () { return self.length }
        };
        
        if (Object.defineProperty) {
            // es5-shim has an Object.defineProperty but it throws for getters
            try {
                for (var key in props) {
                    Object.defineProperty(self, key, { get : props[key] });
                }
            }
            catch (err) {
                for (var key in props) {
                    if (key !== 'clone' && key !== 'copy' && key !== 'compact') {
                        // ^ those keys use Hash() so can't call them without
                        // a stack overflow
                        self[key] = props[key]();
                    }
                }
            }
        }
        else if (self.__defineGetter__) {
            for (var key in props) {
                self.__defineGetter__(key, props[key]);
            }
        }
        else {
            // non-lazy version for browsers that suck >_<
            for (var key in props) {
                self[key] = props[key]();
            }
        }
        
        return self;
    };

    // deep copy
    Hash.clone = function (ref) {
        return Traverse.clone(ref);
    };

    // shallow copy
    Hash.copy = function (ref) {
        var hash = { __proto__ : ref.__proto__ };
        Object.keys(ref).forEach(function (key) {
            hash[key] = ref[key];
        });
        return hash;
    };

    Hash.map = function (ref, f) {
        return Hash(ref).map(f).items;
    };

    Hash.forEach = function (ref, f) {
        Hash(ref).forEach(f);
    };

    Hash.filter = function (ref, f) {
        return Hash(ref).filter(f).items;
    };

    Hash.detect = function (ref, f) {
        return Hash(ref).detect(f);
    };

    Hash.reduce = function (ref, f, acc) {
        return Hash(ref).reduce(f, acc);
    };

    Hash.some = function (ref, f) {
        return Hash(ref).some(f);
    };

    Hash.update = function (a /*, b, c, ... */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var hash = Hash(a);
        return hash.update.apply(hash, args).items;
    };

    Hash.merge = function (a /*, b, c, ... */) {
        var args = Array.prototype.slice.call(arguments, 1);
        var hash = Hash(a);
        return hash.merge.apply(hash, args).items;
    };

    Hash.has = function (ref, key) {
        return Hash(ref).has(key);
    };

    Hash.valuesAt = function (ref, keys) {
        return Hash(ref).valuesAt(keys);
    };

    Hash.tap = function (ref, f) {
        return Hash(ref).tap(f).items;
    };

    Hash.extract = function (ref, keys) {
        return Hash(ref).extract(keys).items;
    };

    Hash.exclude = function (ref, keys) {
        return Hash(ref).exclude(keys).items;
    };

    Hash.concat = function (xs) {
        var hash = Hash({});
        xs.forEach(function (x) { hash.update(x) });
        return hash.items;
    };

    Hash.zip = function (xs, ys) {
        return Hash(xs, ys).items;
    };

    // .length is already defined for function prototypes
    Hash.size = function (ref) {
        return Hash(ref).size;
    };

    Hash.compact = function (ref) {
        return Hash(ref).compact.items;
    };

    return Hash;
})();

// constants
var constants = {};
(function(constants) {
    // Connections Flags
    hashish.update(constants, {
      CLIENT_LONG_PASSWORD     : 1,
      CLIENT_FOUND_ROWS        : 2,
      CLIENT_LONG_FLAG         : 4,
      CLIENT_CONNECT_WITH_DB   : 8,
      CLIENT_NO_SCHEMA         : 16,
      CLIENT_COMPRESS          : 32,
      CLIENT_ODBC              : 64,
      CLIENT_LOCAL_FILES       : 128,
      CLIENT_IGNORE_SPACE      : 256,
      CLIENT_PROTOCOL_41       : 512,
      CLIENT_INTERACTIVE       : 1024,
      CLIENT_SSL               : 2048,
      CLIENT_IGNORE_SIGPIPE    : 4096,
      CLIENT_TRANSACTIONS      : 8192,
      CLIENT_RESERVED          : 16384,
      CLIENT_SECURE_CONNECTION : 32768,
      CLIENT_MULTI_STATEMENTS  : 65536,
      CLIENT_MULTI_RESULTS     : 131072,
    });

    // Commands
    hashish.update(constants, {
      COM_SLEEP               : 0x00,
      COM_QUIT                : 0x01,
      COM_INIT_DB             : 0x02,
      COM_QUERY               : 0x03,
      COM_FIELD_LIST          : 0x04,
      COM_CREATE_DB           : 0x05,
      COM_DROP_DB             : 0x06,
      COM_REFRESH             : 0x07,
      COM_SHUTDOWN            : 0x08,
      COM_STATISTICS          : 0x09,
      COM_PROCESS_INFO        : 0x0a,
      COM_CONNECT             : 0x0b,
      COM_PROCESS_KILL        : 0x0c,
      COM_DEBUG               : 0x0d,
      COM_PING                : 0x0e,
      COM_TIME                : 0x0f,
      COM_DELAYED_INSERT      : 0x10,
      COM_CHANGE_USER         : 0x11,
      COM_BINLOG_DUMP         : 0x12,
      COM_TABLE_DUMP          : 0x13,
      COM_CONNECT_OUT         : 0x14,
      COM_REGISTER_SLAVE      : 0x15,
      COM_STMT_PREPARE        : 0x16,
      COM_STMT_EXECUTE        : 0x17,
      COM_STMT_SEND_LONG_DATA : 0x18,
      COM_STMT_CLOSE          : 0x19,
      COM_STMT_RESET          : 0x1a,
      COM_SET_OPTION          : 0x1b,
      COM_STMT_FETCH          : 0x1c,
    });

    // Collations / Charsets
    hashish.update(constants, {
      BIG5_CHINESE_CI      : 1,
      LATIN2_CZECH_CS      : 2,
      DEC8_SWEDISH_CI      : 3,
      CP850_GENERAL_CI     : 4,
      LATIN1_GERMAN1_CI    : 5,
      HP8_ENGLISH_CI       : 6,
      KOI8R_GENERAL_CI     : 7,
      LATIN1_SWEDISH_CI    : 8,
      LATIN2_GENERAL_CI    : 9,
      SWE7_SWEDISH_CI      : 10,
      ASCII_GENERAL_CI     : 11,
      UJIS_JAPANESE_CI     : 12,
      SJIS_JAPANESE_CI     : 13,
      CP1251_BULGARIAN_CI  : 14,
      LATIN1_DANISH_CI     : 15,
      HEBREW_GENERAL_CI    : 16,
      TIS620_THAI_CI       : 18,
      EUCKR_KOREAN_CI      : 19,
      LATIN7_ESTONIAN_CS   : 20,
      LATIN2_HUNGARIAN_CI  : 21,
      KOI8U_GENERAL_CI     : 22,
      CP1251_UKRAINIAN_CI  : 23,
      GB2312_CHINESE_CI    : 24,
      GREEK_GENERAL_CI     : 25,
      CP1250_GENERAL_CI    : 26,
      LATIN2_CROATIAN_CI   : 27,
      GBK_CHINESE_CI       : 28,
      CP1257_LITHUANIAN_CI : 29,
      LATIN5_TURKISH_CI    : 30,
      LATIN1_GERMAN2_CI    : 31,
      ARMSCII8_GENERAL_CI  : 32,
      UTF8_GENERAL_CI      : 33,
      CP1250_CZECH_CS      : 34,
      UCS2_GENERAL_CI      : 35,
      CP866_GENERAL_CI     : 36,
      KEYBCS2_GENERAL_CI   : 37,
      MACCE_GENERAL_CI     : 38,
      MACROMAN_GENERAL_CI  : 39,
      CP852_GENERAL_CI     : 40,
      LATIN7_GENERAL_CI    : 41,
      LATIN7_GENERAL_CS    : 42,
      MACCE_BIN            : 43,
      CP1250_CROATIAN_CI   : 44,
      LATIN1_BIN           : 47,
      LATIN1_GENERAL_CI    : 48,
      LATIN1_GENERAL_CS    : 49,
      CP1251_BIN           : 50,
      CP1251_GENERAL_CI    : 51,
      CP1251_GENERAL_CS    : 52,
      MACROMAN_BIN         : 53,
      CP1256_GENERAL_CI    : 57,
      CP1257_BIN           : 58,
      CP1257_GENERAL_CI    : 59,
      BINARY               : 63,
      ARMSCII8_BIN         : 64,
      ASCII_BIN            : 65,
      CP1250_BIN           : 66,
      CP1256_BIN           : 67,
      CP866_BIN            : 68,
      DEC8_BIN             : 69,
      GREEK_BIN            : 70,
      HEBREW_BIN           : 71,
      HP8_BIN              : 72,
      KEYBCS2_BIN          : 73,
      KOI8R_BIN            : 74,
      KOI8U_BIN            : 75,
      LATIN2_BIN           : 77,
      LATIN5_BIN           : 78,
      LATIN7_BIN           : 79,
      CP850_BIN            : 80,
      CP852_BIN            : 81,
      SWE7_BIN             : 82,
      UTF8_BIN             : 83,
      BIG5_BIN             : 84,
      EUCKR_BIN            : 85,
      GB2312_BIN           : 86,
      GBK_BIN              : 87,
      SJIS_BIN             : 88,
      TIS620_BIN           : 89,
      UCS2_BIN             : 90,
      UJIS_BIN             : 91,
      GEOSTD8_GENERAL_CI   : 92,
      GEOSTD8_BIN          : 93,
      LATIN1_SPANISH_CI    : 94,
      CP932_JAPANESE_CI    : 95,
      CP932_BIN            : 96,
      EUCJPMS_JAPANESE_CI  : 97,
      EUCJPMS_BIN          : 98,
      CP1250_POLISH_CI     : 99,
      UCS2_UNICODE_CI      : 128,
      UCS2_ICELANDIC_CI    : 129,
      UCS2_LATVIAN_CI      : 130,
      UCS2_ROMANIAN_CI     : 131,
      UCS2_SLOVENIAN_CI    : 132,
      UCS2_POLISH_CI       : 133,
      UCS2_ESTONIAN_CI     : 134,
      UCS2_SPANISH_CI      : 135,
      UCS2_SWEDISH_CI      : 136,
      UCS2_TURKISH_CI      : 137,
      UCS2_CZECH_CI        : 138,
      UCS2_DANISH_CI       : 139,
      UCS2_LITHUANIAN_CI   : 140,
      UCS2_SLOVAK_CI       : 141,
      UCS2_SPANISH2_CI     : 142,
      UCS2_ROMAN_CI        : 143,
      UCS2_PERSIAN_CI      : 144,
      UCS2_ESPERANTO_CI    : 145,
      UCS2_HUNGARIAN_CI    : 146,
      UTF8_UNICODE_CI      : 192,
      UTF8_ICELANDIC_CI    : 193,
      UTF8_LATVIAN_CI      : 194,
      UTF8_ROMANIAN_CI     : 195,
      UTF8_SLOVENIAN_CI    : 196,
      UTF8_POLISH_CI       : 197,
      UTF8_ESTONIAN_CI     : 198,
      UTF8_SPANISH_CI      : 199,
      UTF8_SWEDISH_CI      : 200,
      UTF8_TURKISH_CI      : 201,
      UTF8_CZECH_CI        : 202,
      UTF8_DANISH_CI       : 203,
      UTF8_LITHUANIAN_CI   : 204,
      UTF8_SLOVAK_CI       : 205,
      UTF8_SPANISH2_CI     : 206,
      UTF8_ROMAN_CI        : 207,
      UTF8_PERSIAN_CI      : 208,
      UTF8_ESPERANTO_CI    : 209,
      UTF8_HUNGARIAN_CI    : 210,
    });

    // Error numbers
    // from: http://dev.mysql.com/doc/refman/5.0/en/error-messages-server.html
    hashish.update(constants, {
      ERROR_HASHCHK                                 : 1000,
      ERROR_NISAMCHK                                : 1001,
      ERROR_NO                                      : 1002,
      ERROR_YES                                     : 1003,
      ERROR_CANT_CREATE_FILE                        : 1004,
      ERROR_CANT_CREATE_TABLE                       : 1005,
      ERROR_CANT_CREATE_DB                          : 1006,
      ERROR_DB_CREATE_EXISTS                        : 1007,
      ERROR_DB_DROP_EXISTS                          : 1008,
      ERROR_DB_DROP_DELETE                          : 1009,
      ERROR_DB_DROP_RMDIR                           : 1010,
      ERROR_CANT_DELETE_FILE                        : 1011,
      ERROR_CANT_FIND_SYSTEM_REC                    : 1012,
      ERROR_CANT_GET_STAT                           : 1013,
      ERROR_CANT_GET_WD                             : 1014,
      ERROR_CANT_LOCK                               : 1015,
      ERROR_CANT_OPEN_FILE                          : 1016,
      ERROR_FILE_NOT_FOUND                          : 1017,
      ERROR_CANT_READ_DIR                           : 1018,
      ERROR_CANT_SET_WD                             : 1019,
      ERROR_CHECKREAD                               : 1020,
      ERROR_DISK_FULL                               : 1021,
      ERROR_DUP_KEY                                 : 1022,
      ERROR_ERROR_ON_CLOSE                          : 1023,
      ERROR_ERROR_ON_READ                           : 1024,
      ERROR_ERROR_ON_RENAME                         : 1025,
      ERROR_ERROR_ON_WRITE                          : 1026,
      ERROR_FILE_USED                               : 1027,
      ERROR_FILSORT_ABORT                           : 1028,
      ERROR_FORM_NOT_FOUND                          : 1029,
      ERROR_GET_ERRNO                               : 1030,
      ERROR_ILLEGAL_HA                              : 1031,
      ERROR_KEY_NOT_FOUND                           : 1032,
      ERROR_NOT_FORM_FILE                           : 1033,
      ERROR_NOT_KEYFILE                             : 1034,
      ERROR_OLD_KEYFILE                             : 1035,
      ERROR_OPEN_AS_READONLY                        : 1036,
      ERROR_OUTOFMEMORY                             : 1037,
      ERROR_OUT_OF_SORTMEMORY                       : 1038,
      ERROR_UNEXPECTED_EOF                          : 1039,
      ERROR_CON_COUNT_ERROR                         : 1040,
      ERROR_OUT_OF_RESOURCES                        : 1041,
      ERROR_BAD_HOST_ERROR                          : 1042,
      ERROR_HANDSHAKE_ERROR                         : 1043,
      ERROR_DBACCESS_DENIED_ERROR                   : 1044,
      ERROR_ACCESS_DENIED_ERROR                     : 1045,
      ERROR_NO_DB_ERROR                             : 1046,
      ERROR_UNKNOWN_COM_ERROR                       : 1047,
      ERROR_BAD_NULL_ERROR                          : 1048,
      ERROR_BAD_DB_ERROR                            : 1049,
      ERROR_TABLE_EXISTS_ERROR                      : 1050,
      ERROR_BAD_TABLE_ERROR                         : 1051,
      ERROR_NON_UNIQ_ERROR                          : 1052,
      ERROR_SERVERROR_SHUTDOWN                      : 1053,
      ERROR_BAD_FIELD_ERROR                         : 1054,
      ERROR_WRONG_FIELD_WITH_GROUP                  : 1055,
      ERROR_WRONG_GROUP_FIELD                       : 1056,
      ERROR_WRONG_SUM_SELECT                        : 1057,
      ERROR_WRONG_VALUE_COUNT                       : 1058,
      ERROR_TOO_LONG_IDENT                          : 1059,
      ERROR_DUP_FIELDNAME                           : 1060,
      ERROR_DUP_KEYNAME                             : 1061,
      ERROR_DUP_ENTRY                               : 1062,
      ERROR_WRONG_FIELD_SPEC                        : 1063,
      ERROR_PARSE_ERROR                             : 1064,
      ERROR_EMPTY_QUERY                             : 1065,
      ERROR_NONUNIQ_TABLE                           : 1066,
      ERROR_INVALID_DEFAULT                         : 1067,
      ERROR_MULTIPLE_PRI_KEY                        : 1068,
      ERROR_TOO_MANY_KEYS                           : 1069,
      ERROR_TOO_MANY_KEY_PARTS                      : 1070,
      ERROR_TOO_LONG_KEY                            : 1071,
      ERROR_KEY_COLUMN_DOES_NOT_EXITS               : 1072,
      ERROR_BLOB_USED_AS_KEY                        : 1073,
      ERROR_TOO_BIG_FIELDLENGTH                     : 1074,
      ERROR_WRONG_AUTO_KEY                          : 1075,
      ERROR_READY                                   : 1076,
      ERROR_NORMAL_SHUTDOWN                         : 1077,
      ERROR_GOT_SIGNAL                              : 1078,
      ERROR_SHUTDOWN_COMPLETE                       : 1079,
      ERROR_FORCING_CLOSE                           : 1080,
      ERROR_IPSOCK_ERROR                            : 1081,
      ERROR_NO_SUCH_INDEX                           : 1082,
      ERROR_WRONG_FIELD_TERMINATORS                 : 1083,
      ERROR_BLOBS_AND_NO_TERMINATED                 : 1084,
      ERROR_TEXTFILE_NOT_READABLE                   : 1085,
      ERROR_FILE_EXISTS_ERROR                       : 1086,
      ERROR_LOAD_INFO                               : 1087,
      ERROR_ALTERROR_INFO                           : 1088,
      ERROR_WRONG_SUB_KEY                           : 1089,
      ERROR_CANT_REMOVE_ALL_FIELDS                  : 1090,
      ERROR_CANT_DROP_FIELD_OR_KEY                  : 1091,
      ERROR_INSERT_INFO                             : 1092,
      ERROR_UPDATE_TABLE_USED                       : 1093,
      ERROR_NO_SUCH_THREAD                          : 1094,
      ERROR_KILL_DENIED_ERROR                       : 1095,
      ERROR_NO_TABLES_USED                          : 1096,
      ERROR_TOO_BIG_SET                             : 1097,
      ERROR_NO_UNIQUE_LOGFILE                       : 1098,
      ERROR_TABLE_NOT_LOCKED_FOR_WRITE              : 1099,
      ERROR_TABLE_NOT_LOCKED                        : 1100,
      ERROR_BLOB_CANT_HAVE_DEFAULT                  : 1101,
      ERROR_WRONG_DB_NAME                           : 1102,
      ERROR_WRONG_TABLE_NAME                        : 1103,
      ERROR_TOO_BIG_SELECT                          : 1104,
      ERROR_UNKNOWN_ERROR                           : 1105,
      ERROR_UNKNOWN_PROCEDURE                       : 1106,
      ERROR_WRONG_PARAMCOUNT_TO_PROCEDURE           : 1107,
      ERROR_WRONG_PARAMETERS_TO_PROCEDURE           : 1108,
      ERROR_UNKNOWN_TABLE                           : 1109,
      ERROR_FIELD_SPECIFIED_TWICE                   : 1110,
      ERROR_INVALID_GROUP_FUNC_USE                  : 1111,
      ERROR_UNSUPPORTED_EXTENSION                   : 1112,
      ERROR_TABLE_MUST_HAVE_COLUMNS                 : 1113,
      ERROR_RECORD_FILE_FULL                        : 1114,
      ERROR_UNKNOWN_CHARACTERROR_SET                : 1115,
      ERROR_TOO_MANY_TABLES                         : 1116,
      ERROR_TOO_MANY_FIELDS                         : 1117,
      ERROR_TOO_BIG_ROWSIZE                         : 1118,
      ERROR_STACK_OVERRUN                           : 1119,
      ERROR_WRONG_OUTERROR_JOIN                     : 1120,
      ERROR_NULL_COLUMN_IN_INDEX                    : 1121,
      ERROR_CANT_FIND_UDF                           : 1122,
      ERROR_CANT_INITIALIZE_UDF                     : 1123,
      ERROR_UDF_NO_PATHS                            : 1124,
      ERROR_UDF_EXISTS                              : 1125,
      ERROR_CANT_OPEN_LIBRARY                       : 1126,
      ERROR_CANT_FIND_DL_ENTRY                      : 1127,
      ERROR_FUNCTION_NOT_DEFINED                    : 1128,
      ERROR_HOST_IS_BLOCKED                         : 1129,
      ERROR_HOST_NOT_PRIVILEGED                     : 1130,
      ERROR_PASSWORD_ANONYMOUS_USER                 : 1131,
      ERROR_PASSWORD_NOT_ALLOWED                    : 1132,
      ERROR_PASSWORD_NO_MATCH                       : 1133,
      ERROR_UPDATE_INFO                             : 1134,
      ERROR_CANT_CREATE_THREAD                      : 1135,
      ERROR_WRONG_VALUE_COUNT_ON_ROW                : 1136,
      ERROR_CANT_REOPEN_TABLE                       : 1137,
      ERROR_INVALID_USE_OF_NULL                     : 1138,
      ERROR_REGEXP_ERROR                            : 1139,
      ERROR_MIX_OF_GROUP_FUNC_AND_FIELDS            : 1140,
      ERROR_NONEXISTING_GRANT                       : 1141,
      ERROR_TABLEACCESS_DENIED_ERROR                : 1142,
      ERROR_COLUMNACCESS_DENIED_ERROR               : 1143,
      ERROR_ILLEGAL_GRANT_FOR_TABLE                 : 1144,
      ERROR_GRANT_WRONG_HOST_OR_USER                : 1145,
      ERROR_NO_SUCH_TABLE                           : 1146,
      ERROR_NONEXISTING_TABLE_GRANT                 : 1147,
      ERROR_NOT_ALLOWED_COMMAND                     : 1148,
      ERROR_SYNTAX_ERROR                            : 1149,
      ERROR_DELAYED_CANT_CHANGE_LOCK                : 1150,
      ERROR_TOO_MANY_DELAYED_THREADS                : 1151,
      ERROR_ABORTING_CONNECTION                     : 1152,
      ERROR_NET_PACKET_TOO_LARGE                    : 1153,
      ERROR_NET_READ_ERROR_FROM_PIPE                : 1154,
      ERROR_NET_FCNTL_ERROR                         : 1155,
      ERROR_NET_PACKETS_OUT_OF_ORDER                : 1156,
      ERROR_NET_UNCOMPRESS_ERROR                    : 1157,
      ERROR_NET_READ_ERROR                          : 1158,
      ERROR_NET_READ_INTERRUPTED                    : 1159,
      ERROR_NET_ERROR_ON_WRITE                      : 1160,
      ERROR_NET_WRITE_INTERRUPTED                   : 1161,
      ERROR_TOO_LONG_STRING                         : 1162,
      ERROR_TABLE_CANT_HANDLE_BLOB                  : 1163,
      ERROR_TABLE_CANT_HANDLE_AUTO_INCREMENT        : 1164,
      ERROR_DELAYED_INSERT_TABLE_LOCKED             : 1165,
      ERROR_WRONG_COLUMN_NAME                       : 1166,
      ERROR_WRONG_KEY_COLUMN                        : 1167,
      ERROR_WRONG_MRG_TABLE                         : 1168,
      ERROR_DUP_UNIQUE                              : 1169,
      ERROR_BLOB_KEY_WITHOUT_LENGTH                 : 1170,
      ERROR_PRIMARY_CANT_HAVE_NULL                  : 1171,
      ERROR_TOO_MANY_ROWS                           : 1172,
      ERROR_REQUIRES_PRIMARY_KEY                    : 1173,
      ERROR_NO_RAID_COMPILED                        : 1174,
      ERROR_UPDATE_WITHOUT_KEY_IN_SAFE_MODE         : 1175,
      ERROR_KEY_DOES_NOT_EXITS                      : 1176,
      ERROR_CHECK_NO_SUCH_TABLE                     : 1177,
      ERROR_CHECK_NOT_IMPLEMENTED                   : 1178,
      ERROR_CANT_DO_THIS_DURING_AN_TRANSACTION      : 1179,
      ERROR_ERROR_DURING_COMMIT                     : 1180,
      ERROR_ERROR_DURING_ROLLBACK                   : 1181,
      ERROR_ERROR_DURING_FLUSH_LOGS                 : 1182,
      ERROR_ERROR_DURING_CHECKPOINT                 : 1183,
      ERROR_NEW_ABORTING_CONNECTION                 : 1184,
      ERROR_DUMP_NOT_IMPLEMENTED                    : 1185,
      ERROR_FLUSH_MASTERROR_BINLOG_CLOSED           : 1186,
      ERROR_INDEX_REBUILD                           : 1187,
      ERROR_MASTER                                  : 1188,
      ERROR_MASTERROR_NET_READ                      : 1189,
      ERROR_MASTERROR_NET_WRITE                     : 1190,
      ERROR_FT_MATCHING_KEY_NOT_FOUND               : 1191,
      ERROR_LOCK_OR_ACTIVE_TRANSACTION              : 1192,
      ERROR_UNKNOWN_SYSTEM_VARIABLE                 : 1193,
      ERROR_CRASHED_ON_USAGE                        : 1194,
      ERROR_CRASHED_ON_REPAIR                       : 1195,
      ERROR_WARNING_NOT_COMPLETE_ROLLBACK           : 1196,
      ERROR_TRANS_CACHE_FULL                        : 1197,
      ERROR_SLAVE_MUST_STOP                         : 1198,
      ERROR_SLAVE_NOT_RUNNING                       : 1199,
      ERROR_BAD_SLAVE                               : 1200,
      ERROR_MASTERROR_INFO                          : 1201,
      ERROR_SLAVE_THREAD                            : 1202,
      ERROR_TOO_MANY_USERROR_CONNECTIONS            : 1203,
      ERROR_SET_CONSTANTS_ONLY                      : 1204,
      ERROR_LOCK_WAIT_TIMEOUT                       : 1205,
      ERROR_LOCK_TABLE_FULL                         : 1206,
      ERROR_READ_ONLY_TRANSACTION                   : 1207,
      ERROR_DROP_DB_WITH_READ_LOCK                  : 1208,
      ERROR_CREATE_DB_WITH_READ_LOCK                : 1209,
      ERROR_WRONG_ARGUMENTS                         : 1210,
      ERROR_NO_PERMISSION_TO_CREATE_USER            : 1211,
      ERROR_UNION_TABLES_IN_DIFFERENT_DIR           : 1212,
      ERROR_LOCK_DEADLOCK                           : 1213,
      ERROR_TABLE_CANT_HANDLE_FT                    : 1214,
      ERROR_CANNOT_ADD_FOREIGN                      : 1215,
      ERROR_NO_REFERENCED_ROW                       : 1216,
      ERROR_ROW_IS_REFERENCED                       : 1217,
      ERROR_CONNECT_TO_MASTER                       : 1218,
      ERROR_QUERY_ON_MASTER                         : 1219,
      ERROR_ERROR_WHEN_EXECUTING_COMMAND            : 1220,
      ERROR_WRONG_USAGE                             : 1221,
      ERROR_WRONG_NUMBERROR_OF_COLUMNS_IN_SELECT    : 1222,
      ERROR_CANT_UPDATE_WITH_READLOCK               : 1223,
      ERROR_MIXING_NOT_ALLOWED                      : 1224,
      ERROR_DUP_ARGUMENT                            : 1225,
      ERROR_USERROR_LIMIT_REACHED                   : 1226,
      ERROR_SPECIFIC_ACCESS_DENIED_ERROR            : 1227,
      ERROR_LOCAL_VARIABLE                          : 1228,
      ERROR_GLOBAL_VARIABLE                         : 1229,
      ERROR_NO_DEFAULT                              : 1230,
      ERROR_WRONG_VALUE_FOR_VAR                     : 1231,
      ERROR_WRONG_TYPE_FOR_VAR                      : 1232,
      ERROR_VAR_CANT_BE_READ                        : 1233,
      ERROR_CANT_USE_OPTION_HERE                    : 1234,
      ERROR_NOT_SUPPORTED_YET                       : 1235,
      ERROR_MASTERROR_FATAL_ERROR_READING_BINLOG    : 1236,
      ERROR_SLAVE_IGNORED_TABLE                     : 1237,
      ERROR_INCORRECT_GLOBAL_LOCAL_VAR              : 1238,
      ERROR_WRONG_FK_DEF                            : 1239,
      ERROR_KEY_REF_DO_NOT_MATCH_TABLE_REF          : 1240,
      ERROR_OPERAND_COLUMNS                         : 1241,
      ERROR_SUBQUERY_NO_1_ROW                       : 1242,
      ERROR_UNKNOWN_STMT_HANDLER                    : 1243,
      ERROR_CORRUPT_HELP_DB                         : 1244,
      ERROR_CYCLIC_REFERENCE                        : 1245,
      ERROR_AUTO_CONVERT                            : 1246,
      ERROR_ILLEGAL_REFERENCE                       : 1247,
      ERROR_DERIVED_MUST_HAVE_ALIAS                 : 1248,
      ERROR_SELECT_REDUCED                          : 1249,
      ERROR_TABLENAME_NOT_ALLOWED_HERE              : 1250,
      ERROR_NOT_SUPPORTED_AUTH_MODE                 : 1251,
      ERROR_SPATIAL_CANT_HAVE_NULL                  : 1252,
      ERROR_COLLATION_CHARSET_MISMATCH              : 1253,
      ERROR_SLAVE_WAS_RUNNING                       : 1254,
      ERROR_SLAVE_WAS_NOT_RUNNING                   : 1255,
      ERROR_TOO_BIG_FOR_UNCOMPRESS                  : 1256,
      ERROR_ZLIB_Z_MEM_ERROR                        : 1257,
      ERROR_ZLIB_Z_BUF_ERROR                        : 1258,
      ERROR_ZLIB_Z_DATA_ERROR                       : 1259,
      ERROR_CUT_VALUE_GROUP_CONCAT                  : 1260,
      ERROR_WARN_TOO_FEW_RECORDS                    : 1261,
      ERROR_WARN_TOO_MANY_RECORDS                   : 1262,
      ERROR_WARN_NULL_TO_NOTNULL                    : 1263,
      ERROR_WARN_DATA_OUT_OF_RANGE                  : 1264,
      WARN_DATA_TRUNCATED                           : 1265,
      ERROR_WARN_USING_OTHERROR_HANDLER             : 1266,
      ERROR_CANT_AGGREGATE_2COLLATIONS              : 1267,
      ERROR_DROP_USER                               : 1268,
      ERROR_REVOKE_GRANTS                           : 1269,
      ERROR_CANT_AGGREGATE_3COLLATIONS              : 1270,
      ERROR_CANT_AGGREGATE_NCOLLATIONS              : 1271,
      ERROR_VARIABLE_IS_NOT_STRUCT                  : 1272,
      ERROR_UNKNOWN_COLLATION                       : 1273,
      ERROR_SLAVE_IGNORED_SSL_PARAMS                : 1274,
      ERROR_SERVERROR_IS_IN_SECURE_AUTH_MODE        : 1275,
      ERROR_WARN_FIELD_RESOLVED                     : 1276,
      ERROR_BAD_SLAVE_UNTIL_COND                    : 1277,
      ERROR_MISSING_SKIP_SLAVE                      : 1278,
      ERROR_UNTIL_COND_IGNORED                      : 1279,
      ERROR_WRONG_NAME_FOR_INDEX                    : 1280,
      ERROR_WRONG_NAME_FOR_CATALOG                  : 1281,
      ERROR_WARN_QC_RESIZE                          : 1282,
      ERROR_BAD_FT_COLUMN                           : 1283,
      ERROR_UNKNOWN_KEY_CACHE                       : 1284,
      ERROR_WARN_HOSTNAME_WONT_WORK                 : 1285,
      ERROR_UNKNOWN_STORAGE_ENGINE                  : 1286,
      ERROR_WARN_DEPRECATED_SYNTAX                  : 1287,
      ERROR_NON_UPDATABLE_TABLE                     : 1288,
      ERROR_FEATURE_DISABLED                        : 1289,
      ERROR_OPTION_PREVENTS_STATEMENT               : 1290,
      ERROR_DUPLICATED_VALUE_IN_TYPE                : 1291,
      ERROR_TRUNCATED_WRONG_VALUE                   : 1292,
      ERROR_TOO_MUCH_AUTO_TIMESTAMP_COLS            : 1293,
      ERROR_INVALID_ON_UPDATE                       : 1294,
      ERROR_UNSUPPORTED_PS                          : 1295,
      ERROR_GET_ERRMSG                              : 1296,
      ERROR_GET_TEMPORARY_ERRMSG                    : 1297,
      ERROR_UNKNOWN_TIME_ZONE                       : 1298,
      ERROR_WARN_INVALID_TIMESTAMP                  : 1299,
      ERROR_INVALID_CHARACTERROR_STRING             : 1300,
      ERROR_WARN_ALLOWED_PACKET_OVERFLOWED          : 1301,
      ERROR_CONFLICTING_DECLARATIONS                : 1302,
      ERROR_SP_NO_RECURSIVE_CREATE                  : 1303,
      ERROR_SP_ALREADY_EXISTS                       : 1304,
      ERROR_SP_DOES_NOT_EXIST                       : 1305,
      ERROR_SP_DROP_FAILED                          : 1306,
      ERROR_SP_STORE_FAILED                         : 1307,
      ERROR_SP_LILABEL_MISMATCH                     : 1308,
      ERROR_SP_LABEL_REDEFINE                       : 1309,
      ERROR_SP_LABEL_MISMATCH                       : 1310,
      ERROR_SP_UNINIT_VAR                           : 1311,
      ERROR_SP_BADSELECT                            : 1312,
      ERROR_SP_BADRETURN                            : 1313,
      ERROR_SP_BADSTATEMENT                         : 1314,
      ERROR_UPDATE_LOG_DEPRECATED_IGNORED           : 1315,
      ERROR_UPDATE_LOG_DEPRECATED_TRANSLATED        : 1316,
      ERROR_QUERY_INTERRUPTED                       : 1317,
      ERROR_SP_WRONG_NO_OF_ARGS                     : 1318,
      ERROR_SP_COND_MISMATCH                        : 1319,
      ERROR_SP_NORETURN                             : 1320,
      ERROR_SP_NORETURNEND                          : 1321,
      ERROR_SP_BAD_CURSOR_QUERY                     : 1322,
      ERROR_SP_BAD_CURSOR_SELECT                    : 1323,
      ERROR_SP_CURSOR_MISMATCH                      : 1324,
      ERROR_SP_CURSOR_ALREADY_OPEN                  : 1325,
      ERROR_SP_CURSOR_NOT_OPEN                      : 1326,
      ERROR_SP_UNDECLARED_VAR                       : 1327,
      ERROR_SP_WRONG_NO_OF_FETCH_ARGS               : 1328,
      ERROR_SP_FETCH_NO_DATA                        : 1329,
      ERROR_SP_DUP_PARAM                            : 1330,
      ERROR_SP_DUP_VAR                              : 1331,
      ERROR_SP_DUP_COND                             : 1332,
      ERROR_SP_DUP_CURS                             : 1333,
      ERROR_SP_CANT_ALTER                           : 1334,
      ERROR_SP_SUBSELECT_NYI                        : 1335,
      ERROR_STMT_NOT_ALLOWED_IN_SF_OR_TRG           : 1336,
      ERROR_SP_VARCOND_AFTERROR_CURSHNDLR           : 1337,
      ERROR_SP_CURSOR_AFTERROR_HANDLER              : 1338,
      ERROR_SP_CASE_NOT_FOUND                       : 1339,
      ERROR_FPARSERROR_TOO_BIG_FILE                 : 1340,
      ERROR_FPARSERROR_BAD_HEADER                   : 1341,
      ERROR_FPARSERROR_EOF_IN_COMMENT               : 1342,
      ERROR_FPARSERROR_ERROR_IN_PARAMETER           : 1343,
      ERROR_FPARSERROR_EOF_IN_UNKNOWN_PARAMETER     : 1344,
      ERROR_VIEW_NO_EXPLAIN                         : 1345,
      ERROR_FRM_UNKNOWN_TYPE                        : 1346,
      ERROR_WRONG_OBJECT                            : 1347,
      ERROR_NONUPDATEABLE_COLUMN                    : 1348,
      ERROR_VIEW_SELECT_DERIVED                     : 1349,
      ERROR_VIEW_SELECT_CLAUSE                      : 1350,
      ERROR_VIEW_SELECT_VARIABLE                    : 1351,
      ERROR_VIEW_SELECT_TMPTABLE                    : 1352,
      ERROR_VIEW_WRONG_LIST                         : 1353,
      ERROR_WARN_VIEW_MERGE                         : 1354,
      ERROR_WARN_VIEW_WITHOUT_KEY                   : 1355,
      ERROR_VIEW_INVALID                            : 1356,
      ERROR_SP_NO_DROP_SP                           : 1357,
      ERROR_SP_GOTO_IN_HNDLR                        : 1358,
      ERROR_TRG_ALREADY_EXISTS                      : 1359,
      ERROR_TRG_DOES_NOT_EXIST                      : 1360,
      ERROR_TRG_ON_VIEW_OR_TEMP_TABLE               : 1361,
      ERROR_TRG_CANT_CHANGE_ROW                     : 1362,
      ERROR_TRG_NO_SUCH_ROW_IN_TRG                  : 1363,
      ERROR_NO_DEFAULT_FOR_FIELD                    : 1364,
      ERROR_DIVISION_BY_ZERO                        : 1365,
      ERROR_TRUNCATED_WRONG_VALUE_FOR_FIELD         : 1366,
      ERROR_ILLEGAL_VALUE_FOR_TYPE                  : 1367,
      ERROR_VIEW_NONUPD_CHECK                       : 1368,
      ERROR_VIEW_CHECK_FAILED                       : 1369,
      ERROR_PROCACCESS_DENIED_ERROR                 : 1370,
      ERROR_RELAY_LOG_FAIL                          : 1371,
      ERROR_PASSWD_LENGTH                           : 1372,
      ERROR_UNKNOWN_TARGET_BINLOG                   : 1373,
      ERROR_IO_ERR_LOG_INDEX_READ                   : 1374,
      ERROR_BINLOG_PURGE_PROHIBITED                 : 1375,
      ERROR_FSEEK_FAIL                              : 1376,
      ERROR_BINLOG_PURGE_FATAL_ERR                  : 1377,
      ERROR_LOG_IN_USE                              : 1378,
      ERROR_LOG_PURGE_UNKNOWN_ERR                   : 1379,
      ERROR_RELAY_LOG_INIT                          : 1380,
      ERROR_NO_BINARY_LOGGING                       : 1381,
      ERROR_RESERVED_SYNTAX                         : 1382,
      ERROR_WSAS_FAILED                             : 1383,
      ERROR_DIFF_GROUPS_PROC                        : 1384,
      ERROR_NO_GROUP_FOR_PROC                       : 1385,
      ERROR_ORDERROR_WITH_PROC                      : 1386,
      ERROR_LOGGING_PROHIBIT_CHANGING_OF            : 1387,
      ERROR_NO_FILE_MAPPING                         : 1388,
      ERROR_WRONG_MAGIC                             : 1389,
      ERROR_PS_MANY_PARAM                           : 1390,
      ERROR_KEY_PART_0                              : 1391,
      ERROR_VIEW_CHECKSUM                           : 1392,
      ERROR_VIEW_MULTIUPDATE                        : 1393,
      ERROR_VIEW_NO_INSERT_FIELD_LIST               : 1394,
      ERROR_VIEW_DELETE_MERGE_VIEW                  : 1395,
      ERROR_CANNOT_USER                             : 1396,
      ERROR_XAERROR_NOTA                            : 1397,
      ERROR_XAERROR_INVAL                           : 1398,
      ERROR_XAERROR_RMFAIL                          : 1399,
      ERROR_XAERROR_OUTSIDE                         : 1400,
      ERROR_XAERROR_RMERR                           : 1401,
      ERROR_XA_RBROLLBACK                           : 1402,
      ERROR_NONEXISTING_PROC_GRANT                  : 1403,
      ERROR_PROC_AUTO_GRANT_FAIL                    : 1404,
      ERROR_PROC_AUTO_REVOKE_FAIL                   : 1405,
      ERROR_DATA_TOO_LONG                           : 1406,
      ERROR_SP_BAD_SQLSTATE                         : 1407,
      ERROR_STARTUP                                 : 1408,
      ERROR_LOAD_FROM_FIXED_SIZE_ROWS_TO_VAR        : 1409,
      ERROR_CANT_CREATE_USERROR_WITH_GRANT          : 1410,
      ERROR_WRONG_VALUE_FOR_TYPE                    : 1411,
      ERROR_TABLE_DEF_CHANGED                       : 1412,
      ERROR_SP_DUP_HANDLER                          : 1413,
      ERROR_SP_NOT_VAR_ARG                          : 1414,
      ERROR_SP_NO_RETSET                            : 1415,
      ERROR_CANT_CREATE_GEOMETRY_OBJECT             : 1416,
      ERROR_FAILED_ROUTINE_BREAK_BINLOG             : 1417,
      ERROR_BINLOG_UNSAFE_ROUTINE                   : 1418,
      ERROR_BINLOG_CREATE_ROUTINE_NEED_SUPER        : 1419,
      ERROR_EXEC_STMT_WITH_OPEN_CURSOR              : 1420,
      ERROR_STMT_HAS_NO_OPEN_CURSOR                 : 1421,
      ERROR_COMMIT_NOT_ALLOWED_IN_SF_OR_TRG         : 1422,
      ERROR_NO_DEFAULT_FOR_VIEW_FIELD               : 1423,
      ERROR_SP_NO_RECURSION                         : 1424,
      ERROR_TOO_BIG_SCALE                           : 1425,
      ERROR_TOO_BIG_PRECISION                       : 1426,
      ERROR_M_BIGGERROR_THAN_D                      : 1427,
      ERROR_WRONG_LOCK_OF_SYSTEM_TABLE              : 1428,
      ERROR_CONNECT_TO_FOREIGN_DATA_SOURCE          : 1429,
      ERROR_QUERY_ON_FOREIGN_DATA_SOURCE            : 1430,
      ERROR_FOREIGN_DATA_SOURCE_DOESNT_EXIST        : 1431,
      ERROR_FOREIGN_DATA_STRING_INVALID_CANT_CREATE : 1432,
      ERROR_FOREIGN_DATA_STRING_INVALID             : 1433,
      ERROR_CANT_CREATE_FEDERATED_TABLE             : 1434,
      ERROR_TRG_IN_WRONG_SCHEMA                     : 1435,
      ERROR_STACK_OVERRUN_NEED_MORE                 : 1436,
      ERROR_TOO_LONG_BODY                           : 1437,
      ERROR_WARN_CANT_DROP_DEFAULT_KEYCACHE         : 1438,
      ERROR_TOO_BIG_DISPLAYWIDTH                    : 1439,
      ERROR_XAERROR_DUPID                           : 1440,
      ERROR_DATETIME_FUNCTION_OVERFLOW              : 1441,
      ERROR_CANT_UPDATE_USED_TABLE_IN_SF_OR_TRG     : 1442,
      ERROR_VIEW_PREVENT_UPDATE                     : 1443,
      ERROR_PS_NO_RECURSION                         : 1444,
      ERROR_SP_CANT_SET_AUTOCOMMIT                  : 1445,
      ERROR_MALFORMED_DEFINER                       : 1446,
      ERROR_VIEW_FRM_NO_USER                        : 1447,
      ERROR_VIEW_OTHERROR_USER                      : 1448,
      ERROR_NO_SUCH_USER                            : 1449,
      ERROR_FORBID_SCHEMA_CHANGE                    : 1450,
      ERROR_ROW_IS_REFERENCED_2                     : 1451,
      ERROR_NO_REFERENCED_ROW_2                     : 1452,
      ERROR_SP_BAD_VAR_SHADOW                       : 1453,
      ERROR_TRG_NO_DEFINER                          : 1454,
      ERROR_OLD_FILE_FORMAT                         : 1455,
      ERROR_SP_RECURSION_LIMIT                      : 1456,
      ERROR_SP_PROC_TABLE_CORRUPT                   : 1457,
      ERROR_SP_WRONG_NAME                           : 1458,
      ERROR_TABLE_NEEDS_UPGRADE                     : 1459,
      ERROR_SP_NO_AGGREGATE                         : 1460,
      ERROR_MAX_PREPARED_STMT_COUNT_REACHED         : 1461,
      ERROR_VIEW_RECURSIVE                          : 1462,
      ERROR_NON_GROUPING_FIELD_USED                 : 1463,
      ERROR_TABLE_CANT_HANDLE_SPKEYS                : 1464,
      ERROR_NO_TRIGGERS_ON_SYSTEM_SCHEMA            : 1465,
      ERROR_REMOVED_SPACES                          : 1466,
      ERROR_AUTOINC_READ_FAILED                     : 1467,
      ERROR_USERNAME                                : 1468,
      ERROR_HOSTNAME                                : 1469,
      ERROR_WRONG_STRING_LENGTH                     : 1470,
      ERROR_NON_INSERTABLE_TABLE                    : 1471,
      ERROR_ADMIN_WRONG_MRG_TABLE                   : 1472,
      ERROR_TOO_HIGH_LEVEL_OF_NESTING_FOR_SELECT    : 1473,
      ERROR_NAME_BECOMES_EMPTY                      : 1474,
      ERROR_AMBIGUOUS_FIELD_TERM                    : 1475,
      ERROR_LOAD_DATA_INVALID_COLUMN                : 1476,
      ERROR_LOG_PURGE_NO_FILE                       : 1477,
      ERROR_XA_RBTIMEOUT                            : 1478,
      ERROR_XA_RBDEADLOCK                           : 1479,
      ERROR_TOO_MANY_CONCURRENT_TRXS                : 1480,
    });
})(constants);






var auth = {};
(function(exports) {
    var Buffer = require('buffer').Buffer;
    var crypto = require('crypto');

    function sha1(msg) {
      var hash = crypto.createHash('sha1');
      hash.update(msg);
      // hash.digest() does not output buffers yet
      return hash.digest('binary');
    };
    exports.sha1 = sha1;

    function xor(a, b) {
      a = new Buffer(a, 'binary');
      b = new Buffer(b, 'binary');
      var result = new Buffer(a.length);
      for (var i = 0; i < a.length; i++) {
        result[i] = (a[i] ^ b[i]);
      }
      return result;
    };
    exports.xor = xor;

    exports.token = function(password, scramble) {
      if (!password) {
        return new Buffer(0);
      }

      var stage1 = sha1(password);
      var stage2 = sha1(stage1);
      var stage3 = sha1(scramble.toString('binary') + stage2);
      return xor(stage3, stage1);
    };

    // This is a port of sql/password.c:hash_password which needs to be used for
    // pre-4.1 passwords.
    exports.hashPassword = function(password) {
      var nr = [0x5030, 0x5735],
          add = 7,
          nr2 = [0x1234, 0x5671],
          result = new Buffer(8);

      if (typeof password == 'string'){
        password = new Buffer(password);
      }

      for (var i = 0; i < password.length; i++) {
        var c = password[i];
        if (c == 32 || c == 9) {
          // skip space in password
          continue;
        }

        // nr^= (((nr & 63)+add)*c)+ (nr << 8);
        // nr = xor(nr, add(mul(add(and(nr, 63), add), c), shl(nr, 8)))
        nr = this.xor32(nr, this.add32(this.mul32(this.add32(this.and32(nr, [0,63]), [0,add]), [0,c]), this.shl32(nr, 8)));

        // nr2+=(nr2 << 8) ^ nr;
        // nr2 = add(nr2, xor(shl(nr2, 8), nr))
        nr2 = this.add32(nr2, this.xor32(this.shl32(nr2, 8), nr));

        // add+=tmp;
        add += c;
      }

      this.int31Write(result, nr, 0);
      this.int31Write(result, nr2, 4);

      return result;
    };

    exports.randomInit = function(seed1, seed2) {
      return {
        max_value: 0x3FFFFFFF,
        max_value_dbl: 0x3FFFFFFF,
        seed1: seed1 % 0x3FFFFFFF,
        seed2: seed2 % 0x3FFFFFFF
      };
    };

    exports.myRnd = function(r){
      r.seed1 = (r.seed1 * 3 + r.seed2) % r.max_value;
      r.seed2 = (r.seed1 + r.seed2 + 33) % r.max_value;

      return r.seed1 / r.max_value_dbl;
    };

    exports.scramble323 = function(message, password) {
      var to = new Buffer(8),
          hashPass = this.hashPassword(password),
          hashMessage = this.hashPassword(message.slice(0, 8)),
          seed1 = this.int32Read(hashPass, 0) ^ this.int32Read(hashMessage, 0),
          seed2 = this.int32Read(hashPass, 4) ^ this.int32Read(hashMessage, 4),
          r = this.randomInit(seed1, seed2);

      for (var i = 0; i < 8; i++){
        to[i] = Math.floor(this.myRnd(r) * 31) + 64;
      }
      var extra = (Math.floor(this.myRnd(r) * 31));

      for (var i = 0; i < 8; i++){
        to[i] ^= extra;
      }

      return to;
    };

    exports.fmt32 = function(x){
      var a = x[0].toString(16),
          b = x[1].toString(16);

      if (a.length == 1) a = '000'+a;
      if (a.length == 2) a = '00'+a;
      if (a.length == 3) a = '0'+a;
      if (b.length == 1) b = '000'+b;
      if (b.length == 2) b = '00'+b;
      if (b.length == 3) b = '0'+b;
      return '' + a + '/' + b;
    };

    exports.xor32 = function(a,b){
      return [a[0] ^ b[0], a[1] ^ b[1]];
    };

    exports.add32 = function(a,b){
      var w1 = a[1] + b[1],
          w2 = a[0] + b[0] + ((w1 & 0xFFFF0000) >> 16);

      return [w2 & 0xFFFF, w1 & 0xFFFF];
    };

    exports.mul32 = function(a,b){
      // based on this example of multiplying 32b ints using 16b
      // http://www.dsprelated.com/showmessage/89790/1.php
      var w1 = a[1] * b[1],
          w2 = (((a[1] * b[1]) >> 16) & 0xFFFF) + ((a[0] * b[1]) & 0xFFFF) + (a[1] * b[0] & 0xFFFF);

      return [w2 & 0xFFFF, w1 & 0xFFFF];
    };

    exports.and32 = function(a,b){
      return [a[0] & b[0], a[1] & b[1]];
    };

    exports.shl32 = function(a,b){
      // assume b is 16 or less
      var w1 = a[1] << b,
          w2 = (a[0] << b) | ((w1 & 0xFFFF0000) >> 16);

      return [w2 & 0xFFFF, w1 & 0xFFFF];
    };

    exports.int31Write = function(buffer, number, offset) {
      buffer[offset] = (number[0] >> 8) & 0x7F;
      buffer[offset + 1] = (number[0]) & 0xFF;
      buffer[offset + 2] = (number[1] >> 8) & 0xFF;
      buffer[offset + 3] = (number[1]) & 0xFF;
    };

    exports.int32Read = function(buffer, offset){
      return (buffer[offset] << 24)
           + (buffer[offset+1] << 16)
           + (buffer[offset+2] << 8)
           + (buffer[offset+3]);
    };
})(auth);




var Parser = (function() {
    var util = require('util');
    var Buffer = require('buffer').Buffer;
    var EventEmitter = require('events').EventEmitter;
    var POWS = [1, 256, 65536, 16777216];

    function Parser() {
      EventEmitter.call(this);

      this.state = Parser.PACKET_LENGTH;
      this.packet = null;
      this.greeted = false;
      this.authenticated = false;
      this.receivingFieldPackets = false;
      this.receivingRowPackets = false;

      this._lengthCodedLength = null;
      this._lengthCodedStringLength = null;
    };
    util.inherits(Parser, EventEmitter);

    Parser.prototype.write = function(buffer) {
      var i = 0,
          c = null,
          self = this,
          state = this.state,
          length = buffer.length,
          packet = this.packet,
          advance = function(newState) {
            self.state = state = (newState === undefined)
              ? self.state + 1
              : newState;

            packet.index = -1;
          },
          lengthCoded = function(val, nextState) {
            if (self._lengthCodedLength === null) {
              if (c === Parser.LENGTH_CODED_16BIT_WORD) {
                self._lengthCodedLength = 2;
              } else if (c === Parser.LENGTH_CODED_24BIT_WORD) {
                self._lengthCodedLength = 3;
              } else if (c === Parser.LENGTH_CODED_64BIT_WORD) {
                self._lengthCodedLength = 8;
              } else if (c === Parser.LENGTH_CODED_NULL) {
                advance(nextState);
                return null;
              } else if (c < Parser.LENGTH_CODED_NULL) {
                advance(nextState);
                return c;
              }

              return 0;
            }

            if (c) {
              val += POWS[packet.index - 1] * c;
            }

            if (packet.index === self._lengthCodedLength) {
              self._lengthCodedLength = null;
              advance(nextState);
            }

            return val;
          },
          emitPacket = function() {
            self.packet = null;
            self.state = state = Parser.PACKET_LENGTH;
            self.greeted = true;
            delete packet.index;
            self.emit('packet', packet);
            packet = null;
          };

      for (; i < length; i++) {
        c = buffer[i];

        if (state > Parser.PACKET_NUMBER) {
          packet.received++;
        }

        switch (state) {
          // PACKET HEADER
          case 0: // PACKET_LENGTH:
            if (!packet) {
              packet = this.packet = new EventEmitter();
              packet.index = 0;
              packet.length = 0;
              packet.received = 0;
              packet.number = 0;
            }

              // 3 bytes - Little endian
            packet.length += POWS[packet.index] * c;

            if (packet.index == 2) {
              advance();
            }
            break;
          case 1: // PACKET_NUMBER:
            // 1 byte
            packet.number = c;

            if (!this.greeted) {
              advance(Parser.GREETING_PROTOCOL_VERSION);
              break;
            }

            if (this.receivingFieldPackets) {
              advance(Parser.FIELD_CATALOG_LENGTH);
            } else if (this.receivingRowPackets) {
              advance(Parser.COLUMN_VALUE_LENGTH);
            } else {
              advance(Parser.FIELD_COUNT);
            }
            break;

          // GREETING_PACKET
          case 2: // GREETING_PROTOCOL_VERSION:
            // Nice undocumented MySql gem, the initial greeting can be an error
            // packet. Happens for too many connections errors.
            if (c === 0xff) {
              packet.type = Parser.ERROR_PACKET;
              advance(Parser.ERROR_NUMBER);
              break;
            }

            // 1 byte
            packet.type = Parser.GREETING_PACKET;
            packet.protocolVersion = c;
            advance();
            break;
          case 3: // GREETING_SERVER_VERSION:
            if (packet.index == 0) {
              packet.serverVersion = '';
            }

            // Null-Terminated String
            if (c != 0) {
              packet.serverVersion += String.fromCharCode(c);
            } else {
              advance();
            }
            break;
          case 4: // GREETING_THREAD_ID:
            if (packet.index == 0) {
              packet.threadId = 0;
            }

            // 4 bytes = probably Little endian, protocol docs are not clear
            packet.threadId += POWS[packet.index] * c;

            if (packet.index == 3) {
              advance();
            }
            break;
          case 5: // GREETING_SCRAMBLE_BUFF_1:
            if (packet.index == 0) {
              packet.scrambleBuffer = new Buffer(8 + 12);
            }

            // 8 bytes
            packet.scrambleBuffer[packet.index] = c;

            if (packet.index == 7) {
              advance();
            }
            break;
          case 6: // GREETING_FILLER_1:
            // 1 byte - 0x00
            advance();
            break;
          case 7: // GREETING_SERVER_CAPABILITIES:
            if (packet.index == 0) {
              packet.serverCapabilities = 0;
            }
            // 2 bytes = probably Little endian, protocol docs are not clear
            packet.serverCapabilities += POWS[packet.index] * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 8: // GREETING_SERVER_LANGUAGE:
            packet.serverLanguage = c;
            advance();
            break;
          case 9: // GREETING_SERVER_STATUS:
            if (packet.index == 0) {
              packet.serverStatus = 0;
            }

            // 2 bytes = probably Little endian, protocol docs are not clear
            packet.serverStatus += POWS[packet.index] * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 10: // GREETING_FILLER_2:
            // 13 bytes - 0x00
            if (packet.index == 12) {
              advance();
            }
            break;
          case 11: // GREETING_SCRAMBLE_BUFF_2:
            // 12 bytes - not 13 bytes like the protocol spec says ...
            if (packet.index < 12) {
              packet.scrambleBuffer[packet.index + 8] = c;
            }
            break;

          // OK_PACKET, ERROR_PACKET, or RESULT_SET_HEADER_PACKET
          case 12: // FIELD_COUNT:
            if (packet.index == 0) {
              if (c === 0xff) {
                packet.type = Parser.ERROR_PACKET;
                advance(Parser.ERROR_NUMBER);
                break;
              }

              if (c == 0xfe && !this.authenticated) {
                packet.type = Parser.USE_OLD_PASSWORD_PROTOCOL_PACKET;
                break;
              }

              if (c === 0x00) {
                // after the first OK PACKET, we are authenticated
                this.authenticated = true;
                packet.type = Parser.OK_PACKET;
                advance(Parser.AFFECTED_ROWS);
                break;
              }
            }

            this.receivingFieldPackets = true;
            packet.type = Parser.RESULT_SET_HEADER_PACKET;
            packet.fieldCount = lengthCoded(packet.fieldCount, Parser.EXTRA_LENGTH);

            break;

          // ERROR_PACKET
          case 13: // ERROR_NUMBER:
            if (packet.index == 0) {
              packet.errorNumber = 0;
            }

            // 2 bytes = Little endian
            packet.errorNumber += POWS[packet.index] * c;

            if (packet.index == 1) {
              if (!this.greeted) {
                // Turns out error packets are confirming to the 4.0 protocol when
                // not greeted yet. Oh MySql, you are such a thing of beauty ...
                advance(Parser.ERROR_MESSAGE);
                break;
              }

              advance();
            }
            break;
          case 14: // ERROR_SQL_STATE_MARKER:
            // 1 character - always #
            packet.sqlStateMarker = String.fromCharCode(c);
            packet.sqlState = '';
            advance();
            break;
          case 15: // ERROR_SQL_STATE:
            // 5 characters
            if (packet.index < 5) {
              packet.sqlState += String.fromCharCode(c);
            }

            if (packet.index == 4) {
              advance(Parser.ERROR_MESSAGE);
            }
            break;
          case 16: // ERROR_MESSAGE:
            if (packet.received <= packet.length) {
              packet.errorMessage = (packet.errorMessage || '') + String.fromCharCode(c);
            }
            break;

          // OK_PACKET
          case 17: // AFFECTED_ROWS:
            packet.affectedRows = lengthCoded(packet.affectedRows);
            break;
          case 18: // INSERT_ID:
            packet.insertId = lengthCoded(packet.insertId);
            break;
          case 19: // SERVER_STATUS:
            if (packet.index == 0) {
              packet.serverStatus = 0;
            }

            // 2 bytes - Little endian
            packet.serverStatus += POWS[packet.index] * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 20: // WARNING_COUNT:
            if (packet.index == 0) {
              packet.warningCount = 0;
            }

            // 2 bytes - Little endian
            packet.warningCount += POWS[packet.index] * c;

            if (packet.index == 1) {
              packet.message = '';
              advance();
            }
            break;
          case 21: // MESSAGE:
            if (packet.received <= packet.length) {
              packet.message += String.fromCharCode(c);
            }
            break;

          // RESULT_SET_HEADER_PACKET
          case 22: // EXTRA_LENGTH:
            packet.extra = '';
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            break;
          case 23: // EXTRA_STRING:
            packet.extra += String.fromCharCode(c);
            break;

          // FIELD_PACKET or EOF_PACKET
          case 24: // FIELD_CATALOG_LENGTH:
            if (packet.index == 0) {
              if (c === 0xfe) {
                packet.type = Parser.EOF_PACKET;
                advance(Parser.EOF_WARNING_COUNT);
                break;
              }
              packet.type = Parser.FIELD_PACKET;
            }
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            break;
          case 25: // FIELD_CATALOG_STRING:
            if (packet.index == 0) {
              packet.catalog = '';
            }
            packet.catalog += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 26: // FIELD_DB_LENGTH:
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            if (self._lengthCodedStringLength == 0) {
              advance();
            }
            break;
          case 27: // FIELD_DB_STRING:
            if (packet.index == 0) {
              packet.db = '';
            }
            packet.db += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 28: // FIELD_TABLE_LENGTH:
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            if (self._lengthCodedStringLength == 0) {
              advance();
            }
            break;
          case 29: // FIELD_TABLE_STRING:
            if (packet.index == 0) {
              packet.table = '';
            }
            packet.table += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 30: // FIELD_ORIGINAL_TABLE_LENGTH:
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            if (self._lengthCodedStringLength == 0) {
              advance();
            }
            break;
          case 31: // FIELD_ORIGINAL_TABLE_STRING:
            if (packet.index == 0) {
              packet.originalTable = '';
            }
            packet.originalTable += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 32: // FIELD_NAME_LENGTH:
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            break;
          case 33: // FIELD_NAME_STRING:
            if (packet.index == 0) {
              packet.name = '';
            }
            packet.name += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 34: // FIELD_ORIGINAL_NAME_LENGTH:
            self._lengthCodedStringLength = lengthCoded(self._lengthCodedStringLength);
            if (self._lengthCodedStringLength == 0) {
              advance();
            }
            break;
          case 35: // FIELD_ORIGINAL_NAME_STRING:
            if (packet.index == 0) {
              packet.originalName = '';
            }
            packet.originalName += String.fromCharCode(c);

            if (packet.index + 1 === self._lengthCodedStringLength) {
              advance();
            }
            break;
          case 36: // FIELD_FILLER_1:
            // 1 bytes - 0x00
            advance();
            break;
          case 37: // FIELD_CHARSET_NR:
            if (packet.index == 0) {
              packet.charsetNumber = 0;
            }

            // 2 bytes - Little endian
            packet.charsetNumber += Math.pow(256, packet.index) * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 38: // FIELD_LENGTH:
            if (packet.index == 0) {
              packet.fieldLength = 0;
            }

            // 4 bytes - Little endian
            packet.fieldLength += Math.pow(256, packet.index) * c;

            if (packet.index == 3) {
              advance();
            }
            break;
          case 39: // FIELD_TYPE:
            // 1 byte
            packet.fieldType = c;
            advance();
          case 40: // FIELD_FLAGS:
            if (packet.index == 0) {
              packet.flags = 0;
            }

            // 2 bytes - Little endian
            packet.flags += Math.pow(256, packet.index) * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 41: // FIELD_DECIMALS:
            // 1 byte
            packet.decimals = c;
            advance();
            break;
          case 42: // FIELD_FILLER_2:
            // 2 bytes - 0x00
            if (packet.index == 1) {
              advance();
            }
            break;
          case 43: // FIELD_DEFAULT:
            // TODO: Only occurs for mysql_list_fields()
            break;

          // EOF_PACKET
          case 44: // EOF_WARNING_COUNT:
            if (packet.index == 0) {
              packet.warningCount = 0;
            }

            // 2 bytes - Little endian
            packet.warningCount += Math.pow(256, packet.index) * c;

            if (packet.index == 1) {
              advance();
            }
            break;
          case 45: // EOF_SERVER_STATUS:
            if (packet.index == 0) {
              packet.serverStatus = 0;
            }

            // 2 bytes - Little endian
            packet.serverStatus += Math.pow(256, packet.index) * c;

            if (packet.index == 1) {
              if (this.receivingFieldPackets) {
                this.receivingFieldPackets = false;
                this.receivingRowPackets = true;
              } else {
              }
            }
            break;
          case 46: // COLUMN_VALUE_LENGTH:
            if (packet.index == 0) {
              packet.columnLength = 0;
              packet.type = Parser.ROW_DATA_PACKET;
            }

            if (packet.received == 1) {
              if (c === 0xfe) {
                packet.type = Parser.EOF_PACKET;
                this.receivingRowPackets = false;
                advance(Parser.EOF_WARNING_COUNT);
                break;
              }
              this.emit('packet', packet);
            }

            packet.columnLength = lengthCoded(packet.columnLength);

            if (!packet.columnLength && !this._lengthCodedLength) {
              packet.emit('data', (packet.columnLength === null ? null : new Buffer(0)), 0);
              if (packet.received < packet.length) {
                advance(Parser.COLUMN_VALUE_LENGTH);
              } else {
                self.packet = packet = null;
                self.state = state = Parser.PACKET_LENGTH;
                continue;
              }
            }
            break;
          case 47: // COLUMN_VALUE_STRING:
            var remaining = packet.columnLength - packet.index, read;
            if (i + remaining > buffer.length) {
              read = buffer.length - i;
              packet.index += read;
              packet.emit('data', buffer.slice(i, buffer.length), remaining - read);
              // the -1 offsets are because these values are also manipulated by the loop itself
              packet.received += read - 1;
              i = buffer.length;
            } else {
              packet.emit('data', buffer.slice(i, i + remaining), 0);
              i += remaining - 1;
              packet.received += remaining - 1;
              advance(Parser.COLUMN_VALUE_LENGTH);
              // advance() sets this to -1, but packet.index++ is skipped, so we need to manually fix
              packet.index = 0;
            }

            if (packet.received == packet.length) {
              self.packet = packet = null;
              self.state = state = Parser.PACKET_LENGTH;
            }

            continue;
        }

        packet.index++;

        if (state > Parser.PACKET_NUMBER && packet.received === packet.length) {
          emitPacket();
        }
      }
    };


    Parser.LENGTH_CODED_NULL = 251;
    Parser.LENGTH_CODED_16BIT_WORD= 252;
    Parser.LENGTH_CODED_24BIT_WORD= 253;
    Parser.LENGTH_CODED_64BIT_WORD= 254;

    // Parser states
    var s                               = 0;
    Parser.PACKET_LENGTH                = s++;
    Parser.PACKET_NUMBER                = s++;
    Parser.GREETING_PROTOCOL_VERSION    = s++;
    Parser.GREETING_SERVER_VERSION      = s++;
    Parser.GREETING_THREAD_ID           = s++;
    Parser.GREETING_SCRAMBLE_BUFF_1     = s++;
    Parser.GREETING_FILLER_1            = s++;
    Parser.GREETING_SERVER_CAPABILITIES = s++;
    Parser.GREETING_SERVER_LANGUAGE     = s++;
    Parser.GREETING_SERVER_STATUS       = s++;
    Parser.GREETING_FILLER_2            = s++;
    Parser.GREETING_SCRAMBLE_BUFF_2     = s++;
    Parser.FIELD_COUNT                  = s++;
    Parser.ERROR_NUMBER                 = s++;
    Parser.ERROR_SQL_STATE_MARKER       = s++;
    Parser.ERROR_SQL_STATE              = s++;
    Parser.ERROR_MESSAGE                = s++;
    Parser.AFFECTED_ROWS                = s++;
    Parser.INSERT_ID                    = s++;
    Parser.SERVER_STATUS                = s++;
    Parser.WARNING_COUNT                = s++;
    Parser.MESSAGE                      = s++;
    Parser.EXTRA_LENGTH                 = s++;
    Parser.EXTRA_STRING                 = s++;
    Parser.FIELD_CATALOG_LENGTH         = s++;
    Parser.FIELD_CATALOG_STRING         = s++;
    Parser.FIELD_DB_LENGTH              = s++;
    Parser.FIELD_DB_STRING              = s++;
    Parser.FIELD_TABLE_LENGTH           = s++;
    Parser.FIELD_TABLE_STRING           = s++;
    Parser.FIELD_ORIGINAL_TABLE_LENGTH  = s++;
    Parser.FIELD_ORIGINAL_TABLE_STRING  = s++;
    Parser.FIELD_NAME_LENGTH            = s++;
    Parser.FIELD_NAME_STRING            = s++;
    Parser.FIELD_ORIGINAL_NAME_LENGTH   = s++;
    Parser.FIELD_ORIGINAL_NAME_STRING   = s++;
    Parser.FIELD_FILLER_1               = s++;
    Parser.FIELD_CHARSET_NR             = s++;
    Parser.FIELD_LENGTH                 = s++;
    Parser.FIELD_TYPE                   = s++;
    Parser.FIELD_FLAGS                  = s++;
    Parser.FIELD_DECIMALS               = s++;
    Parser.FIELD_FILLER_2               = s++;
    Parser.FIELD_DEFAULT                = s++;
    Parser.EOF_WARNING_COUNT            = s++;
    Parser.EOF_SERVER_STATUS            = s++;
    Parser.COLUMN_VALUE_LENGTH          = s++;
    Parser.COLUMN_VALUE_STRING          = s++;

    // Packet types
    var p                                   = 0;
    Parser.GREETING_PACKET                  = p++;
    Parser.OK_PACKET                        = p++;
    Parser.ERROR_PACKET                     = p++;
    Parser.RESULT_SET_HEADER_PACKET         = p++;
    Parser.FIELD_PACKET                     = p++;
    Parser.EOF_PACKET                       = p++;
    Parser.ROW_DATA_PACKET                  = p++;
    Parser.ROW_DATA_BINARY_PACKET           = p++;
    Parser.OK_FOR_PREPARED_STATEMENT_PACKET = p++;
    Parser.PARAMETER_PACKET                 = p++;
    Parser.USE_OLD_PASSWORD_PROTOCOL_PACKET = p++;

    return Parser;
})();


var OutgoingPacket = (function() {
    var Buffer = require('buffer').Buffer;

    function OutgoingPacket(size, num) {
      this.buffer = new Buffer(size + 3 + 1);
      this.index = 0;
      this.writeNumber(3, size);
      this.writeNumber(1, num || 0);
    };

    OutgoingPacket.prototype.writeNumber = function(bytes, number) {
      for (var i = 0; i < bytes; i++) {
        this.buffer[this.index++] = (number >> (i * 8)) & 0xff;
      }
    };

    OutgoingPacket.prototype.writeFiller = function(bytes) {
      for (var i = 0; i < bytes; i++) {
        this.buffer[this.index++] = 0;
      }
    };

    OutgoingPacket.prototype.write = function(bufferOrString, encoding) {
      if (typeof bufferOrString == 'string') {
        this.index += this.buffer.write(bufferOrString, this.index, encoding);
        return;
      }

      bufferOrString.copy(this.buffer, this.index, 0);
      this.index += bufferOrString.length;
    };

    OutgoingPacket.prototype.writeNullTerminated = function(bufferOrString, encoding) {
      this.write(bufferOrString, encoding);
      this.buffer[this.index++] = 0;
    };

    OutgoingPacket.prototype.writeLengthCoded = function(bufferOrStringOrNumber, encoding) {
      if (bufferOrStringOrNumber === null) {
          this.buffer[this.index++] = 251;
          return;
      }

      if (typeof bufferOrStringOrNumber == 'number') {
        if (bufferOrStringOrNumber <= 250) {
          this.buffer[this.index++] = bufferOrStringOrNumber;
          return;
        }

        // @todo support 8-byte numbers and simplify this
        if (bufferOrStringOrNumber < 0xffff) {
          this.buffer[this.index++] = 252;
          this.buffer[this.index++] = (bufferOrStringOrNumber >> 0) & 0xff;
          this.buffer[this.index++] = (bufferOrStringOrNumber >> 8) & 0xff;
        } else if (bufferOrStringOrNumber < 0xffffff) {
          this.buffer[this.index++] = 253;
          this.buffer[this.index++] = (bufferOrStringOrNumber >> 0) & 0xff;
          this.buffer[this.index++] = (bufferOrStringOrNumber >> 8) & 0xff;
          this.buffer[this.index++] = (bufferOrStringOrNumber >> 16) & 0xff;
        } else {
          throw new Error('8 byte length coded numbers not supported yet');
        }
        return;
      }

      if (bufferOrStringOrNumber instanceof Buffer) {
        this.writeLengthCoded(bufferOrStringOrNumber.length);
        this.write(bufferOrStringOrNumber);
        return;
      }

      if (typeof bufferOrStringOrNumber == 'string') {
        this.writeLengthCoded(Buffer.byteLength(bufferOrStringOrNumber, encoding));
        this.write(bufferOrStringOrNumber, encoding);
        return;
      }

      throw new Error('passed argument not a buffer, string or number: '+bufferOrStringOrNumber);
    };

    return OutgoingPacket;
})();




var Query = (function() {
    var util = require('util');
    var EventEmitter = require('events').EventEmitter;

    function Query(properties) {
      EventEmitter.call(this);

      this.sql = null;
      this.typeCast = true;

      for (var key in properties) {
        this[key] = properties[key];
      }
    };
    util.inherits(Query, EventEmitter);

    Query.prototype._handlePacket = function(packet) {
      var self = this;

      switch (packet.type) {
        case Parser.OK_PACKET:
          this.emit('end', Client._packetToUserObject(packet));
          break;
        case Parser.ERROR_PACKET:
          packet.sql = this.sql;
          this.emit('error', Client._packetToUserObject(packet));
          break;
        case Parser.FIELD_PACKET:
          if (!this._fields) {
            this._fields = [];
          }

          this._fields.push(packet);
          this.emit('field', packet);
          break;
        case Parser.EOF_PACKET:
          if (!this._eofs) {
            this._eofs = 1;
          } else {
            this._eofs++;
          }

          if (this._eofs == 2) {
            this.emit('end');
          }
          break;
        case Parser.ROW_DATA_PACKET:
          var row = this._row = {}, field;

          this._rowIndex = 0;

          packet.on('data', function(buffer, remaining) {
            if (!field) {
              field = self._fields[self._rowIndex];
              row[field.name] = '';
            }

            if (buffer) {
              row[field.name] += buffer.toString('utf-8');
            } else {
              row[field.name] = null;
            }

            if (remaining !== 0) {
              return;
            }

            self._rowIndex++;
            if (self.typeCast && buffer !== null) {
              switch (field.fieldType) {
                case Query.FIELD_TYPE_TIMESTAMP:
                case Query.FIELD_TYPE_DATE:
                case Query.FIELD_TYPE_DATETIME:
                case Query.FIELD_TYPE_NEWDATE:
                  row[field.name] = new Date(row[field.name]);
                  break;
                case Query.FIELD_TYPE_TINY:
                case Query.FIELD_TYPE_SHORT:
                case Query.FIELD_TYPE_LONG:
                case Query.FIELD_TYPE_LONGLONG:
                case Query.FIELD_TYPE_INT24:
                case Query.FIELD_TYPE_YEAR:
                  row[field.name] = parseInt(row[field.name], 10);
                  break;
                case Query.FIELD_TYPE_FLOAT:
                case Query.FIELD_TYPE_DOUBLE:
                  // decimal types cannot be parsed as floats because
                  // V8 Numbers have less precision than some MySQL Decimals
                  row[field.name] = parseFloat(row[field.name]);
                  break;
              }
            }

            if (self._rowIndex == self._fields.length) {
               delete self._row;
               delete self._rowIndex;
               self.emit('row', row);
               return;
            }

            field = null;
          });
          break;
      }
    };

    Query.FIELD_TYPE_DECIMAL     = 0x00;
    Query.FIELD_TYPE_TINY        = 0x01;
    Query.FIELD_TYPE_SHORT       = 0x02;
    Query.FIELD_TYPE_LONG        = 0x03;
    Query.FIELD_TYPE_FLOAT       = 0x04;
    Query.FIELD_TYPE_DOUBLE      = 0x05;
    Query.FIELD_TYPE_NULL        = 0x06;
    Query.FIELD_TYPE_TIMESTAMP   = 0x07;
    Query.FIELD_TYPE_LONGLONG    = 0x08;
    Query.FIELD_TYPE_INT24       = 0x09;
    Query.FIELD_TYPE_DATE        = 0x0a;
    Query.FIELD_TYPE_TIME        = 0x0b;
    Query.FIELD_TYPE_DATETIME    = 0x0c;
    Query.FIELD_TYPE_YEAR        = 0x0d;
    Query.FIELD_TYPE_NEWDATE     = 0x0e;
    Query.FIELD_TYPE_VARCHAR     = 0x0f;
    Query.FIELD_TYPE_BIT         = 0x10;
    Query.FIELD_TYPE_NEWDECIMAL  = 0xf6;
    Query.FIELD_TYPE_ENUM        = 0xf7;
    Query.FIELD_TYPE_SET         = 0xf8;
    Query.FIELD_TYPE_TINY_BLOB   = 0xf9;
    Query.FIELD_TYPE_MEDIUM_BLOB = 0xfa;
    Query.FIELD_TYPE_LONG_BLOB   = 0xfb;
    Query.FIELD_TYPE_BLOB        = 0xfc;
    Query.FIELD_TYPE_VAR_STRING  = 0xfd;
    Query.FIELD_TYPE_STRING      = 0xfe;
    Query.FIELD_TYPE_GEOMETRY    = 0xff;

    return Query;
})();




var Client = (function() {
    var util = require('util');
    var Socket = require('net').Socket;
    var EventEmitter = require('events').EventEmitter;

    function Client() {
      if (!(this instanceof Client) || arguments.length) {
        throw new Error('deprecated: use mysql.createClient() instead');
      }

      EventEmitter.call(this);

      this.host = 'localhost';
      this.port = 3306;
      this.user = 'root';
      this.password = null;
      this.database = '';

      this.typeCast = true;
      this.flags = Client.defaultFlags;
      this.maxPacketSize = 0x01000000;
      this.charsetNumber = constants.UTF8_UNICODE_CI;
      this.debug = false;
      this.ending = false;
      this.connected = false;

      this._greeting = null;
      this._queue = [];
      this._socket = null;
      this._parser = null;
    };
    util.inherits(Client, EventEmitter);

    Client.prototype.connect = function() {
      throw new Error('deprecated: connect() is now done automatically.');
    };

    Client.prototype._connect = function() {
      this.destroy();

      var socket = this._socket = new Socket();
      var parser = this._parser = new Parser();
      var self = this;

      socket
        .on('error', this._connectionErrorHandler())
        .on('data', parser.write.bind(parser))
        .on('end', function() {
          if (self.ending) {
            // @todo destroy()?
            self.connected = false;
            self.ending = false;

            if (self._queue.length) {
              self._connect();
            }

            return;
          }

          if (!self.connected) {
            this.emit('error', new Error('reconnection attempt failed before connection was fully set up'));
            return;
          }

          self._connect();
        })
        .connect(this.port, this.host);

      parser.on('packet', this._handlePacket.bind(this));
    };

    Client.prototype.query = function(sql, params, cb) {
      if (Array.isArray(params)) {
        sql = this.format(sql, params);
      } else {
        cb = arguments[1];
      }

      var query = new Query({
        typeCast: this.typeCast,
        sql: sql
      });

      var self = this;
      if (cb) {
        var rows = [], fields = {};
        query
          .on('error', function(err) {
            cb(err);
            self._dequeue();
          })
          .on('field', function(field) {
            fields[field.name] = field;
          })
          .on('row', function(row) {
            rows.push(row);
          })
          .on('end', function(result) {
            if (result) {
              cb(null, result);
            } else {
              cb(null, rows, fields);
            }

            self._dequeue();
          });
      } else {
        query
          .on('error', function(err) {
            if (query.listeners('error').length <= 1) {
              self.emit('error', err);
            }
            self._dequeue();
          })
          .on('end', function(result) {
            self._dequeue();
          });
      }

      this._enqueue(function query() {
        var packet = new OutgoingPacket(1 + Buffer.byteLength(sql, 'utf-8'));

        packet.writeNumber(1, constants.COM_QUERY);
        packet.write(sql, 'utf-8');
        self.write(packet);
      }, query);

      return query;
    };

    Client.prototype.write = function(packet) {
      if (this.debug) {
        console.log('-> %s', packet.buffer.inspect());
      }

      this._socket.write(packet.buffer);
    };

    Client.prototype.format = function(sql, params) {
      var escape = this.escape;
      params = params.concat();

      sql = sql.replace(/\?/g, function() {
        if (params.length == 0) {
          throw new Error('too few parameters given');
        }

        return escape(params.shift());
      });

      if (params.length) {
        throw new Error('too many parameters given');
      }

      return sql;
    };

    Client.prototype.escape = function(val) {
      if (val === undefined || val === null) {
        return 'NULL';
      }

      switch (typeof val) {
        case 'boolean': return (val) ? 'true' : 'false';
        case 'number': return val+'';
      }

      if (typeof val === 'object') {
        val = (typeof val.toISOString === 'function')
          ? val.toISOString()
          : val.toString();
      }

      val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
        switch(s) {
          case "\0": return "\\0";
          case "\n": return "\\n";
          case "\r": return "\\r";
          case "\b": return "\\b";
          case "\t": return "\\t";
          case "\x1a": return "\\Z";
          default: return "\\"+s;
        }
      });
      return "'"+val+"'";
    };

    Client.prototype.ping = function(cb) {
      var self = this;
      this._enqueue(function ping() {
        var packet = new OutgoingPacket(1);
        packet.writeNumber(1, constants.COM_PING);
        self.write(packet);
      }, cb);
    };

    Client.prototype.statistics = function(cb) {
      var self = this;
      this._enqueue(function statistics() {
        var packet = new OutgoingPacket(1);
        packet.writeNumber(1, constants.COM_STATISTICS);
        self.write(packet);
      }, cb);
    };

    Client.prototype.useDatabase = function(database, cb) {
      var self = this;
      this._enqueue(function useDatabase() {
        var packet = new OutgoingPacket(1 + Buffer.byteLength(database, 'utf-8'));
        packet.writeNumber(1, constants.COM_INIT_DB);
        packet.write(database, 'utf-8');
        self.write(packet);
      }, cb);
    };

    Client.prototype.destroy = function() {
      if (this._socket) {
        this._socket.destroy();
      }

      this._socket = null;
      this._parser = null;
      this.connected = false;
    }

    Client.prototype.end = function(cb) {
      var self = this;

      this.ending = true;

      this._enqueue(function end() {
        var packet = new OutgoingPacket(1);
        packet.writeNumber(1, constants.COM_QUIT);
        self.write(packet);

        // @todo handle clean shut down properly
        if (cb) {
          self._socket.on('end', cb);
        }

        self._dequeue();
      }, cb);
    };

    Client.prototype._enqueue = function(fn, delegate) {
      if (!this._socket) {
        this._connect();
      }

      this._queue.push({fn: fn, delegate: delegate});
      if (this._queue.length === 1 && this.connected) {
        fn();
      }
    };

    Client.prototype._dequeue = function() {
      this._queue.shift();

      if (!this._queue.length) {
        return;
      }

      if (!this.connected) {
        this._connect();
        return;
      }

      this._queue[0].fn();
    };

    Client.prototype._handlePacket = function(packet) {
      if (this.debug) {
        this._debugPacket(packet);
      }

      if (packet.type == Parser.GREETING_PACKET) {
        this._sendAuth(packet);
        return;
      }

      if (packet.type == Parser.USE_OLD_PASSWORD_PROTOCOL_PACKET) {
        this._sendOldAuth(this._greeting);
        return;
      }

      if (!this.connected) {
        if (packet.type != Parser.ERROR_PACKET) {
          this.connected = true;

          if (this._queue.length) this._queue[0].fn();
          return;
        }

        this._connectionErrorHandler()(Client._packetToUserObject(packet));
        return;
      }

      // @TODO Simplify the code below and above as well
      var type = packet.type;
      var task = this._queue[0];
      var delegate = (task)
            ? task.delegate
            : null;

      if (delegate instanceof Query) {
        delegate._handlePacket(packet);
        return;
      }

      if (type != Parser.ERROR_PACKET) {
        this.connected = true;
        if (delegate) {
          delegate(null, Client._packetToUserObject(packet));
        }
      } else {
        packet = Client._packetToUserObject(packet);
        if (delegate) {
          delegate(packet);
        } else {
          this.emit('error', packet);
        }
      }
      this._dequeue();
    };

    Client.prototype._connectionErrorHandler = function() {
      return function(err) {
        this.destroy();

        var task = this._queue[0];
        var delegate = (task)
          ? task.delegate
          : null;

        if (delegate instanceof Query) {
          delegate.emit('error', err);
          return;
        }

        if (!delegate) {
          this.emit('error', err);
        } else {
          delegate(err);
          this._queue.shift();
        }

        if (this._queue.length) {
          this._connect();
        }
      }.bind(this);
    };

    Client.prototype._sendAuth = function(greeting) {
      var token = auth.token(this.password, greeting.scrambleBuffer);
      var packetSize = (
        4 + 4 + 1 + 23 +
        this.user.length + 1 +
        token.length + 1 +
        this.database.length + 1
      );
      var packet = new OutgoingPacket(packetSize, greeting.number+1);

      packet.writeNumber(4, this.flags);
      packet.writeNumber(4, this.maxPacketSize);
      packet.writeNumber(1, this.charsetNumber);
      packet.writeFiller(23);
      packet.writeNullTerminated(this.user);
      packet.writeLengthCoded(token);
      packet.writeNullTerminated(this.database);

      this.write(packet);

      // Keep a reference to the greeting packet. We might receive a
      // USE_OLD_PASSWORD_PROTOCOL_PACKET as a response, in which case we will need
      // the greeting packet again. See _sendOldAuth()
      this._greeting = greeting;
    };

    Client._packetToUserObject = function(packet) {
      var userObject = (packet.type == Parser.ERROR_PACKET)
        ? new Error()
        : {};

      for (var key in packet) {
        var newKey = key;
        if (key == 'type' || key == 'number' || key == 'length' || key == 'received') {
          continue;
        }

        if (key == 'errorMessage') {
          newKey = 'message';
        } else if (key == 'errorNumber') {
          newKey = 'number';
        }

        userObject[newKey] = packet[key];
      }

      return userObject;
    };

    Client.prototype._debugPacket = function(packet) {
      var packetName = null;
      for (var key in Parser) {
        if (!key.match(/_PACKET$/)) {
          continue;
        }

        if (Parser[key] == packet.type) {
          packetName = key;
          break;
        }
      }
      console.log('<- %s: %j', packetName, packet);
    };

    Client.prototype._sendOldAuth = function(greeting) {
      var token = auth.scramble323(greeting.scrambleBuffer, this.password);
      var packetSize = (
        token.length + 1
      );
      var packet = new OutgoingPacket(packetSize, greeting.number+3);

      // I could not find any official documentation for this, but from sniffing
      // the mysql command line client, I think this is the right way to send the
      // scrambled token after receiving the USE_OLD_PASSWORD_PROTOCOL_PACKET.
      packet.write(token);
      packet.writeFiller(1);

      this.write(packet);
    };

    Client.defaultFlags =
        constants.CLIENT_LONG_PASSWORD
      | constants.CLIENT_FOUND_ROWS
      | constants.CLIENT_LONG_FLAG
      | constants.CLIENT_CONNECT_WITH_DB
      | constants.CLIENT_ODBC
      | constants.CLIENT_LOCAL_FILES
      | constants.CLIENT_IGNORE_SPACE
      | constants.CLIENT_PROTOCOL_41
      | constants.CLIENT_INTERACTIVE
      | constants.CLIENT_IGNORE_SIGPIPE
      | constants.CLIENT_TRANSACTIONS
      | constants.CLIENT_RESERVED
      | constants.CLIENT_SECURE_CONNECTION
      | constants.CLIENT_MULTI_STATEMENTS
      | constants.CLIENT_MULTI_RESULTS;

    return Client;
})();


mysql.createClient = function(config) {
  var client = new Client();
  hashish.update(client, config || {});
  return client;
};

hashish.update(exports, constants);
