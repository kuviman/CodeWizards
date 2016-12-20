attribute vec3 attr_v;
attribute vec3 attr_n;
attribute vec2 attr_uv;

varying vec3 n;
varying vec2 uv;

uniform mat4 projectionMatrix;

uniform vec2 position;
uniform float scale;

void main() {
    n = attr_n;
    uv = vec2(attr_uv.x, 1.0 - attr_uv.y);
    vec3 v = attr_v * scale;
    v.xz += position;
    gl_Position = projectionMatrix * vec4(v, 1.0);
}