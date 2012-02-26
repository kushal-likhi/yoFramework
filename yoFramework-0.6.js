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
//Array.each
//obj.each
//JSON.parse / stringify
//AjaxObject
//Domain class
// yo.hasValue
// logger
//Offline Storage API
// assert
// console


var yoFramework = {
    readyTargets:[],
    resizeTargets:{},
    domainTargets:{},
    config:{
        db:{
            mode:'update'
        },
        logger:{
            logLevel:'debug',
            alertLevel:'error',
            template:"#{level}: #{date} - #{message}"
        },
        console:false
    },
    storage:{
        appCache:null,
        appCacheType:"N/A",
        add:function (key, val) {
            localStorage.setItem(key, val);
        },
        fetch:function (key) {
            return localStorage.getItem(key);
        },
        addInQueue:function (val) {
            var queueIndex = parseInt(yoFramework.storage.fetch("queueCount"));
            yoFramework.storage.add("queueItem" + queueIndex, val);
            queueIndex++;
            yoFramework.storage.add("queueCount", queueIndex);
        },
        fetchQueue:function () {
            var queueIndex = parseInt(yoFramework.storage.fetch("queueCount"));
            var arr = new Array();
            for (i = 0; i < queueIndex; i++) {
                arr[i] = yoFramework.storage.fetch("queueItem" + i);
            }
            return arr;
        },
        removeItem:function (key) {
            localStorage.removeItem(key);
        },
        removeQueueItem:function (index) {
            yoFramework.storage.removeItem("queueItem" + index);
        },
        emptyQueue:function () {
            yoFramework.storage.add("queueCount", "0");
        },
        queueSize:function () {
            return parseInt(yoFramework.storage.fetch("queueCount"))
        }
    },
    available:false,
    curry:function (fn, scope) {
        var args = [];
        for (var i = 2, len = arguments.length; i < len; ++i) {
            args.push(arguments[i]);
        }
        if (typeof(fn) != 'function') {
            return function () {
            }
        }
        return function () {
            return fn.apply(scope, args);
        };
    },
    iterators:{
        eachImpl:function (handler) {
            if (this instanceof Array || this instanceof NodeList) {
                for (var i = 0; i < this.length; i++) {
                    yoFramework.curry(handler, this[i], i)();
                }
            } else if (this instanceof Object) {
                for (var key in this) {
                    if (key in ['each']) break;
                    yoFramework.curry(handler, {key:key, val:this[key]}, key, this[key])();
                }
            }
        },
        bind:function () {
            Array.prototype.each = yoFramework.iterators.eachImpl;
            Object.prototype.each = yoFramework.iterators.eachImpl;
        }
    },
    Logger:function () {
        var getLevelInt = function (level) {
            switch (level) {
                case 'trace':
                    return 10;
                    break;
                case 'debug':
                    return 20;
                    break;
                case 'info':
                    return 30;
                    break;
                case 'warn':
                    return 40;
                    break;
                case 'error':
                    return 50;
                    break;
                case 'fatal':
                    return 60;
                    break;
            }
        };
        var getLogColor = function (level) {
            switch (level) {
                case 'trace':
                    return 'aqua';
                    break;
                case 'debug':
                    return 'blue';
                    break;
                case 'info':
                    return 'lime';
                    break;
                case 'warn':
                    return '#FFCC00';
                    break;
                case 'error':
                    return '#ff6600';
                    break;
                case 'fatal':
                    return 'red';
                    break;
            }
        };
        var renderedTemplate = function (message, level, date) {
            return yoFramework.config.logger.template.replace('#{message}', message).replace('#{level}', level).replace('#{date}', date);
        };
        var logIt = function (message, level) {
            message = renderedTemplate(message, level, new Date());
            console.log(message);
            yoFramework.console.log(message, getLogColor(level.toString().toLowerCase()));
        };
        var alertIt = function (message, level) {
            alert(renderedTemplate(message, level, new Date()));
        };
        this.trace = function (message) {
            if (getLevelInt('trace') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'TRACE');
            if (getLevelInt('trace') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'TRACE');
        };
        this.debug = function (message) {
            if (getLevelInt('debug') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'DEBUG');
            if (getLevelInt('debug') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'DEBUG');
        };
        this.info = function (message) {
            if (getLevelInt('info') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'INFO');
            if (getLevelInt('info') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'INFO');
        };
        this.warn = function (message) {
            if (getLevelInt('warn') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'WARN');
            if (getLevelInt('warn') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'WARN');
        };
        this.error = function (message) {
            if (getLevelInt('error') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'ERROR');
            if (getLevelInt('error') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'ERROR');
        };
        this.fatal = function (message) {
            if (getLevelInt('fatal') >= getLevelInt(yoFramework.config.logger.logLevel)) logIt(message, 'FATAL');
            if (getLevelInt('fatal') >= getLevelInt(yoFramework.config.logger.alertLevel)) alertIt(message, 'FATAL');
        };
    },
    assert:function (what, assertCondition) {
        if (!yoFramework.hasValue(assertCondition)) {
            if (!yoFramework.hasValue(what)) {
                throw "ASSERTION FAILURE: " + what + " does not exist.";
            }
        } else {
            if (what != assertCondition) {
                throw "ASSERTION FAILURE: " + what + " do not matches " + assertCondition;
            }
        }
    },
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
    domain:function (domainDescription) {
        var name = domainDescription.name;
        var model = domainDescription.model;
        if (yoFramework.available) {
            try {
                new yoFramework.DomainClass(name, model);
            } catch (ex) {
                reportError(ex);
            }
        } else {
            yoFramework.domainTargets[name] = model;
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
        yoFramework.readyTargets.each(function () {
            try {
                this();
            } catch (ex) {
                reportError(ex);
            }
        });
    },
    executeResizeTargets:function () {
        yoFramework.resizeTargets.each(function () {
            try {
                resizeMonitor.addListener(this.key, this.val);
            } catch (ex) {
                reportError(ex);
            }
        });
    },
    executeDomainTargets:function () {
        yoFramework.domainTargets.each(function () {
            try {
                new yoFramework.DomainClass(this.key, this.val);
            } catch (ex) {
                reportError(ex);
            }
        });
    },
    onDeviceReady:function () {
        yoFramework.available = true;
        yoFramework.executeDomainTargets();
        yoFramework.executeReadyTargets();
        yoFramework.executeResizeTargets();
    },
    reportError:function (error) {
        try {
            log.error(error);
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
            yoFramework.resizeMonitor.handlers.each(function () {
                if (yoFramework.hasValue(this.val)) {
                    try {
                        this.val(height, width, _orientation);
                    } catch (ex) {
                        reportError(ex);
                    }
                }
            });
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
    loadConfigFile:function () {
        try {
            document.getElementsByTagName('meta').each(function () {
                if (this.hasAttribute('name') && this.getAttribute('name').toString().search(/yo/) == 0) {
                    if (this.getAttribute('content').toString() == 'true' || this.getAttribute('content').toString() == 'false') {
                        eval(this.getAttribute('name').toString() + "= " + this.getAttribute('content').toString() + ";")
                    } else {
                        eval(this.getAttribute('name').toString() + "= '" + this.getAttribute('content').toString() + "';")
                    }
                }
            });
        } catch (ex) {
            reportError(ex);
        }
    },
    AjaxObject:function (url, callbackFunction) {
        var obj = this;
        this.async = true;
        this.updating = false;
        this.abort = function () {
            if (obj.updating) {
                obj.updating = false;
                obj.AJAX.abort();
                obj.AJAX = null;
            }
        };
        this.update = function (passData, postMethod) {
            if (obj.updating) {
                return false;
            }
            obj.AJAX = null;
            if (window.XMLHttpRequest) {
                obj.AJAX = new XMLHttpRequest();
            } else {
                obj.AJAX = new ActiveXObject("Microsoft.XMLHTTP");
            }
            if (obj.AJAX == null) {
                return false;
            } else {
                obj.AJAX.onreadystatechange = function () {
                    if (obj.AJAX.readyState == 4) {
                        obj.updating = false;
                        obj.callback(obj.AJAX.responseText, obj.AJAX.status, obj.AJAX.responseXML);
                        obj.AJAX = null;
                    }
                };
                obj.updating = new Date();
                if (/post/i.test(postMethod)) {
                    var uri = urlCall + '?' + obj.updating.getTime();
                    obj.AJAX.open("POST", uri, obj.async);
                    obj.AJAX.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    obj.AJAX.setRequestHeader("Content-Length", passData.length);
                    obj.AJAX.send(passData);
                } else {
                    var uri = urlCall + '?' + passData + '&timestamp=' + (obj.updating.getTime());
                    obj.AJAX.open("GET", uri, obj.async);
                    obj.AJAX.send(null);
                }
                return true;
            }
        };
        var urlCall = url;
        this.callback = callbackFunction || function () {
        };
    },
    initializeOfflineStorageSystem:function () {
        yoFramework.supportsOfflineStorage = false;
        try {
            if (window.applicationCache) {
                yoFramework.storage.appCache = window.applicationCache;
                yoFramework.storage.appCacheType = "window.applicationCache";
                yoFramework.supportsOfflineStorage = true;
            } else if (!yoFramework.supportsOfflineStorage && Modernizr.applicationcache) {
                yoFramework.supportsOfflineStorage = true;
                yoFramework.storage.appCache = Modernizr.applicationcache;
                yoFramework.storage.appCacheType = "Modernizr.applicationcache";
            }
        } catch (c) {
            reportError(c);
        }
    },
    hasValue:function (tmp) {
        return !(typeof(tmp) == 'undefined' || tmp == null);
    },
    console:{
        ui:{
            buildUI:function () {
                var size = new yoFramework.ScreenAreaProvider().findCurrentWindowSize().availableScreenSize;
                var console = yoFramework.hasValue(document.getElementById("osecta")) ? document.getElementById("osecta") : document.createElement("div");
                console.style.fontSize = "12px";
                console.style.fontWeight = "bold";
                console.style.color = "#fff";
                console.style.backgroundColor = "#000";
                console.style.padding = "0px";
                console.style.margin = "0px";
                console.style.position = "fixed";
                console.style.zIndex = 999;
                console.style.overflowY = "scroll";
                console.style.width = "100%";
                console.style.height = "28%";
                console.style.left = "0px";
                console.style.top = "66%";
                console.readOnly = true;
                console.id = "osecta";
                if (!yoFramework.hasValue(document.getElementById("osecta"))) document.getElementsByTagName("body").item(0).appendChild(console);
                console = yoFramework.hasValue(document.getElementById("osehbc")) ? document.getElementById("osehbc") : document.createElement("div");
                console.style.fontSize = "12px";
                console.style.fontWeight = "bold";
                console.style.color = "#fff";
                console.style.backgroundColor = "#666";
                console.style.padding = "0px";
                console.style.margin = "0px";
                console.style.position = "fixed";
                console.style.zIndex = 999;
                console.style.width = "100%";
                console.style.left = "0px";
                console.style.height = "6%";
                console.style.top = "60%";
                console.id = "osehbc";
                console.innerHTML = "<h4 style='padding:0px;margin:0px' align='center'>yoFramework Console</h4>";
                if (!yoFramework.hasValue(document.getElementById("osehbc")))document.getElementsByTagName("body").item(0).appendChild(console);
                console = yoFramework.hasValue(document.getElementById("osecin")) ? document.getElementById("osecin") : document.createElement("input");
                console.style.fontSize = "12px";
                console.style.fontWeight = "bold";
                console.style.color = "#fff";
                console.style.backgroundColor = "#000";
                console.style.padding = "0px";
                console.style.margin = "0px";
                console.style.position = "fixed";
                console.style.zIndex = 999;
                console.style.width = size.width - 100 + "px";
                console.style.left = "100px";
                console.style.height = "6%";
                console.style.top = "94%";
                console.id = "osecin";
                if (!yoFramework.hasValue(document.getElementById("osecin"))) document.getElementsByTagName("body").item(0).appendChild(console);
                console = yoFramework.hasValue(document.getElementById("ccmdsp")) ? document.getElementById("ccmdsp") : document.createElement("input");
                console.style.fontSize = "12px";
                console.style.fontWeight = "bold";
                console.style.color = "#fff";
                console.style.backgroundColor = "#000";
                console.style.padding = "0px";
                console.style.margin = "opx";
                console.style.position = "fixed";
                console.style.zIndex = 999;
                console.style.width = "100px";
                console.style.left = "0px";
                console.style.height = "6%";
                console.style.top = "94%";
                console.readOnly = true;
                console.value = "Command ->";
                console.id = "ccmdsp";
                if (!yoFramework.hasValue(document.getElementById("ccmdsp")))document.getElementsByTagName("body").item(0).appendChild(console);
            }
        },
        eventHandlers:{
            consoleShowHide:function () {
                if (yoFramework.console.expanded) {
                    document.getElementById("ccmdsp").style.display = "none";
                    document.getElementById("osecin").style.display = "none";
                    document.getElementById("osecta").style.display = "none";
                    document.getElementById("osehbc").style.top = "94%";
                    yoFramework.console.expanded = false;
                } else {
                    document.getElementById("ccmdsp").style.display = "block";
                    document.getElementById("osecin").style.display = "block";
                    document.getElementById("osecta").style.display = "block";
                    document.getElementById("osehbc").style.top = "60%";
                    yoFramework.console.expanded = true;
                }
            },
            executeCommand:function (e) {
                if (e.keyCode == 13) {
                    var scr = document.getElementById("osecin").value;
                    yoFramework.console.stack.push(scr);
                    yoFramework.console.currentIndex = yoFramework.console.stack.length;
                    yoFramework.console.log(scr, "green");
                    document.getElementById("osecin").value = "";
                    try {
                        var cmm = new String(scr).split(' ');
                        switch (cmm[0]) {
                            case "echo":
                                try {
                                    eval("yoFramework.console.log(" + cmm[1] + ",'yellow')");
                                } catch (c) {
                                    yoFramework.console.log("Invalid argument", "red")
                                    for (arg in c) {
                                        yoFramework.console.log(arg + " : " + c[arg], "red");
                                    }
                                }
                                break;
                            case "clear":
                                document.getElementById("osecta").innerHTML = "";
                                yoFramework.console.log("OSE Console Cleared");
                                break;
                            case "export":
                                eval("ex." + cmm[1] + " = " + cmm[2]);
                                break;
                            case "alias":
                                eval("a." + cmm[1] + " = " + cmm[2]);
                                break;
                            case "edit":
                                eval("yoFramework.console.getFunc(" + cmm[1] + ")");
                                yoFramework.console.launchEditor(a.evalOSD1234, cmm[1]);
                                break;
                            case "prop-f":
                                eval("var o = " + cmm[1] + ";for (att in o) {yoFramework.console.log('<span style=color:yellow>' + att + ' </span>  ' + o[att],'blue')};yoFramework.console.log('Legend: <span style=color:yellow>Yellow = Property</span> And <span style=color:blue>Blue = Value</span>')");
                                break;
                            case "prop":
                                eval("var o = " + cmm[1] + ";for (att in o) {d = new String(o[att]).trim();if(d.substr(0,8) == 'function'){d = '[function]'};yoFramework.console.log('<span style=color:yellow>' + att + ' </span>  ' + d,'blue')};yoFramework.console.log('Legend: <span style=color:yellow>Yellow = Property</span> And <span style=color:blue>Blue = Value</span>')");
                                break;
                            case "help":
                                yoFramework.console.log("<div style='width:100%;background-color:#333'><h1 align='center'>Console Help</h1><h2 align='center'>&copy;Kushal Likhi</h2></div>Following Commands Are Available:<br><br>1) <b style=color:yellow>echo &lt;parameter&gt; :</b> <span style=color:blue>Echoes the value of the parameter passed.</span><br>2) <b style=color:yellow>clear :</b> <span style=color:blue>Clears the console screen.</span><br>3) <b style=color:yellow>alias &lt;alias name&gt; &lt;reference&gt; :</b> <span style=color:blue>Creates a shorthand reference to the delegate for easy use. reference can be made to any entity ex.Object, function, string etc. To refer this alias you can type a.&lt;alias name&gt;</span><br>4) <b style=color:yellow>export &lt;variable name&gt; &lt;value&gt; :</b> <span style=color:blue>Exports the variable for future use. reference can be made to any entity ex.Object, function, string etc. To refer this alias you can type e.&lt;variable name&gt;</span><br>5) <b style=color:yellow>prop &lt;object&gt; or prop-f(displays function definition too):</b> <span style=color:blue>List all properties of object.</span><br>6) <b style=color:yellow>edit &lt;function&gt; :</b> <span style=color:blue>Launches editor for editing function.</span><br>7) <b style=color:yellow>size &lt;size&gt; :</b> <span style=color:blue>Changes the console font size.</span><br>8) <b style=color:yellow>help :</b> <span style=color:blue>Launches help.</span><br><br><div style='width:100%;background-color:#333'>End Of Help</div>");
                                break;
                            case "size":
                                document.getElementById("osecta").style.fontSize = cmm[1] + "px";
                                document.getElementById("osecin").style.fontSize = cmm[1] + "px";
                                break;
                            case "yo":
                                yoFramework.console.log("YO! :-)", "yellow");
                                break;
                            default:
                                eval(scr);
                                break;
                        }

                    } catch (c) {
                        yoFramework.console.log("Error Executing Command, see manual for details", "red");
                        for (arg in c) {
                            yoFramework.console.log(arg + " : " + c[arg], "red");
                        }
                    }
                }
                if (e.keyCode == 38) {
                    if (yoFramework.console.currentIndex > 0) {
                        document.getElementById("osecin").value = yoFramework.console.stack[yoFramework.console.currentIndex - 1];
                        yoFramework.console.currentIndex--;
                    }
                }
                if (e.keyCode == 40) {
                    if (yoFramework.console.currentIndex < yoFramework.console.stack.length) {
                        yoFramework.console.currentIndex++;
                        document.getElementById("osecin").value = yoFramework.console.stack[yoFramework.console.currentIndex - 1];
                    }
                }
            }
        },
        a:{},
        ex:{},
        closeEditor:function () {
            document.getElementsByTagName("body")[0].removeChild(document.getElementById("osedit"));
        },
        getFunc:function (f) {
            a.evalOSD1234 = "" + f;
        },
        launchEditor:function (delegate, id) {
            var el = document.createElement("div");
            el.style.background = "#fff";
            el.style.position = "fixed";
            el.style.zIndex = 1000;
            el.style.width = "70%";
            el.style.height = "70%";
            el.style.top = "15%";
            el.style.left = "15%";
            el.id = "osedit";
            el.innerHTML = "<textarea id='ostaed' style='width:100%;height:90%;background:#ffc'></textarea><br><button onclick=\"yoFramework.console.updateFunc('" + id + "')\">Update</button><button onclick='yoFramework.console.closeEditor()'>Close</button>";
            document.getElementsByTagName("body")[0].appendChild(el);
            var el2 = document.getElementById("ostaed");
            if (!el2) {
                yoFramework.console.log("not Found")
            }
            el2.innerHTML = el2.innerHTML + delegate;
        },
        log:function (text, col) {
            try {
                text = "$(" + new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds() + ")> <span style='color:" + col + "'>" + text + "</span>";
                var con = document.getElementById("osecta");
                con.innerHTML = con.innerHTML + text + "<br>";
                con.scrollTop = con.scrollHeight;
            } catch (e) {
                log.trace("Tried to access console Log, but console was disabled")
            }
        },
        stack:[],
        updateFunc:function (id) {
            var v = document.getElementById('ostaed').value;
            v = id + " = " + v;
            eval(v);
            yoFramework.console.closeEditor();
        },
        init:function () {
            alert("here");
            if (yoFramework.config.console) {
                try {
                    alert("dddd true");
                    window.a = yoFramework.console.a;
                    window.ex = yoFramework.console.ex;
                    yoFramework.console.ui.buildUI();
                    yoFramework.console.expanded = true;
                    yoFramework.console.currentIndex = yoFramework.console.stack.length;
                    resizeMonitor.addListener('console', yoFramework.console.ui.buildUI);
                    document.getElementById("osehbc").onclick = yoFramework.console.eventHandlers.consoleShowHide;
                    document.getElementById("osecin").onkeydown = yoFramework.console.eventHandlers.executeCommand;
                } catch (c) {
                    reportError(c);
                }
            }
        }
    },
    DomainToDBBridge:function (context) {
        var obj = this;
        var getRecordCount = function () {
            return parseInt(yoFramework.storage.fetch(context.name + "Count"));
        };
        var setRecordCount = function (c) {
            yoFramework.storage.add(context.name + "Count", "" + c);
        };
        var getLastId = function () {
            return parseInt(yoFramework.storage.fetch(context.name + "LastId"));
        };
        var setLastId = function (c) {
            yoFramework.storage.add(context.name + "LastId", "" + c);
        };
        var setModel = function (c) {
            yoFramework.storage.add(context.name + "Model", "" + JSON.stringify(c));
        };
        var getModel = function () {
            return JSON.parse(yoFramework.storage.fetch(context.name + "Model"));
        };
        var delIds = null;
        var updateDelIds = function () {
            delIds = [];
            for (var i = 1; i <= getLastId(); i++) {
                if (!yoFramework.hasValue(yoFramework.storage.fetch(context.name + i))) {
                    delIds.push(i);
                }
            }
        };
        this.dropDatabase = function () {
            for (var i = 0; i <= getRecordCount(); i++) {
                yoFramework.storage.removeItem(context.name + i);
            }
            yoFramework.storage.removeItem(context.name + "Count");
            yoFramework.storage.removeItem(context.name + "LastId");
            yoFramework.storage.removeItem(context.name + "Model");
        };
        this.createDatabase = function () {
            setRecordCount(0);
            setLastId(0);
            setModel(context.model);
        };
        this.databaseExists = function () {
            return yoFramework.hasValue(yoFramework.storage.fetch(context.name + "Model"));
        };
        this.getRecordById = function (id) {
            var record = yoFramework.storage.fetch(context.name + id);
            if (yoFramework.hasValue(record)) {
                record = JSON.parse(record);
            }
            return record;
        };
        this.getRecordCount = function () {
            return getRecordCount();
        };
        this.listRecords = function () {
            var records = [];
            for (var i = 1; i <= getLastId(); i++) {
                var record = yoFramework.storage.fetch(context.name + i);
                if (yoFramework.hasValue(record)) {
                    records.push(JSON.parse(record));
                }
            }
            return records;
        };
        this.deleteRecord = function (record) {
            if (!yoFramework.hasValue(delIds)) updateDelIds();
            var recordD = yoFramework.storage.fetch(context.name + record.id);
            if (yoFramework.hasValue(recordD)) {
                recordD = JSON.parse(recordD);
                yoFramework.storage.removeItem(context.name + record.id);
                setRecordCount(getRecordCount() - 1);
                delIds.push(record.id);
                if (getLastId() == record.id) setLastId(getLastId() - 1);
            }
            return recordD;
        };
        this.saveRecord = function (record) {
            if (!yoFramework.hasValue(delIds)) updateDelIds();
            var newRecord = false;
            if (!yoFramework.hasValue(record.id)) {
                if (delIds.length > 0) {
                    record.id = delIds.pop();
                } else {
                    record.id = getLastId() + 1;
                }
                newRecord = true;
            }
            if (!yoFramework.hasValue(yoFramework.storage.fetch(context.name + record.id))) {
                newRecord = true;
            }
            try {
                yoFramework.storage.add(context.name + record.id, JSON.stringify(record));
                if (newRecord) {
                    if (record.id > getLastId()) {
                        setLastId(record.id);
                    }
                    setRecordCount(getRecordCount() + 1);
                }
            } catch (e) {
                reportError(e);
            }
            return record;
        };
        this.findByMapCriteria = function (criteria) {
            for (var i = 1; i <= getLastId(); i++) {
                var record = yoFramework.storage.fetch(context.name + i);
                if (yoFramework.hasValue(record)) {
                    record = JSON.parse(record);
                    var flag = true;
                    criteria.each(function () {
                        if (record[this.key] != this.val) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        return record;
                    }
                }
            }
            return null;
        };
        this.findByLogicCriteria = function (logicFunction) {
            for (var i = 1; i <= getLastId(); i++) {
                var record = yoFramework.storage.fetch(context.name + i);
                if (yoFramework.hasValue(record)) {
                    record = JSON.parse(record);
                    if (yoFramework.curry(logicFunction, record)()) {
                        return record;
                    }
                }
            }
            return null;
        };
        this.findAllByMapCriteria = function (criteria) {
            var records = [];
            for (var i = 1; i <= getLastId(); i++) {
                var record = yoFramework.storage.fetch(context.name + i);
                if (yoFramework.hasValue(record)) {
                    record = JSON.parse(record);
                    var flag = true;
                    criteria.each(function () {
                        if (record[this.key] != this.val) {
                            flag = false;
                        }
                    });
                    if (flag) {
                        records.push(record);
                    }
                }
            }
            return records;
        };
        this.findAllByLogicCriteria = function (logicFunction) {
            var records = [];
            for (var i = 1; i <= getLastId(); i++) {
                var record = yoFramework.storage.fetch(context.name + i);
                if (yoFramework.hasValue(record)) {
                    record = JSON.parse(record);
                    if (yoFramework.curry(logicFunction, record)()) {
                        records.push(record);
                    }
                }
            }
            return records;
        };
    },
    DomainClass:function (name, model) {
        var obj = this;
        this.name = name;
        this.model = model;
        this.bridge = new yoFramework.DomainToDBBridge(this);
        window[name] = this;
        if (yoFramework.config.db.mode == 'create') this.bridge.dropDatabase();
        if (!this.bridge.databaseExists()) this.bridge.createDatabase();
        this.get = function (id) {
            return obj.bridge.getRecordById(id);
        };
        this.count = function () {
            return obj.bridge.getRecordCount();
        };
        this.list = function () {
            return obj.bridge.listRecords();
        };
        this.del = function (record) {
            if (typeof(record) == 'number') record = {id:record};
            return obj.bridge.deleteRecord(record);
        };
        this.save = function (record) {
            return obj.bridge.saveRecord(record);
        };
        this.find = function (criteria) {
            if (typeof(criteria) == 'function') {
                return obj.bridge.findByLogicCriteria(criteria);
            } else if (criteria instanceof Object) {
                return obj.bridge.findByMapCriteria(criteria);
            }
        };
        this.findAll = function (criteria) {
            if (typeof(criteria) == 'function') {
                return obj.bridge.findAllByLogicCriteria(criteria);
            } else if (criteria instanceof Object) {
                return obj.bridge.findAllByMapCriteria(criteria);
            }
        };
        this.delAll = function (criteria) {
            var res = obj.findAll(criteria);
            res.each(function () {
                obj.del(this);
            });
            return res;
        };
        this.saveAll = function (objectArray) {
            objectArray.each(function () {
                obj.save(this)
            });
            return objectArray;
        };
        this.updateAll = function (criteria, updateCriteria) {
            var list = obj.findAll(criteria);
            list.each(function () {
                obj.save(yoFramework.curry(updateCriteria, this)())
            });
            return list;
        };
    },
    init:function () {
        yo = yoFramework;
        yoFramework.iterators.bind();
        window.onload = function () {
            yoFramework.loadConfigFile();
            window.log = new yoFramework.Logger();
            window.assert = yoFramework.assert;
            window.reportError = yoFramework.reportError;
            window.ScreenAreaProvider = yoFramework.ScreenAreaProvider;
            window.resizeMonitor = yoFramework.resizeMonitor;
            resizeMonitor.screenAreaProvider = new ScreenAreaProvider();
            yoFramework.console.init();
            yoFramework.json2();
            yoFramework.initializeOfflineStorageSystem();
            resizeMonitor.start();
            document.addEventListener("deviceready", yoFramework.onDeviceReady, false);
        }
    }
};
yoFramework.init();