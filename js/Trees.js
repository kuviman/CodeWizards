Settings.MAX_TREE_COUNT = 1000;

function Trees(player) {
    this.player = player;
    var trees = this;

    QE.loadBinary("models/PineTree/PineTree.sm", function (data) {
        trees.modelData = new Float32Array(data);
        trees.modelVertexCount = trees.modelData.length / StaticModel.FLOATS_PER_VERTEX;
    });

    this.textures = [];
    QE.loadTexture("models/PineTree/PineTree_1.png", function (texture) {
        trees.textures.push(texture);
    });
    QE.loadTexture("models/PineTree/PineTree_2.png", function (texture) {
        trees.textures.push(texture);
    });
    QE.loadTexture("models/PineTree/PineTree_3.png", function (texture) {
        trees.textures.push(texture);
    });

    var vertexShader, fragmentShader;
    QE.loadText("glsl/vertex/trees.glsl", function (source) {
        vertexShader = source;
    });
    QE.loadText("glsl/fragment/trees.glsl", function (source) {
        fragmentShader = source;
    });

    QE.onResourcesLoaded.push(function () {
        var gl = QE.glContext;
        trees.program = QE.shaderProgram(vertexShader, fragmentShader);

        trees.buffers = [];
        for (var i = 0; i < trees.textures.length; i++) {
            trees.buffers[i] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, trees.buffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, trees.modelData.byteLength * Settings.MAX_TREE_COUNT, gl.STATIC_DRAW);
        }
        trees.treeCounts = new Array(trees.textures.length);
        trees.treeCounts.fill(0);
        for (var i = 0; i < 1000; i++) {
            trees.addTree({
                x: Math.random() * Settings.WORLD_SIZE,
                y: Math.random() * Settings.WORLD_SIZE,
                radius: Math.random() * 20 + 40
            });
        }
    });
}

Trees.prototype = {
    constructor: Trees,
    render: function (deltaTime) {
        var gl = QE.glContext;
        QE.useProgram(this.program);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.uniformMatrix4fv(QE.getUniformLocation(this.program, "projectionMatrix"), false, this.player.camera.matrix);
        gl.uniform1i(QE.getUniformLocation(this.program, "texture"), 0);
        gl.activeTexture(gl.TEXTURE0);
        for (var i = 0; i < this.textures.length; i++) {
            gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i]);
            gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_v"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_V_OFFSET);
            gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_n"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_N_OFFSET);
            gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_uv"), 2, gl.FLOAT, false, 32, StaticModel.BYTE_UV_OFFSET);
            if (this.treeCounts[i] != 0) {
                gl.drawArrays(gl.TRIANGLES, 0, this.modelVertexCount * this.treeCounts[i]);
            }
        }
    },
    addTree: function (json) {
        if (!json.treeTexture) {
            json.treeTexture = Math.floor(Math.random() * this.textures.length);
        }
        if (this.treeCounts[json.treeTexture] >= Settings.MAX_TREE_COUNT) {
            throw new Error("Max tree count exceeded");
        }
        var data = new Float32Array(this.modelData);

        var x = json.x;
        var y = json.y;
        var radius = json.radius;

        var offset = StaticModel.FLOAT_V_OFFSET;
        for (var i = 0; i < this.modelVertexCount; i++) {
            data[offset] = data[offset] * radius + x;
            data[offset + 1] *= radius;
            data[offset + 2] = data[offset + 2] * radius + y;
            offset += StaticModel.FLOATS_PER_VERTEX;
        }

        var gl = QE.glContext;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[json.treeTexture]);
        gl.bufferSubData(gl.ARRAY_BUFFER, this.treeCounts[json.treeTexture] * data.byteLength, data);
        this.treeCounts[json.treeTexture]++;
    }
};