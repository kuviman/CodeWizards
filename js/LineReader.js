function LineReader(url, lineHandler) {
    var reader = this;
    this.lineChunkSize = 25;
    this.url = url;
    this.lineHandler = lineHandler;
    this.lineStartPos = 0;
    this.lastCheckedPos = 0;
    this.onDownloaded = undefined;
    this.request = new XMLHttpRequest();
    this.request.open("GET", this.url, true);
    this.linesBuffer = [];
    this.updateInterval = 1000;
    this.readLineInterval = 0;
    this.downloaded = false;
    this.aborted = false;
    setTimeout(function () {
        reader.update();
    }, this.updateInterval);
    setTimeout(function () {
        reader.readLines();
    }, this.readLineInterval);
    this.request.send();
}
LineReader.prototype = {
    constructor: LineReader,
    update: function () {
        if (this.aborted) {
            return;
        }
        this.responseText = this.request.responseText;
        if (this.request.readyState == XMLHttpRequest.DONE) {
            if (this.onDownloaded) {
                this.onDownloaded();
                this.downloaded = true;
                delete this.onDownloaded;
            }
            delete this.request;
        } else {
            var reader = this;
            setTimeout(function () {
                reader.update();
            }, this.updateInterval);
        }
    },
    readLines: function () {
        if (this.aborted) {
            return;
        }
        var responseText = this.responseText;
        if (!responseText) {
            var reader = this;
            setTimeout(function () {
                reader.readLines();
            }, this.readLineInterval);
            return;
        }
        while (this.linesBuffer.length < this.lineChunkSize && this.lastCheckedPos < responseText.length) {
            if (responseText[this.lastCheckedPos] == '\n') {
                var currentLine = responseText.substr(this.lineStartPos, this.lastCheckedPos - this.lineStartPos);
                this.linesBuffer.push(currentLine);
                this.lineStartPos = this.lastCheckedPos + 1;
            }
            this.lastCheckedPos++;
        }

        if (this.linesBuffer.length == this.lineChunkSize || this.downloaded) {
            for (var i = 0, l = this.linesBuffer.length; i < l; i++) {
                if (this.lineHandler) {
                    this.lineHandler(this.linesBuffer[i]);
                }
            }
            this.linesBuffer = [];
        }

        if (this.lastCheckedPos != responseText.length || !this.downloaded) {
            var reader = this;
            setTimeout(function () {
                reader.readLines();
            }, this.readLineInterval);
        }
    },
    disconnect: function () {
        this.aborted = true;
        this.onDownloaded = undefined;
        this.lineHandler = undefined;
        if (this.request) {
            this.request.abort();
        }
    }
};