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
        trees.jsonsByType = [];
        for (var i = 0; i < trees.textures.length; i++) {
            trees.buffers[i] = gl.createBuffer();
            trees.jsonsByType[i] = [];
            gl.bindBuffer(gl.ARRAY_BUFFER, trees.buffers[i]);
            gl.bufferData(gl.ARRAY_BUFFER, trees.modelData.byteLength * Settings.MAX_TREE_COUNT, gl.STATIC_DRAW);
        }
    });

    Parser.parsers.push(this);
}

Trees.prototype = {
    constructor: Trees,
    goToNeededFrame: function () {
        var needFrame = this.player.currentFrame;
        var events = this.events;
        var eventsFrame = this.eventsFrame;
        while (eventsFrame < needFrame) {
            eventsFrame++;
            var es = events[eventsFrame];
            if (es) {
                for (var i = 0, l = es.length; i < l; i++) {
                    var e = es[i];
                    if (e.type === +1) {
                        this.addTree(e.id);
                    } else {
                        this.removeTree(e.id);
                    }
                }
            }
        }
        while (eventsFrame > needFrame) {
            var es = events[eventsFrame];
            if (es) {
                for (var i = 0, l = es.length; i < l; i++) {
                    var e = es[i];
                    if (e.type === +1) {
                        this.removeTree(e.id);
                    } else {
                        this.addTree(e.id, e.json);
                    }
                }
            }
            eventsFrame--;
        }
        this.eventsFrame = eventsFrame;
    },
    render: function (deltaTime) {
        this.goToNeededFrame();

        var gl = QE.glContext;
        QE.useProgram(this.program);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.uniformMatrix4fv(QE.getUniformLocation(this.program, "projectionMatrix"), false, this.player.camera.matrix);
        gl.uniform1i(QE.getUniformLocation(this.program, "texture"), 0);
        gl.activeTexture(gl.TEXTURE0);
        for (var i = 0; i < this.textures.length; i++) {
            var count = this.jsonsByType[i].length;
            if (count != 0) {
                gl.bindTexture(gl.TEXTURE_2D, this.textures[i]);
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[i]);
                gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_v"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_V_OFFSET);
                gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_n"), 3, gl.FLOAT, false, 32, StaticModel.BYTE_N_OFFSET);
                gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_uv"), 2, gl.FLOAT, false, 32, StaticModel.BYTE_UV_OFFSET);
                gl.drawArrays(gl.TRIANGLES, 0, this.modelVertexCount * count);
            }
        }
    },
    addTree: function (id) {
        var json = this.jsonById[id];
        if (!json.treeTexture) {
            json.treeTexture = Math.floor(Math.random() * this.textures.length);
        }
        var array = this.jsonsByType[json.treeTexture];
        if (array.length >= Settings.MAX_TREE_COUNT) {
            throw new Error("Max tree count exceeded");
        }
        json.indexOfType = array.length;
        array.push(json);
        this.updateInBuffer(json);
    },
    removeTree: function (id) {
        var json = this.jsonById[id];
        var array = this.jsonsByType[json.treeTexture];
        if (json.indexOfType != array.length - 1) {
            var otherJson = array[array.length - 1];
            otherJson.indexOfType = json.indexOfType;
            array[json.indexOfType] = otherJson;
            this.updateInBuffer(otherJson);
        }
        array.pop();
    },
    updateInBuffer: function (json) {
        var x = json.x;
        var y = json.y;
        var radius = json.radius;

        var data = new Float32Array(this.modelData);
        var offset = StaticModel.FLOAT_V_OFFSET;
        for (var i = 0; i < this.modelVertexCount; i++) {
            data[offset] = data[offset] * radius + x;
            data[offset + 1] *= radius;
            data[offset + 2] = data[offset + 2] * radius + y;
            offset += StaticModel.FLOATS_PER_VERTEX;
        }

        var gl = QE.glContext;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[json.treeTexture]);
        gl.bufferSubData(gl.ARRAY_BUFFER, json.indexOfType * data.byteLength, data);
    },
    reset: function () {
        this.currentIds = {};
        this.events = {};
        this.eventsFrame = -1;
        this.jsonById = {};
        if (this.jsonsByType) {
            for (var i = 0; i < this.jsonsByType.length; i++) {
                this.jsonsByType[i] = [];
            }
        }
    },
    parse: function (json) {
        var units = json.trees;
        if (!units) {
            return;
        }
        var currentIds = this.currentIds;
        var newEvents = [];
        for (var i = 0, l = units.length; i < l; i++) {
            var unit = units[i];
            var id = unit.id;
            if (currentIds[id]) {
                delete currentIds[id];
            } else {
                this.jsonById[id] = {
                    x: unit.x,
                    y: unit.y,
                    radius: unit.radius
                };
                newEvents.push({
                    type: +1,
                    id: id
                });
            }
        }
        for (var id in currentIds) {
            newEvents.push({
                type: -1,
                id: id
            });
        }
        currentIds = {};
        for (var i = 0, l = units.length; i < l; i++) {
            currentIds[units[i].id] = true;
        }
        this.currentIds = currentIds;
        if (newEvents.length != 0) {
            this.events[json.tickIndex] = newEvents;
        }
    }
};