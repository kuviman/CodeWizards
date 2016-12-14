function Player() {
    this.$codewizards = $(".codewizards-player");
    var $screen = this.$codewizards.find(".game-screen");
    this.stats = new Stats();
    var $stats = $(this.stats.dom).css("position", "absolute");
    $screen.append($stats);
    this.$loaded = $screen.find(".timeline .loaded");
    this.$downloaded = $screen.find(".timeline .downloaded");
    this.$currentTick = $screen.find(".currentTick");
    this.$tickCount = $screen.find(".tickCount");
    this.$controls = $screen.find(".controls");
    this.$position = this.$controls.find(".timeline .position");
    this.faded = false;
    QE.alpha = 0;

    this.cameraMatrix = mat4.create();
}

var model;
StaticModel.load("models/PineTree/PineTree.sm", function (res) {
    model = res;
});
var textures = [];
QE.loadTexture("models/PineTree/PineTree_1.png", function (res) {
    textures.push(res);
});
QE.loadTexture("models/PineTree/PineTree_2.png", function (res) {
    textures.push(res);
});
QE.loadTexture("models/PineTree/PineTree_3.png", function (res) {
    textures.push(res);
});

var pos = [];
var scale = [];
var tts = [];
for (var i = 0; i < 100; i++) {
    var v = vec2.fromValues(Math.random() * 50 - 25, Math.random() * 50 - 25);
    pos.push(v);
    scale.push(Math.random() + 1);
    tts.push(Math.floor(Math.random() * 3));
}

Player.prototype = {
    constructor: Player,
    render: function (deltaTime) {
        this.timeTillNextFrame += deltaTime;
        var frameChanged = false;
        while (this.timeTillNextFrame >= this.parser.tickTime) {
            this.currentFrame += 1;
            this.timeTillNextFrame -= this.parser.tickTime;
            frameChanged = true;
        }
        this.currentFrame = Math.min(this.currentFrame, this.parser.loadedTickCount - 1);
        if (this.currentFrame >= 0) {
            // render frame
        }

        if (!this.faded) {
            QE.alpha = Math.min(QE.alpha + deltaTime * 3, 1);
            if (QE.alpha == 1) {
                this.$codewizards.addClass("game-running");
                this.faded = true;
            }
        }
        this.stats.update();

        mat4.perspective(this.cameraMatrix, Math.PI / 2, QE.canvas.width / QE.canvas.height, 0.1, 5000);
        mat4.multiply(this.cameraMatrix, this.cameraMatrix, mat4.lookAt(mat4.create(), vec3.fromValues(2, 20 + Math.sin(this.currentFrame / 60) * 5, -10), vec3.create(), vec3.fromValues(0, 1, 0)));
        QE.useProgram(staticModelProgram);
        QE.glContext.uniformMatrix4fv(QE.getUniformLocation(staticModelProgram, "projectionMatrix"), false, this.cameraMatrix);
        for (var i = 0, l = pos.length; i < l; i++) {
            QE.glContext.uniform2fv(QE.getUniformLocation(window.staticModelProgram, "position"), pos[i]);
            QE.glContext.uniform1f(QE.getUniformLocation(window.staticModelProgram, "scale"), scale[i]);
            model.render(textures[tts[i]]);
        }
    },
    updateHtml: function () {
        this.$position.css("left", this.currentFrame * 100 / this.parser.totalTickCount + "%");
        this.$currentTick.text(this.currentFrame);
        this.$tickCount.text(this.parser.totalTickCount);
        this.$loaded.width(this.parser.progress * 100 + "%");
        this.$downloaded.width(this.parser.downloadProgress * 100 + "%");
    },
    connect: function (url, metaUrl) {
        if (this.parser) {
            this.parser.disconnect();
        }
        this.parser = new Parser(url, metaUrl);
        var $timeline = $(".codewizards-player .timeline");
        $timeline.removeClass("downloaded");
        this.parser.onDownloaded(function () {
            $timeline.addClass("downloaded");
        });
        this.currentFrame = 0;
        this.timeTillNextFrame = 0;
    }
};