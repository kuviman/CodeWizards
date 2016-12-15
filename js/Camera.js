function Camera(player) {
    var camera = this;
    this.player = player;

    this.matrix = mat4.create();
    this.height = 20;
    this.lookPos = vec2.create();

    this.startDrag = undefined;
    this.startZoom = undefined;

    var $canvas = $(QE.canvas);
    $canvas.on("mousedown", function (e) {
        if (e.button == QE.MB_LEFT) {
            camera.onStartDrag(e.offsetX, e.offsetY);
            return false;
        }
    });
    $canvas.on("mousemove", function (e) {
        if (camera.startDrag !== undefined) {
            camera.onDragMove(e.offsetX, e.offsetY);
            return false;
        }
    });
    $canvas.on("mouseup", function (e) {
        if (camera.startDrag !== undefined) {
            camera.onFinishDrag();
            return false;
        }
    });
    $canvas.on("touchstart", function (e) {
        if (e.touches.length == 1) {
            var t = e.touches[0];
            var r = e.target.getBoundingClientRect();
            camera.onStartDrag(t.clientX - r.left, t.clientY - r.top);
            return false;
        } else if (e.touches.length == 2) {
            var t1 = e.touches[0], t2 = e.touches[1];
            var r = e.target.getBoundingClientRect();
            camera.onStartZoom(t1.clientX - r.left, t1.clientY - r.top,
                t2.clientX - r.left, t2.clientY - r.top);
            return false;
        }
    });
    $canvas.on("touchmove", function (e) {
        if (e.touches.length == 1 && camera.startDrag !== undefined) {
            var t = e.touches[0];
            var r = e.target.getBoundingClientRect();
            camera.onDragMove(t.clientX - r.left, t.clientY - r.top);
            return false;
        } else if (e.touches.length == 2 && camera.startZoom !== undefined) {
            var t1 = e.touches[0], t2 = e.touches[1];
            var r = e.target.getBoundingClientRect();
            camera.onZoomMove(t1.clientX - r.left, t1.clientY - r.top,
                t2.clientX - r.left, t2.clientY - r.top);
            return false;
        }
    });
    $canvas.on("touchend", function (e) {
        if (camera.startDrag !== undefined || camera.startZoom !== undefined) {
            camera.onFinishDrag();
            camera.onFinishZoom();
            return false;
        }
    });
}

Camera.prototype = {
    constructor: Camera,
    update: function (deltaTime) {
        mat4.perspective(this.matrix, Math.PI / 2, QE.canvas.width / QE.canvas.height, 0.1, 5000);
        mat4.multiply(this.matrix, this.matrix, mat4.lookAt(mat4.create(),
            vec3.fromValues(this.lookPos[0], this.height, this.lookPos[1] + 5),
            vec3.fromValues(this.lookPos[0], 0, this.lookPos[1]), vec3.fromValues(0, 1, 0)));
    },
    fromMousePos: function (x, y, invMat) {
        x = x / QE.canvas.offsetWidth * 2 - 1;
        y = 1 - y / QE.canvas.offsetHeight * 2;

        var inv = invMat ? invMat : mat4.invert(mat4.create(), this.matrix);

        var p1 = vec4.fromValues(x, y, 1, 1);
        vec4.transformMat4(p1, p1, inv);
        p1[0] /= p1[3];
        p1[1] /= p1[3];
        p1[2] /= p1[3];

        var p2 = vec4.fromValues(x, y, 0, 1);
        vec4.transformMat4(p2, p2, inv);
        p2[0] /= p2[3];
        p2[1] /= p2[3];
        p2[2] /= p2[3];

        var t = -p1[1] / (p2[1] - p1[1]);
        return vec2.fromValues(p1[0] + (p2[0] - p1[0]) * t, p1[2] + (p2[2] - p1[2]) * t);
    },
    onStartDrag: function (x, y) {
        $(QE.canvas).css("cursor", "all-scroll");
        this.startDragLookPos = vec2.clone(this.lookPos);
        this.gestureMatrixInv = mat4.invert(mat4.create(), this.matrix);
        this.startDrag = this.fromMousePos(x, y, this.gestureMatrixInv);
        this.player.showControls();
    },
    onDragMove: function (x, y) {
        var curPos = this.fromMousePos(x, y, this.gestureMatrixInv);
        vec2.sub(this.lookPos, this.startDragLookPos, vec2.sub(vec2.create(), curPos, this.startDrag));
        this.player.showControls();
    },
    onFinishDrag: function () {
        $(QE.canvas).css("cursor", "default");
        this.startDrag = undefined;
    },
    onStartZoom: function (x1, y1, x2, y2) {
        $(QE.canvas).css("cursor", "nwse-resize");
        this.startZoomLookPos = vec2.clone(this.lookPos);
        this.gestureMatrixInv = mat4.invert(mat4.create(), this.matrix);
        this.startZoom = [this.fromMousePos(x1, y1, this.gestureMatrixInv),
            this.fromMousePos(x2, y2, this.gestureMatrixInv)];
        this.startZoomHeight = this.height;
        this.player.showControls();
    },
    onZoomMove: function (x1, y1, x2, y2) {
        var curPos = [this.fromMousePos(x1, y1, this.gestureMatrixInv),
            this.fromMousePos(x2, y2, this.gestureMatrixInv)];
        var startLen = vec2.length(vec2.sub(vec2.create(), this.startZoom[0], this.startZoom[1]));
        var curLen = vec2.length(vec2.sub(vec2.create(), curPos[0], curPos[1]));
        this.height = this.startZoomHeight * startLen / curLen;
        vec2.scaleAndAdd(this.lookPos, this.startZoomLookPos, vec2.sub(vec2.create(),
            vec2.add(vec2.create(), curPos[0], curPos[1]),
            vec2.add(vec2.create(), this.startZoom[0], this.startZoom[1])), -1 / 2);
        this.player.showControls();
    },
    onFinishZoom: function () {
        $(QE.canvas).css("cursor", "default");
        this.startZoom = undefined;
    }
};