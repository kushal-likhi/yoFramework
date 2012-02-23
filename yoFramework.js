/*
 * @author: Kushal Likhi
 * file initializes the package for phone gap
 * Also helps in debugging
 * Monitor screen resizes accurately
 * generic methods
 * error alerts
 *
 * (c) Kushal Likhi
 * */

var yoFramework = {
    Initializer:function () {
        window._initializer_ = this;
        this.constructor = function () {
            try {
                eval("_initializer_.target.onDeviceReady()");
            } catch (e) {
                navigator.notification.alert(e);
            }
        };

        this.initializePackage = function (targetPackage) {
            _initializer_.target = targetPackage;
            document.addEventListener("deviceready", _initializer_.constructor, true);
            resizeMonitor.start();
        };
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
            setInterval("resizeMonitor.monitor()", 50);
            return resizeMonitor;
        }
    },
    display:function (HTMLMarkup) {
        document.getElementsByTagName('body')[0].innerHTML += HTMLMarkup;
    },
    Browser:function () {
        this.provider = "yoFramework";
        this.display = yoFramework.display;
    },
    init:function () {
        Initializer = yoFramework.Initializer;
        ScreenAreaProvider = yoFramework.ScreenAreaProvider;
        resizeMonitor = yoFramework.resizeMonitor;
        resizeMonitor.screenAreaProvider = new ScreenAreaProvider();
        yo = yoFramework;
        browser = new yoFramework.Browser();
    }
};
yoFramework.init();
