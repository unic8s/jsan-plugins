uniform int width;
uniform int height;
uniform float time;
uniform float alpha;

void main()
{
    vec2 resolution = vec2(width, height);
	vec2 p = -1.0 + 2.0 * gl_FragCoord.xy / resolution.xy;
	float cosTimeElapsed = cos(time * 0.5);
	float sinTimeElapsed = 10.0 * (sin(time * 0.33));
	float x = p.x;
	float y = p.y;
	float Value1 = 2.0 * 3.14 * 0.33;
	float Value2 = 2.0 * Value1;
	float TempY =(0.5 + y * 7.0);
	float cy = TempY + 10.0 * cosTimeElapsed;
	float TempX = (0.5 + x * 7.0);
	float cx = TempX + sinTimeElapsed;
	float Value = sin(TempY + time) + sin((TempX + time) * 0.5) + sin((TempX + TempY + time) * 0.5) + ((sin(sqrt(cx * cx + cy * cy + 1.0) + time)) * 0.5) * 3.14;
	float c1 = sin(Value) * 0.5 + 0.5;
	float c2 = sin(Value + Value1) * 0.5 + 0.5;
	float c3 = sin(Value + Value2) * 0.5 + 0.5;
	gl_FragColor = vec4(c1, c2, c3, alpha);
}