varying vec3 n;
varying vec2 uv;
uniform sampler2D texture;

void main() {
    vec4 rgba = texture2D(texture, uv);
    if (rgba.w < 0.5) {
        discard;
    }
    rgba.w = 1.0;//(rgba.w - 0.5) * 2.0;
    float light = max(0.0, dot(n, normalize(vec3(1, 1, 2))));
    light += 0.2;
    light = min(light, 1.0);
    gl_FragColor = vec4(rgba.xyz * light, rgba.w);
}