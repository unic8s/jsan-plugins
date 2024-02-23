uniform float time;
uniform int width;
uniform int height;
uniform float red;
uniform float green;
uniform float blue;
uniform float alpha;


precision highp float;

float hash( float n ) { return fract(sin(n)*753.5453123); }
vec4 noised( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);

    float n = p.x + p.y*157.0 + 113.0*p.z;

    float a = hash(n+  0.0);
    float b = hash(n+  1.0);
    float c = hash(n+157.0);
    float d = hash(n+158.0);
    float e = hash(n+113.0);
     float f = hash(n+114.0);
    float g = hash(n+270.0);
    float h = hash(n+271.0);

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return vec4( k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z,
                 du * (vec3(k1,k2,k3) + u.yzx*vec3(k4,k5,k6) + u.zxy*vec3(k6,k4,k5) + k7*u.yzx*u.zxy ));
}
vec4 fbmd( in vec3 x )
{
    const float scale = 1.6;

    float a = 0.0;
    float b = 0.5;
    float f = 1.0;
    vec3  d = vec3(0.0);
    for( int i=0; i<4; i++ )
    {
        vec4 n = noised(f*x*scale);
        a += b*n.x;           // accumulate values
        d += b*n.yzw*f*scale; // accumulate derivatives
        b *= 0.6;             // amplitude decrease
        f *= 1.8;             // frequency increase
    }

  return vec4( a, d );
}

// http://iquilezles.org/www/articles/smin/smin.htm
float smin( float a, float b, float k )
{
  float h = max(k-abs(a-b),0.0);
  return min(a, b) - h*h*0.25/k;
}

// http://iquilezles.org/www/articles/smin/smin.htm
float smax( float a, float b, float k )
{
  float h = clamp( 0.5 + 0.5*(b-a)/k, 0.0, 1.0 );
  return mix( a, b, h ) + k*h*(1.0-h);
}

vec2 rotate(vec2 v, float a) {
	float s = sin(a);
	float c = cos(a);
	mat2 m = mat2(c, -s, s, c);
	return m * v;
}

float map2( in vec3 p )
{
  vec4 d1 = fbmd( p * .1);
  d1.x -= 0.3;
  d1.x *= 4.;
  d1.yzw = normalize(d1.yzw);
  // clip to box
  return d1.x;
}

float box(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0));
}

float map(vec3 p) {
  float d = map2(p+vec3(sin(time * 0.12)*20.0,-time * 0.5,time * 3.0));
  d = smax(d, -box(p,vec3(12,1000,0.1)), 1.8);
  d = smin(d, p.y+5., 2.);
  return d;
}

vec3 evaluateLight(in vec3 pos) {
  float L = length(pos.xz-vec2(0,50))+2.;
  return (3000.0*vec3(.68, .97, 1.)) * (1./L/L+0.0018);
}

void main() {
  vec2 resolution = vec2(width, height);
  vec2 p = (gl_FragCoord.xy*2. - resolution.xy) / max(resolution.x, resolution.y);
  p = rotate(p, cos(time*0.12+0.5) * 0.3);
  p /= 1. - length(p) * 0.5;

  vec3 cPos = vec3(0);
  vec3 cDir = vec3(0,0,1);
  vec3 cUp = vec3(0,1,0);
  vec3 cSide = cross(cUp, cDir);

  vec3 ray = normalize(cSide * p.x + cUp * p.y + cDir);

  vec3 color = vec3(0);
  float depth=0.;
  vec3 pos = vec3(0);
  float d = 0.0;
  for(int i=0; i<99;++i)
  {
    pos = cPos + ray * depth;
    d = map(pos);
    color += 0.0007 * evaluateLight(pos) * d;

    if(d<0.001 || depth > 60.) break; // give back a lot of performance without too much visual loss
    depth += d;
  }
  color = pow(color, vec3(1.0/1.8));

  gl_FragColor = vec4(color ,1.0);
}
