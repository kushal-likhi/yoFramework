/*
 * @author: Kushal Likhi
 * file initializes the package for phone gap
 * Also helps in debugging
 * Monitor screen resizes accurately
 * generic methods
 * error alerts
 *
 * (c) Kushal Likhi
 *
 *
 * Contains json2.js for JSON handling
 * */

var yoFramework = {
    readyTargets:[],
    resizeTargets:{},
    available:false,
    ready:function (target) {
        if (yoFramework.available) {
            try {
                target();
            } catch (ex) {
                reportError(ex);
            }
        } else {
            yoFramework.readyTargets.push(target);
        }
    },
    addOnResizeListener:function (id, handler) {
        if (yoFramework.available) {
            try {
                resizeMonitor.addListener(id, handler);
            } catch (ex) {
                reportError(ex);
            }
        } else {
            yoFramework.resizeTargets[id] = handler;
        }
    },
    removeOnResizeListener:function (id) {
        resizeMonitor.removeListener(id);
    },
    executeReadyTargets:function () {
        for (var idx in yoFramework.readyTargets) {
            try {
                yoFramework.readyTargets[idx]();
            } catch (ex) {
                reportError(ex);
            }
        }
    },
    executeResizeTargets:function () {
        for (var idx in yoFramework.resizeTargets) {
            try {
                resizeMonitor.addListener(idx, yoFramework.resizeTargets[idx]);
            } catch (ex) {
                reportError(ex);
            }
        }
    },
    onDeviceReady:function () {
        yoFramework.available = true;
        yoFramework.executeReadyTargets();
        yoFramework.executeResizeTargets();
    },
    reportError:function (error) {
        try {
            alert(error);
            console.log(error);
        } catch (e) {
        }
    },
    ScreenAreaProvider:function () {
        var browser = new Object();
        browser.height = 0;
        browser.width = 0;
        var obj = this;
        this.findCurrentWindowSize = function () {
            if (typeof( window.innerWidth ) == 'number') {
                browser.width = window.innerWidth;
                browser.height = window.innerHeight;
            }
            else if (document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight)) {
                browser.width = document.documentElement.clientWidth;
                browser.height = document.documentElement.clientHeight;
            }
            else if (document.body && ( document.body.clientWidth || document.body.clientHeight )) {
                browser.width = document.body.clientWidth;
                browser.height = document.body.clientHeight;
            }
            obj.availableHeight = browser.height;
            obj.availableWidth = browser.width;
            obj.availableScreenSize = browser;
            return obj;
        };
    },
    resizeMonitor:{
        handlers:{},
        previousSize:{},
        newSize:{},
        addListener:function (id, handler) {
            resizeMonitor.handlers[id] = handler;
        },
        removeListener:function (id) {
            resizeMonitor.handlers[id] = null;
        },
        monitor:function () {
            resizeMonitor.newSize = resizeMonitor.cloneDimensions(resizeMonitor.screenAreaProvider.findCurrentWindowSize().availableScreenSize);
            window._height = resizeMonitor.newSize.height;
            window._width = resizeMonitor.newSize.width;
            window._orientation = (resizeMonitor.newSize.height > resizeMonitor.newSize.width ? 'portrait' : 'landscape');
            if ((resizeMonitor.previousSize.height != resizeMonitor.newSize.height) || (resizeMonitor.previousSize.width != resizeMonitor.newSize.width)) {
                var newDim = resizeMonitor.cloneDimensions(resizeMonitor.newSize);
                resizeMonitor.executeHandlers(newDim.height, newDim.width);
            }
            resizeMonitor.previousSize = resizeMonitor.cloneDimensions(resizeMonitor.newSize);
        },
        executeHandlers:function (height, width) {
            for (var key in resizeMonitor.handlers) {
                try {
                    resizeMonitor.handlers[key](height, width, _orientation);
                } catch (ex) {
                    navigator.notification.alert(ex);
                }
            }
        },
        cloneDimensions:function (obj) {
            return {
                height:obj.height,
                width:obj.width
            }
        },
        start:function () {
            resizeMonitor.previousSize = resizeMonitor.cloneDimensions(resizeMonitor.screenAreaProvider.findCurrentWindowSize().availableScreenSize);
            resizeMonitor.monitor();
            setInterval("resizeMonitor.monitor()", 50);
            return resizeMonitor;
        }
    },
    json2ImplImport:function () {
        'use strict';
        function f(n) {
            return n < 10 ? '0' + n : n;
        }

        if (typeof Date.prototype.toJSON !== 'function') {
            Date.prototype.toJSON = function (key) {
                return isFinite(this.valueOf())
                    ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                    : null;
            };
            String.prototype.toJSON =
                Number.prototype.toJSON =
                    Boolean.prototype.toJSON = function (key) {
                        return this.valueOf();
                    };
        }
        var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
            gap,
            indent,
            meta = {    // table of character substitutions
                '\b':'\\b',
                '\t':'\\t',
                '\n':'\\n',
                '\f':'\\f',
                '\r':'\\r',
                '"':'\\"',
                '\\':'\\\\'
            },
            rep;

        function quote(string) {
            escapable.lastIndex = 0;
            return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' : '"' + string + '"';
        }

        function str(key, holder) {
            var i, // The loop counter.
                k, // The member key.
                v, // The member value.
                length,
                mind = gap,
                partial,
                value = holder[key];
            if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
                value = value.toJSON(key);
            }
            if (typeof rep === 'function') {
                value = rep.call(holder, key, value);
            }
            switch (typeof value) {
                case 'string':
                    return quote(value);

                case 'number':
                    return isFinite(value) ? String(value) : 'null';
                case 'boolean':
                case 'null':
                    return String(value);
                case 'object':
                    if (!value) {
                        return 'null';
                    }
                    gap += indent;
                    partial = [];
                    if (Object.prototype.toString.apply(value) === '[object Array]') {
                        length = value.length;
                        for (i = 0; i < length; i += 1) {
                            partial[i] = str(i, value) || 'null';
                        }
                        v = partial.length === 0
                            ? '[]'
                            : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                        gap = mind;
                        return v;
                    }
                    if (rep && typeof rep === 'object') {
                        length = rep.length;
                        for (i = 0; i < length; i += 1) {
                            if (typeof rep[i] === 'string') {
                                k = rep[i];
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    } else {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = str(k, value);
                                if (v) {
                                    partial.push(quote(k) + (gap ? ': ' : ':') + v);
                                }
                            }
                        }
                    }
                    v = partial.length === 0
                        ? '{}'
                        : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                    gap = mind;
                    return v;
            }
        }

        if (typeof JSON.stringify !== 'function') {
            JSON.stringify = function (value, replacer, space) {
                var i;
                gap = '';
                indent = '';
                if (typeof space === 'number') {
                    for (i = 0; i < space; i += 1) {
                        indent += ' ';
                    }
                } else if (typeof space === 'string') {
                    indent = space;
                }
                rep = replacer;
                if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                        typeof replacer.length !== 'number')) {
                    throw new Error('JSON.stringify');
                }
                return str('', {'':value});
            };
        }
        if (typeof JSON.parse !== 'function') {
            JSON.parse = function (text, reviver) {
                var j;

                function walk(holder, key) {
                    var k, v, value = holder[key];
                    if (value && typeof value === 'object') {
                        for (k in value) {
                            if (Object.prototype.hasOwnProperty.call(value, k)) {
                                v = walk(value, k);
                                if (v !== undefined) {
                                    value[k] = v;
                                } else {
                                    delete value[k];
                                }
                            }
                        }
                    }
                    return reviver.call(holder, key, value);
                }

                text = String(text);
                cx.lastIndex = 0;
                if (cx.test(text)) {
                    text = text.replace(cx, function (a) {
                        return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                    });
                }
                if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                    .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                    .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
                    j = eval('(' + text + ')');
                    return typeof reviver === 'function'
                        ? walk({'':j}, '')
                        : j;
                }
                throw new SyntaxError('JSON.parse');
            };
        }
    },
    json2:function () {
        var JSON;
        if (!JSON) {
            JSON = {};
        }
        yoFramework.json2ImplImport();
    },
    init:function () {
        yo = yoFramework;
        window.onload = function () {
            window.reportError = yoFramework.reportError;
            window.ScreenAreaProvider = yoFramework.ScreenAreaProvider;
            window.resizeMonitor = yoFramework.resizeMonitor;
            resizeMonitor.screenAreaProvider = new ScreenAreaProvider();
            yoFramework.json2();
            resizeMonitor.start();
            document.addEventListener("deviceready", yoFramework.onDeviceReady, false);
        }
    }
};
yoFramework.init();