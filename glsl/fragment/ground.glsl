#define REPEAT 16

varying vec2 uv;
uniform sampler2D grass;
uniform sampler2D dirt;
uniform sampler2D roadmap;

void main() {
    float noroad = texture2D(roadmap, uv).x;
    vec4 g = texture2D(grass, uv * float(REPEAT));
    vec4 d = texture2D(dirt, uv * float(REPEAT));
    gl_FragColor = noroad * g + (1.0 - noroad) * d;
}