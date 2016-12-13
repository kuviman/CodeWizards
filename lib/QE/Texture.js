if (QE.initialized) new function () {
    var gl = QE.glContext;

    var imgs = [];

    function loadTexture(url, onLoaded) {
        var res = new QE.Resource();
        var image = new Image();
        image.src = url;
        image.onload = function () {
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.bindTexture(gl.TEXTURE_2D, null);
            res.confirmLoaded();
            if (onLoaded) {
                onLoaded(texture);
            }
        };
        imgs.push(image);
    }

    QE.loadTexture = loadTexture;
}();