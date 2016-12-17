function Parser(url, metaUrl) {
    var parser = this;
    if (metaUrl === undefined) {
        metaUrl = url + "-meta";
    }
    this.totalTickCount = 20000;
    this.fps = 60;
    this.tickTime = 1 / this.fps;
    $.get(metaUrl, function (data) {
        var meta = JSON.parse(data);
        parser.totalTickCount = meta.frameCount;
    });
    this.loadedTickCount = 0;
    this.__defineGetter__("progress", function () {
        return this.loadedTickCount / this.totalTickCount;
    });
    this.__defineSetter__("lineChunkSize", function (chunkSize) {
        this.reader.lineChunkSize = chunkSize;
    });
    this.reader = new LineReader(url, function (line) {
        parser.parse(JSON.parse(line));
    });
}
Parser.prototype = {
    constructor: Parser,
    parse: function (json) {
        this.loadedTickCount++;
        var parsers = Parser.parsers;
        for (var i = 0, l = parsers.length; i < l; i++) {
            parsers[i].parse(json);
        }
    },
    disconnect: function () {
        this.reader.disconnect();
    },
    onDownloaded: function (handler) {
        this.reader.onDownloaded(handler);
    }
};
Parser.parsers = [];