function Camera(player) {
    var camera = this;
    this.player = player;

    this.matrix = mat4.create();
    this.height = 20;
    this.lookPos = vec2.create();

    this.startDragLookPos = undefined;
    this.startDrag = undefined;
    this.dragMatrixInv = undefined;
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
        }
    });
    $canvas.on("touchmove", function (e) {
        if (e.touches.length == 1 && camera.startDrag !== undefined) {
            var t = e.touches[0];
            var r = e.target.getBoundingClientRect();
            camera.onDragMove(t.clientX - r.left, t.clientY - r.top);
            return false;
        }
    });
    $canvas.on("touchend", function (e) {
        if (camera.startDrag !== undefined) {
            camera.onFinishDrag();
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
    fromMousePos: function (x, y) {
        x = x / QE.canvas.offsetWidth * 2 - 1;
        y = 1 - y / QE.canvas.offsetHeight * 2;

        var inv = this.dragMatrixInv ? this.dragMatrixInv : mat4.invert(mat4.create(), this.matrix);

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
        $(QE.canvas).css("cursor", "move");
        this.startDragLookPos = vec2.clone(this.lookPos);
        this.dragMatrixInv = mat4.invert(mat4.create(), this.matrix);
        this.startDrag = this.fromMousePos(x, y);
        this.player.showControls();
    },
    onDragMove: function (x, y) {
        var curPos = this.fromMousePos(x, y);
        vec2.sub(this.lookPos, this.startDragLookPos, vec2.sub(curPos, curPos, this.startDrag));
        this.player.showControls();
    },
    onFinishDrag: function () {
        $(QE.canvas).css("cursor", "default");
        this.startDrag = undefined;
        this.dragMatrixInv = undefined;
    }
};