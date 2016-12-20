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
        window.staticModelProgram = program;
    });

    function StaticModel(array) {
        this.count = array.byteLength / StaticModel.BYTES_PER_VERTEX;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
    }

    StaticModel.prototype = {
        constructor: StaticModel,
        prepare: function () {
            QE.useProgram(program);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_v"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_V_OFFSET);
            gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_n"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_N_OFFSET);
            gl.vertexAttribPointer(QE.getAttributeLocation(program, "attr_uv"), 2, gl.FLOAT, false, 32, StaticModel.BYTE_UV_OFFSET);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
        },
        render: function (uniforms) {
            if (uniforms.texture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, uniforms.texture);
                gl.uniform1i(QE.getUniformLocation(program, "texture"), 0);
            }
            gl.uniform1f(QE.getUniformLocation(program, "scale"), uniforms.scale);
            gl.uniform2fv(QE.getUniformLocation(program, "position"), uniforms.position);
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
    StaticModel.FLOATS_PER_VERTEX = 8;
    StaticModel.FLOAT_V_OFFSET = 0;
    StaticModel.FLOAT_N_OFFSET = 3;
    StaticModel.FLOAT_UV_OFFSET = 6;

    StaticModel.BYTES_PER_VERTEX = StaticModel.FLOATS_PER_VERTEX * 4;
    StaticModel.BYTE_V_OFFSET = StaticModel.FLOAT_V_OFFSET * 4;
    StaticModel.BYTE_N_OFFSET = StaticModel.FLOAT_N_OFFSET * 4;
    StaticModel.BYTE_UV_OFFSET = StaticModel.FLOAT_UV_OFFSET * 4;

    window.StaticModel = StaticModel;
}();