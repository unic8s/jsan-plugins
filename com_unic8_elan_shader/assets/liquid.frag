uniform float time;
uniform int width;
uniform int height;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;

mat2 m(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float map(vec3 p) {
    p.xz *= m(time * 0.4);
    p.xy *= m(time * 0.1);
    vec3 q = p * 2.0 + time;
    return length(p + vec3(sin(time * 0.7))) * log(length(p) + 1.0) + sin(q.x + sin(q.z + sin(q.y))) * 0.5 - 1.0;
}

void main() {
    vec2 iResolution = vec2(width, height);

    vec2 a = gl_FragCoord.xy / iResolution.y - vec2(0.4, 0.8);
    vec3 cl = vec3(0.0);
    float d = 2.5;

    // First Scene
    for (int i = 0; i <= 5; i++) {
        vec3 p = vec3(0, 0, 4.0) + normalize(vec3(a, -1.0)) * d;
        float rz = map(p);
        float f = clamp((rz - map(p + 0.1)) * 0.5, -0.1, 1.0);
        vec3 l = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f;
        cl = cl * l + smoothstep(2.5, 0.0, rz) * 0.6 * l;
        d += min(rz, 1.0);
    }

    // Second Scene (Copied)
    vec2 a2 = gl_FragCoord.xy / iResolution.y - vec2(2.8, 0.8);
    vec3 cl2 = vec3(0.0);
    float d2 = 2.5;

    for (int i = 0; i <= 1; i++) {
        vec3 p2 = vec3(0, 0, 4.0) + normalize(vec3(a2 + vec2(1.0, 0.0), -1.0)) * d2;
        float rz2 = map(p2);
        float f2 = clamp((rz2 - map(p2 + 0.1)) * 0.5, -0.1, 1.0);
        vec3 l2 = vec3(0.1, 0.3, 0.4) + vec3(5.0, 2.5, 3.0) * f2;
        cl2 = cl2 * l2 + smoothstep(2.5, 0.0, rz2) * 0.6 * l2;
        d2 += min(rz2, 1.0);
    }

    gl_FragColor = vec4(cl, alpha);

}