function Player() {
    var player = this;

    this.$codewizards = $(".codewizards-player");
    this.$screen = this.$codewizards.find(".game-screen");
    this.stats = new Stats();
    this.$stats = $(this.stats.dom).css("position", "absolute");
    this.$screen.append(this.$stats);
    this.$controls = this.$screen.find(".controls");
    this.$timeline = this.$controls.find(".timeline");
    this.$position = this.$timeline.find(".timeline-position");
    this.$loaded = this.$timeline.find(".timeline-loaded");
    this.$currentTick = this.$controls.find(".currentTick");
    this.$tickCount = this.$controls.find(".tickCount");
    this.faded = false;
    QE.alpha = 0;
    this.$controls.find(".fullscreen-button").click(function () {
        QE.toggleFullScreen(player.$codewizards[0]);
    });
    this.$settings = this.$controls.find(".settings");
    this.$controls.find(".settings-button").click(function () {
        player.$settings.fadeToggle(200);
    });
    Settings.setupCheckbox(this.$settings, "limitFPS", function (limitFPS) {
        QE.requestAnimationFrame = limitFPS;
    }, true);
    this.hideControlsTimeMs = undefined;
    this.$codewizards.on("mousemove mousedown touchstart", function () {
        player.showControls();
    });
    this.hideControls();

    this.camera = new Camera(this);
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
for (var i = 0; i < 250; i++) {
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

        this.camera.update(deltaTime);
        QE.useProgram(staticModelProgram);
        QE.glContext.uniformMatrix4fv(QE.getUniformLocation(staticModelProgram, "projectionMatrix"), false, this.camera.matrix);
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
        if (this.hideControlsTimeMs !== undefined && Date.now() > this.hideControlsTimeMs) {
            this.hideControlsTimeMs = undefined;
            this.hideControls();
        }
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
    },
    hideControls: function () {
        this.$controls.animate({bottom: "-32px"}, 200);
    },
    showControls: function () {
        this.$controls.animate({bottom: 0}, 200);
        this.hideControlsTimeMs = Date.now() + Settings.HIDE_CONTROLS_DELAY_MS;
    }
};