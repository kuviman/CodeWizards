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
    this.sentLines = false;
    this.linesBuffer = [];
    this.request.onreadystatechange = function () {
        reader.getLines();
    };
    this.request.send();
}
LineReader.prototype = {
    constructor: LineReader,
    getLines: function () {
        if (!this.request) {
            return;
        }
        while (this.linesBuffer.length < this.lineChunkSize && this.lastCheckedPos < this.request.responseText.length) {
            if (this.request.responseText[this.lastCheckedPos] == '\n') {
                var currentLine = this.request.responseText.substr(this.lineStartPos, this.lastCheckedPos - this.lineStartPos);
                this.linesBuffer.push(currentLine);
                this.lineStartPos = this.lastCheckedPos + 1;
            }
            this.lastCheckedPos++;
        }

        if (this.request.readyState == XMLHttpRequest.DONE) {
            if (this.onDownloaded) {
                this.onDownloaded();
                this.onDownloaded = undefined;
            }
            if (this.lastCheckedPos == this.request.responseText.length) {
                this.request.onreadystatechange = undefined;
                this.request = undefined;
            }
        }

        var reader = this;
        if (this.linesBuffer.length > 0 && !this.sentLines) {
            this.sentLines = true;
            setTimeout(function () {
                reader.sendLines();
            }, 0);
        }
    },
    sendLines: function () {
        this.sentLines = false;
        if (this.linesBuffer.length > 0) {
            for (var i = 0, l = this.linesBuffer.length; i < l; i++) {
                if (this.lineHandler) {
                    this.lineHandler(this.linesBuffer[i]);
                }
            }
            this.linesBuffer = [];
            this.getLines();
        }
    },
    disconnect: function () {
        this.onDownloaded = undefined;
        this.lineHandler = undefined;
        if (this.request) {
            this.request.abort();
        }
    }
};