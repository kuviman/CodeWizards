#define REPEAT 16

varying vec2 uv;
uniform sampler2D grass;
uniform sampler2D dirt;
uniform sampler2D stone;
uniform sampler2D roadmap;

void main() {
    vec4 c = texture2D(roadmap, uv);
    float kGrass = c.z;
    float kDirt = c.x;
    float kStone = c.y;
    gl_FragColor = 1.0 / (kGrass + kDirt + kStone) * (
        texture2D(grass, uv * float(REPEAT)) * kGrass +
        texture2D(dirt, uv * float(REPEAT)) * kDirt +
        texture2D(stone, uv * float(REPEAT)) * kStone);
}