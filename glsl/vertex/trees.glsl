attribute vec3 attr_v;
attribute vec3 attr_n;
attribute vec2 attr_uv;

varying vec3 n;
varying vec2 uv;

uniform mat4 projectionMatrix;

void main() {
    n = attr_n;
    uv = vec2(attr_uv.x, 1.0 - attr_uv.y);
    gl_Position = projectionMatrix * vec4(attr_v, 1.0);
}