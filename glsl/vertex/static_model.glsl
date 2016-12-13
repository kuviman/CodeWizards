attribute vec3 attr_v;
attribute vec3 attr_n;
attribute vec2 attr_uv;

void main() {
    gl_Position = vec4(attr_v, 1.0);
}