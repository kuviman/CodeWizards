attribute vec2 attr_v;

varying vec2 uv;
uniform mat4 projectionMatrix;

void main() {
    uv = attr_v;
    gl_Position = projectionMatrix * vec4(attr_v.x * float(WORLD_SIZE), 0.0, attr_v.y * float(WORLD_SIZE), 1.0);
}