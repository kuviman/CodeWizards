var QE = new function () {
    var QE = this;

    function initialize() {
        if (!window.WebGLRenderingContext) {
            QE.failReason = [
                'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br />',
                'Find out how to get it <a href="http://get.webgl.org/">here</a>.'];
            return false;
        }

        QE.$canvas = $("<canvas/>");
        QE.canvas = QE.$canvas[0];
        QE.glContext = QE.canvas.getContext("webgl");
        if (!QE.glContext) {
            QE.glContext = QE.canvas.getContext("experimental-webgl");
        }
        if (!QE.glContext) {
            delete QE.$canvas;
            delete QE.canvas;
            delete QE.glContext;
            QE.failReason = [
                'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation">WebGL</a>.<br/>',
                'Find out how to get it <a href="http://get.webgl.org/">here</a>.'];
            return false;
        }
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
            res.confirmLoaded();
            if (onLoaded) {
                onLoaded(request.response);
            }
        };
        request.send();
    };
    QE.loadText = function (url, onLoaded) {
        var res = new QE.Resource();
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = function () {
            res.confirmLoaded();
            if (onLoaded) {
                onLoaded(request.responseText);
            }
        };
        request.send();
    };

    QE.requestAnimationFrame = true;

    var gl = QE.glContext;
    QE.alpha = 1;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    QE.prevTimeMs = undefined;

    this.run = function (renderFunction) {
        var nowTimeMs = Date.now();
        if (QE.prevTimeMs === undefined) {
            QE.prevTimeMs = nowTimeMs;
        }
        var deltaTimeMs = nowTimeMs - QE.prevTimeMs;
        QE.prevTimeMs = nowTimeMs;

        QE.canvas.width = QE.$canvas.width();
        QE.canvas.height = QE.$canvas.height();
        gl.viewport(0, 0, QE.canvas.width, QE.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        if (renderFunction) {
            renderFunction(deltaTimeMs / 1000);
        }
        if (QE.requestAnimationFrame) {
            requestAnimationFrame(function () {
                QE.run(renderFunction);
            });
        } else {
            setTimeout(function () {
                QE.run(renderFunction);
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
        screen.orientation.lock("landscape").catch(function () {
            // No operations
        });
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
        screen.orientation.unlock();
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