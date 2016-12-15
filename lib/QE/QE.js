var QE = new function () {
    var QE = this;

    function initialize() {
        if (!window.WebGLRenderingContext) {
            QE.failReason = [
                'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />',
                'Find out how to get it <a href="http://get.webgl.org/">here</a>.'];
            return false;
        }

        var canvas = document.createElement("canvas");
        QE.canvas = canvas;
        var gl = canvas.getContext("webgl");
        if (!gl) {
            gl = canvas.getContext("experimental-webgl");
        }
        if (!gl) {
            delete QE.canvas;
            QE.failReason = [
                'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br/>',
                'Find out how to get it <a href="http://get.webgl.org/">here</a>.'];
            return false;
        }
        QE.glContext = gl;
        return true;
    }

    QE.initialized = initialize();
    if (!QE.initialized) {
        return;
    }

    QE.needResources = 0;
    QE.loadedResources = 0;
    QE.resourceLoadingProgress = 0;
    QE.onResourcesLoaded = [];
    QE.onResourceProgress = undefined;

    function Resource() {
        QE.needResources++;
        this._progress = 0;
        this.__defineGetter__("progress", function () {
            return this._progress;
        });
        this.__defineSetter__("progress", function (value) {
            QE.resourceLoadingProgress += value - this._progress;
            if (QE.onResourceProgress) {
                QE.onResourceProgress(QE.resourceLoadingProgress / QE.needResources);
            }
            this._progress = value;
        });
    }

    Resource.prototype = {
        constructor: Resource,
        confirmLoaded: function () {
            this.progress = 1;
            QE.loadedResources++;
            if (QE.loadedResources == QE.needResources) {
                var handlers = QE.onResourcesLoaded;
                for (var i = 0, l = handlers.length; i < l; i++) {
                    handlers[i]();
                }
            }
        }
    };
    QE.Resource = Resource;

    QE.loadBinary = function (url, onLoaded) {
        var res = new QE.Resource();
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        request.onload = function () {
            if (onLoaded) {
                onLoaded(request.response);
            }
            res.confirmLoaded();
        };
        request.send();
    };
    QE.loadText = function (url, onLoaded) {
        var res = new QE.Resource();
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            if (onLoaded) {
                onLoaded(request.responseText);
            }
            res.confirmLoaded();
        };
        request.send();
    };

    QE.requestAnimationFrame = true;

    var canvas = QE.canvas;
    var gl = QE.glContext;
    QE.alpha = 1;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    var prevTimeMs = undefined;

    var nextHtmlUpdate = 0;
    QE.htmlUpdateInterval = 100;

    this.run = function (renderFunction, htmlUpdateFunction) {
        var nowTimeMs = Date.now();
        if (prevTimeMs === undefined) {
            prevTimeMs = nowTimeMs;
        }
        var deltaTimeMs = nowTimeMs - prevTimeMs;
        prevTimeMs = nowTimeMs;

        nextHtmlUpdate -= deltaTimeMs;
        if (nextHtmlUpdate < 0) {
            nextHtmlUpdate = QE.htmlUpdateInterval;

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);

            if (htmlUpdateFunction) {
                htmlUpdateFunction();
            }
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (renderFunction) {
            renderFunction(deltaTimeMs / 1000);
        }
        if (QE.requestAnimationFrame) {
            requestAnimationFrame(function () {
                QE.run(renderFunction, htmlUpdateFunction);
            });
        } else {
            setTimeout(function () {
                QE.run(renderFunction, htmlUpdateFunction);
            }, 0);
        }
        gl.clearColor(0, 0, 0, QE.alpha);
        gl.colorMask(false, false, false, true);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.colorMask(true, true, true, true);
    };

    QE.goFullscreen = function (elem) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else {
            return;
        }
        setTimeout(function () {
            screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
            if (screen.lockOrientationUniversal) {
                screen.lockOrientationUniversal("landscape");
            } else {
                screen.orientation.lock("landscape").catch(function () {
                    // No operations
                });
            }
        }, 100);
    };

    QE.cancelFullscreen = function () {
        if (document.cancelFullScreen) {
            document.cancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else {
            return false;
        }
        screen.unlockOrientationUniversal = screen.unlockOrientation || screen.mozUnlockOrientation || screen.msUnlockOrientation;
        if (screen.unlockOrientationUniversal) {
            screen.unlockOrientationUniversal();
        } else {
            screen.orientation.unlock();
        }
    };

    QE.isFullscreen = function () {
        return document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement;
    };

    QE.toggleFullScreen = function (elem) {
        if (QE.isFullscreen()) {
            QE.cancelFullscreen();
        } else {
            QE.goFullscreen(elem);
        }
    };
}();