if (QE.initialized) new function () {
    var gl = QE.glContext;

    function Model() {
        this.attributes = {};
        this.elementCount = undefined;
    }

    Model.prototype = {
        constructor: Model,
        addAttribute: function (name, type, array, elementArray) {
            var size;
            var stride = 0; // Is it needed? calculate then
            if (type == vec3) {
                size = 3;
                type = gl.FLOAT;
                array = new Float32Array(array);
            } else {
                throw new QException("Unexpected attribute type");
            }

            this.elementCount = elementArray.length;
            elementArray = new Int32Array(elementArray);

            var arrayBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);

            var elementArrayBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementArrayBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementArray, gl.STATIC_DRAW);

            this.attributes[name] = {
                array: arrayBuffer,
                elementArray: elementArrayBuffer,
                size: size,
                type: type,
                stride: stride
            };
        },
        prepare: function (program) {
            var attributes = this.attributes;
            for (var name in attributes) {
                var attribute = attributes[name];
                var location = program.attributes[name];
                if (location === undefined) {
                    location = gl.getAttribLocation(program, name);
                    gl.enableVertexAttribArray(location);
                }
                gl.vertexAttribPointer(location, attribute.size, attribute.type, false, attribute.stride, 0);
            }
        },
        render: function () {

        }
    };
    Model.load = function (url, onLoad) {
        QE.loadText(url, function (data) {
            var json = JSON.parse(data);
            var model = new Model();
            model.addAttribute("attr_pos", json.v, json.f_v);
        });
    };
    QE.Model = Model;
}();