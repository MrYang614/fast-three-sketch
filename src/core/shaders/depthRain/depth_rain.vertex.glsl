attribute vec3 pos;
uniform float top;
uniform float bottom;
uniform float time;
uniform mat4 cameraMatrix;
varying float depth;
varying vec2 depthUv;
#include <common>
float angle(float x,float y){
    return atan(y,x);
}
vec2 getFoot(vec2 camera,vec2 _n_pos,vec2 pos){
    vec2 position;
    
    float distanceLen=distance(pos,_n_pos);
    
    float a=angle(camera.x-_n_pos.x,camera.y-_n_pos.y);
    
    pos.x>_n_pos.x?a-=.785:a+=.785;
    
    position.x=cos(a)*distanceLen;
    position.y=sin(a)*distanceLen;
    
    return position+_n_pos;
}

#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main(){
    #include <uv_vertex>
    #include <color_vertex>
    #include <morphinstance_vertex>
    #include <morphcolor_vertex>
    #include <batching_vertex>
    #if defined(USE_ENVMAP)||defined(USE_SKINNING)
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
    #endif
    
    float height=top-bottom;
    
    vec3 _n_pos=vec3(pos.x,pos.y-height/30.,pos.z);
    
    vec2 foot=getFoot(vec2(cameraPosition.x,cameraPosition.z),vec2(_n_pos.x,_n_pos.z),vec2(position.x,position.z));
    float y=_n_pos.y-bottom-height*fract(time);
    y+=y<0.?height:0.;
    
    depth=(1.-y/height);
    
    y+=bottom;
    y+=position.y-_n_pos.y;
    vec3 transformed=vec3(foot.x,y,foot.y);
    vec4 cameraDepth=cameraMatrix*vec4(transformed,1.);
    depthUv=cameraDepth.xy/2.+.5;
    
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
    #include <worldpos_vertex>
    #include <envmap_vertex>
    #include <fog_vertex>
}