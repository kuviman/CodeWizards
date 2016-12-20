function Buildings(player) {
    this.player = player;
    var buildings = this;

    this.models = {};
    StaticModel.load("models/Buildings/Tower.sm", function (model) {
        buildings.models["GUARDIAN_TOWER"] = model;
    });
    StaticModel.load("models/Buildings/Base.sm", function (model) {
        buildings.models["FACTION_BASE"] = model;
    });
    QE.loadTexture("models/Buildings/Texture.png", function (texture) {
        buildings.texture = texture;
    });

    Parser.parsers.push(this);
}

Buildings.prototype = {
    constructor: Buildings,
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
                        this.addBuilding(e.id);
                    } else {
                        this.removeBuilding(e.id);
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
                        this.removeBuilding(e.id);
                    } else {
                        this.addBuilding(e.id);
                    }
                }
            }
            eventsFrame--;
        }
        this.eventsFrame = eventsFrame;
    },
    addBuilding: function (id) {
        this.renderedBuildings[id] = this.jsonById[id];
    },
    removeBuilding: function (id) {
        delete this.renderedBuildings[id];
    },
    render: function (deltaTime) {
        this.goToNeededFrame();

        var gl = QE.glContext;
        QE.useProgram(staticModelProgram);
        gl.uniformMatrix4fv(QE.getUniformLocation(staticModelProgram, "projectionMatrix"), false, this.player.camera.matrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(QE.getUniformLocation(staticModelProgram, "texture"), 0);
        var units = this.renderedBuildings;
        for (var id in units) {
            var unit = units[id];
            var model = this.models[unit.type];
            model.prepare();
            model.render({
                scale: unit.radius,
                position: vec2.fromValues(unit.x, unit.y)
            });
        }
    },
    reset: function () {
        this.currentIds = {};
        this.events = {};
        this.eventsFrame = -1;
        this.jsonById = {};
        this.renderedBuildings = {};
    },
    parse: function (json) {
        var units = json.buildings;
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
                    radius: unit.radius,
                    type: unit.type
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