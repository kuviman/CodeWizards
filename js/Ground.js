function Ground(player) {
    this.player = player;
    var ground = this;

    var vertexShader, fragmentShader;
    QE.loadText("glsl/vertex/ground.glsl", function (source) {
        vertexShader = "#define WORLD_SIZE " + Settings.WORLD_SIZE.toString() + "\n" + source;
    });
    QE.loadText("glsl/fragment/ground.glsl", function (source) {
        fragmentShader = source;
    });

    QE.loadTexture("textures/dirt.png", function (texture) {
        ground.dirtTexture = texture;
    });
    QE.loadTexture("textures/grass.png", function (texture) {
        ground.grassTexture = texture;
    });
    QE.loadTexture("textures/stone.png", function (texture) {
        ground.stoneTexture = texture;
    });
    QE.loadTexture("textures/roadmap.png", function (texture) {
        ground.roadmapTexture = texture;
    });

    var gl = QE.glContext;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 1, 1, 0]), gl.STATIC_DRAW);

    QE.onResourcesLoaded.push(function () {
        ground.program = QE.shaderProgram(vertexShader, fragmentShader);
    });
}

Ground.prototype = {
    constructor: Ground,
    render: function (deltaTime) {
        var gl = QE.glContext;
        gl.disable(gl.CULL_FACE);
        QE.useProgram(this.program);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(QE.getAttributeLocation(this.program, "attr_v"), 2, gl.FLOAT, false, 8, 0);
        gl.uniformMatrix4fv(QE.getUniformLocation(this.program, "projectionMatrix"), false, this.player.camera.matrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.grassTexture);
        gl.uniform1i(QE.getUniformLocation(this.program, "grass"), 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.dirtTexture);
        gl.uniform1i(QE.getUniformLocation(this.program, "dirt"), 1);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.stoneTexture);
        gl.uniform1i(QE.getUniformLocation(this.program, "stone"), 2);
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.roadmapTexture);
        gl.uniform1i(QE.getUniformLocation(this.program, "roadmap"), 3);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    },
    reset: function () {
        // Nothing to do
    }
};