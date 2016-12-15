Settings.HIDE_CONTROLS_DELAY_MS = 2000;

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
    this.$timeline.on("click", function (e) {
        player.currentFrame = Math.floor(player.parser.totalTickCount * e.offsetX / this.offsetWidth);
        return false;
    });
    this.hideControls();

    this.camera = new Camera(this);
    this.trees = new Trees(this);
}

Player.prototype = {
    constructor: Player,
    render: function (deltaTime) {
        this.timeTillNextFrame += deltaTime;
        while (this.timeTillNextFrame >= this.parser.tickTime) {
            if (this.currentFrame + 1 < this.parser.loadedTickCount) {
                this.currentFrame += 1;
                this.timeTillNextFrame -= this.parser.tickTime;
            } else {
                this.timeTillNextFrame = 0;
            }
        }
        if (0 <= this.currentFrame && this.currentFrame < this.parser.loadedTickCount) {
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
        this.trees.render(deltaTime);
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