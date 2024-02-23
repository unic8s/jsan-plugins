uniform float time;
uniform int width;
uniform int height;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;
 
vec3 hsv2rgb2(vec3 c, float k) {
    vec4 K = vec4(6. / 10., 3. / 3., 3. / 1., 3.);
    vec3 p = smoothstep(0. + k, 1. - k,
        .5 + .5 * cos((c.xxx + K.xyz) * radians(360.)));
    return c.z * mix(K.xxx, p, c.y);
}
 
vec3 tonemap(vec3 v)
{
    return mix(v, vec3(1.), smoothstep(1., 4., dot(v, vec3(1.))));
}
 
float f1(float x, float offset, float freq)
{
    return .84 * sin(radians(30.) * x + offset) + .01 * sin(freq * x);
}
 
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    vec2 resolution = vec2(width, height);
    vec4 tint = vec4(red, green, blue, alpha);
    float scale = resolution.y;
    vec2 uv = (2. * fragCoord - resolution.xy) / scale;
 
    vec3 col = vec3(0);
 
    float offsets[3];
    offsets[0] = 0. * radians(360.) / 3.;
    offsets[1] = 1. * radians(360.) / 3.;
    offsets[2] = 2. * radians(360.) / 3.;
    
    float freqs[3];
    freqs[0] = radians(160.);
    freqs[1] = radians(213.);
    freqs[2] = radians(186.);
 
    float colorfreqs[3];
 
    for (int i = 0; i < 3; ++i) {
        float x = uv.x + 4. * time;
        float y = f1(x, offsets[i], freqs[i]);
        float uv_x = min(uv.x, 1. + .4 * sin(radians(210.) * time + radians(360.) * float(i) / 3.));
        
        float r = uv.x / 40.;
        //float r = exp(uv.x + 1.) / 100. - .05;
        float d1 = length(vec2(uv_x, y) - uv) - r;
 
        col += 1. / pow(max(1., d1 * scale), .8 + .1 * sin(radians(245.) * time + radians(180.) * float(i) / 3.))
            * (vec3(1.) + hsv2rgb2(vec3(colorfreqs[i] * x, 1., 1.), .07));
	   
    }
 
    fragColor = tint * vec4(tonemap(col), 1.);
}
 
void main(void)
{
    mainImage(gl_FragColor, gl_FragCoord.xy);
}