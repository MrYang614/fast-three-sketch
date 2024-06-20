varying float color;

vec4 encodeFloat2RGBA(float v)
{
    vec4 enc=vec4(1.,255.,65025.,16581375.)*v;
    enc=fract(enc);
    enc-=enc.yzww*vec4(1./255.,1./255.,1./255.,0.);
    return enc;
}
void main(){
    gl_FragColor=encodeFloat2RGBA(1.-color);
}
