function Player() {
    var $screen = $(".codewizards-player .game-screen");
    this.stats = new Stats();
    var $stats = $(this.stats.dom).css("position", "absolute");
    $screen.append($stats);
    this.$loaded = $screen.find(".timeline .loaded");
    this.$downloaded = $screen.find(".timeline .downloaded");
    this.$currentTick = $screen.find(".currentTick");
    this.$tickCount = $screen.find(".tickCount");
    this.$controls = $screen.find(".controls");
    this.$position = this.$controls.find(".timeline .position");
    this.currentFrame = 0;
    this.timeTillNextFrame = 0;
    QE.alpha = 0;
}

var model;
QE.StaticModel.load("models/PineTree/PineTree.sm", function (res) {
    model = res;
});

Player.prototype = {
    constructor: Player,
    render: function (deltaTime) {
        this.timeTillNextFrame += deltaTime;
        while (this.timeTillNextFrame >= this.parser.tickTime) {
            this.currentFrame += 1;
            this.timeTillNextFrame -= this.parser.tickTime;
        }
        this.currentFrame = Math.min(this.currentFrame, this.parser.loadedTickCount - 1);
        if (this.currentFrame >= 0) {
            // render frame
        }
        this.$position.css("left", this.currentFrame * 100 / this.parser.totalTickCount + "%");

        this.$loaded.width(this.parser.progress * 100 + "%");
        this.$downloaded.width(this.parser.downloadProgress * 100 + "%");
        QE.alpha = Math.min(QE.alpha + deltaTime * 3, 1);
        this.$currentTick.text(this.currentFrame);
        this.$tickCount.text(this.parser.totalTickCount);
        this.stats.update();

        model.render();
    },
    connect: function (url, metaUrl) {
        if (this.parser) {
            this.parser.disconnect();
        }
        this.parser = new Parser(url, metaUrl);
        var $timeline = $(".codewizards-player .timeline");
        $timeline.removeClass("downloaded");
        this.parser.onDownloaded = function () {
            $timeline.addClass("downloaded");
        }
    }
};