varying float color;

void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    color=gl_Position.z/2.+.5;
}
