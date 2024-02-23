uniform int width;
uniform int height;
uniform float time;
uniform float alpha;

vec3 palette(float t)
{
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.9, 0.416, 0.557);
    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec2 resolution = vec2(width, height);
    vec2 st = gl_FragCoord.xy / resolution.xy * 2.0 - 1.0;
    st.x *= resolution.x / resolution.y;
    vec2 st0 = st;
    vec3 final_color = vec3(0.0);

    for (float i = 0.0; i < 4.0; i++){
        st = fract(st * 1.5) - 0.5;

        float d = length(st) * exp(-length(st0));

        vec3 col = palette(length(st0) + i * .4 + time * .4);

        d = sin(d * 10.0 + time)/10.0;
        d = abs(d);
        
        d = pow(0.01 / d, 1.2);
        final_color += col * d;
    }

    gl_FragColor = vec4(final_color, 1.0);

}