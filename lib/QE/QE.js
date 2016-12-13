function QException(message) {
    this.message = message;
}

QException.prototype.constructor = QException;
QException.prototype.name = "QException";

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
    QE.onResourcesLoaded = undefined;
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
                if (QE.onResourcesLoaded) {
                    QE.onResourcesLoaded();
                }
            }
        }
    };
    QE.Resource = Resource;

    QE.loadText = function (url, onLoaded) {
        var res = new QE.Resource();
        $.get(url, function (text) {
            res.confirmLoaded();
            onLoaded(text);
        });
    };

    QE.frameTimes = new Array(20);
    QE.frameTimes.fill(0);
    QE.sumFrameTime = 0;
    QE.frameIndex = 0;

    QE.requestAnimationFrame = false;

    var gl = QE.glContext;
    QE.alpha = 1;

    this.run = function (renderFunction) {
        var nowTimeMs = Date.now();
        if (QE.sumFrameTime == 0) {
            QE.prevTimeMs = nowTimeMs - 1;
        }
        var deltaTimeMs = nowTimeMs - QE.prevTimeMs;
        QE.prevTimeMs = nowTimeMs;

        QE.sumFrameTime += deltaTimeMs - QE.frameTimes[QE.frameIndex];
        QE.frameTimes[QE.frameIndex++] = deltaTimeMs;
        if (QE.frameIndex == QE.frameTimes.length) {
            QE.frameIndex = 0;
        }

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

    this.getFPS = function () {
        if (QE.sumFrameTime == 0) {
            return 0;
        } else {
            return 1000 * QE.frameTimes.length / QE.sumFrameTime;
        }
    };
}();