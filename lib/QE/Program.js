if (QE.initialized) new function () {
    var gl = QE.glContext;

    function shaderProgram(vertexShader, fragmentShader) {
        var vs = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vs, vertexShader);
        gl.compileShader(vs);
        if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
            throw new QException(gl.getShaderInfoLog(vs));
        }

        var fs = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fs, fragmentShader);
        gl.compileShader(fs);
        if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
            throw new QException(gl.getShaderInfoLog(fs));
        }

        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new QException(gl.getProgramInfoLog(program));
        }

        program.attributes = {};
        return program;
    }

    QE.getAttributeLocation = function (program, name) {
        var attributes = program.attributes;
        var result = attributes[name];
        if (result !== undefined) {
            return result;
        }
        result = attributes[name] = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(result);
        return result;
    };

    QE.useProgram = function (program) {
        if (QE.currentProgram !== program) {
            gl.useProgram(program);
            QE.currentProgram = program;
        }
    };

    QE.shaderProgram = shaderProgram;
}();