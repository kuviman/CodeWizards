var StaticModel;

if (QE.initialized) new function () {
    var gl = QE.glContext;

    var vertexShader, fragmentShader;
    QE.loadText("glsl/vertex/static_model.glsl", function (shader) {
        vertexShader = shader;
    });
    QE.loadText("glsl/fragment/static_model.glsl", function (shader) {
        fragmentShader = shader;
    });

    var program;
    QE.onResourcesLoaded.push(function () {
        program = QE.shaderProgram(vertexShader, fragmentShader);
    });

    function StaticModel(array) {
        this.count = array.byteLength / 32;
        // array = new Float32Array(array);
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    }

    StaticModel.prototype = {
        constructor: StaticModel,
        render: function (texture) {
            QE.useProgram(program);
            if (program.preparedModel !== this) {
                gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_v"), 3, gl.FLOAT, false, 32, 0);
                gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_n"), 3, gl.FLOAT, false, 32, 12);
                gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_uv"), 2, gl.FLOAT, false, 32, 24);
                program.preparedModel = this;
            }

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(QE.getUniformLocation(program, "texture"), 0);

            var cameraMatrix = mat4.perspective(mat4.create(), Math.PI / 2, QE.canvas.width / QE.canvas.height, 0.1, 5000);
            mat4.multiply(cameraMatrix, cameraMatrix, mat4.lookAt(mat4.create(), vec3.fromValues(1, 2, -1), vec3.create(), vec3.fromValues(0, 1, 0)));
            gl.uniformMatrix4fv(QE.getUniformLocation(program, "projectionMatrix"), false, cameraMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, this.count);
        }
    };
    StaticModel.load = function (url, onLoaded) {
        QE.loadBinary(url, function (data) {
            var model = new StaticModel(data);
            if (onLoaded) {
                onLoaded(model);
            }
        });
    };
    window.StaticModel = StaticModel;
}();