function Parser(url, metaUrl) {
    var parser = this;
    if (metaUrl === undefined) {
        metaUrl = url + "-meta";
    }
    this.totalTickCount = 20000;
    this.fps = 60;
    this.__defineGetter__("tickTime", function () {
        return 1 / this.fps;
    });
    $.get(metaUrl, function (data) {
        var meta = JSON.parse(data);
        parser.totalTickCount = meta.frameCount;
    });
    this.frames = [];
    this.__defineGetter__("loadedTickCount", function () {
        return this.frames.length;
    });
    this.__defineGetter__("progress", function () {
        return this.loadedTickCount / this.totalTickCount;
    });
    this.__defineSetter__("onDownloaded", function (handler) {
        this.reader.onDownloaded = handler;
    });
    this.reader = new LineReader(url, function (line) {
        parser.parse(JSON.parse(line));
    });
}
Parser.prototype = {
    constructor: Parser,
    parse: function (json) {
        var world = {};
        this.frames.push(world);
    },
    disconnect: function () {
        this.reader.disconnect();
    }
};