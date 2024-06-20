import * as THREE from "three";

const vertexShader = `
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
`
const fragmentShader = `
uniform vec3 diffuse;

uniform sampler2D tDepth;
uniform float opacity;
varying float depth;
varying vec2 depthUv;

float decodeRGBA2Float(vec4 rgba)
{
    return dot(rgba,vec4(1.,1./255.,1./65025.,1./16581375.));
}

#ifndef FLAT_SHADED
varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main(){
    
    if(1.-depth<decodeRGBA2Float(texture2D(tDepth,depthUv)))discard;
    vec4 diffuseColor=vec4(diffuse,opacity);
    
    #include <clipping_planes_fragment>
    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <alphahash_fragment>
    #include <specularmap_fragment>
    ReflectedLight reflectedLight=ReflectedLight(vec3(0.),vec3(0.),vec3(0.),vec3(0.));
    #ifdef USE_LIGHTMAP
    vec4 lightMapTexel=texture2D(lightMap,vLightMapUv);
    reflectedLight.indirectDiffuse+=lightMapTexel.rgb*lightMapIntensity*RECIPROCAL_PI;
    #else
    reflectedLight.indirectDiffuse+=vec3(1.);
    #endif
    #include <aomap_fragment>
    reflectedLight.indirectDiffuse*=diffuseColor.rgb;
    vec3 outgoingLight=reflectedLight.indirectDiffuse;
    #include <envmap_fragment>
    #include <opaque_fragment>
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>
}
`
const override_vertexShader = `
varying float color;

void main(){
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    color=gl_Position.z/2.+.5;
}

`
const override_fragmentShader = `
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

`

export class DepthRain extends THREE.Mesh {

    #_depthScene = new THREE.Scene();
    #_orthCamera = new THREE.OrthographicCamera();

    #_target

    #_uniforms

    #_box = new THREE.Box3(
        new THREE.Vector3(-100, 0, -100),
        new THREE.Vector3(100, 100, 100)
    );

    #_defaultParameters = {
        count: 8000,
        size: 1,
        speed: 1
    };

    constructor(box, depthRainParameters) {

        super();

        if (box) {
            this.#_box.copy(box);
        }

        if (depthRainParameters) {
            const defaultParameters = this.#_defaultParameters;
            defaultParameters.count = depthRainParameters.count || defaultParameters.count;
            defaultParameters.speed = depthRainParameters.speed || defaultParameters.speed;
            defaultParameters.size = depthRainParameters.size || defaultParameters.size;
        }

        this.#_createRain();
        this.#_createDepth();
    }

    #_createRain() {

        const box = this.#_box;
        const parameters = this.#_defaultParameters;

        const material = this.material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            depthWrite: false,
        });

        material.onBeforeCompile = (shader) => {

            shader.vertexShader = vertexShader;
            shader.fragmentShader = fragmentShader;
            shader.uniforms.cameraPosition = {
                value: new THREE.Vector3()
            };
            shader.uniforms.top = {
                value: box.max.y
            };
            shader.uniforms.bottom = {
                value: box.min.y
            };
            shader.uniforms.time = {
                value: 0
            };

            shader.uniforms.cameraMatrix = {
                value: new THREE.Matrix4()
            };
            shader.uniforms.tDepth = {
                value: null
            };

            this.#_uniforms = shader.uniforms;

        };

        const geometry = this.geometry;

        const vertices = [];
        const poses = [];
        const uvs = [];
        const indices = [];

        for (let i = 0; i < parameters.count; i++) {
            const pos = new THREE.Vector3();
            pos.x = Math.random() * (box.max.x - box.min.x) + box.min.x;
            pos.y = Math.random() * (box.max.y - box.min.y) + box.min.y;
            pos.z = Math.random() * (box.max.z - box.min.z) + box.min.z;

            const height = parameters.size * (box.max.y - box.min.y) / 20;
            const width = height / 50;

            vertices.push(
                pos.x + width,
                pos.y + height,
                pos.z,
                pos.x - width,
                pos.y + height,
                pos.z,
                pos.x - width,
                pos.y,
                pos.z,
                pos.x + width,
                pos.y,
                pos.z
            );

            poses.push(
                pos.x,
                pos.y,
                pos.z,
                pos.x,
                pos.y,
                pos.z,
                pos.x,
                pos.y,
                pos.z,
                pos.x,
                pos.y,
                pos.z
            );

            uvs.push(1, 1, 0, 1, 0, 0, 1, 0);

            indices.push(
                i * 4 + 0,
                i * 4 + 1,
                i * 4 + 2,
                i * 4 + 0,
                i * 4 + 2,
                i * 4 + 3
            );
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array(vertices), 3)
        );
        geometry.setAttribute(
            "pos",
            new THREE.BufferAttribute(new Float32Array(poses), 3)
        );
        geometry.setAttribute(
            "uv",
            new THREE.BufferAttribute(new Float32Array(uvs), 2)
        );
        geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));

    }

    #_createDepth(width = 256, height = 256) {

        const box = this.#_box;
        const _target = this.#_target = new THREE.WebGLRenderTarget(width, height);

        _target.texture.format = THREE.RGBFormat;
        _target.texture.minFilter = THREE.NearestFilter;
        _target.texture.magFilter = THREE.NearestFilter;
        _target.texture.generateMipmaps = false;

        const _orthCamera = this.#_orthCamera;
        const center = new THREE.Vector3();
        box.getCenter(center);

        _orthCamera.left = box.min.x - center.x;
        _orthCamera.right = box.max.x - center.x;
        _orthCamera.top = box.max.z - center.z;
        _orthCamera.bottom = box.min.z - center.z;
        _orthCamera.near = .1;
        _orthCamera.far = box.max.y - box.min.y;

        _orthCamera.position.copy(center);
        _orthCamera.position.y += box.max.y - center.y;
        _orthCamera.lookAt(center);

        _orthCamera.updateProjectionMatrix();
        _orthCamera.updateWorldMatrix(true, true);

        const _depthScene = this.#_depthScene;

        _depthScene.overrideMaterial = new THREE.ShaderMaterial({
            vertexShader: override_vertexShader,
            fragmentShader: override_fragmentShader,
        });

    }

    addObject(...args) {

        const depthChildren = this.#_depthScene.children;

        args.forEach(obj => {

            if (depthChildren.indexOf(obj) === -1) {

                this.#_depthScene.children.push(obj);

            }

        });

    }

    removeObject(object) {

        const depthChildren = this.#_depthScene.children;

        for (let i = 0; i < depthChildren.length; i++) {

            if (depthChildren[i] === object) {

                depthChildren.splice(i, 1);
                return;

            }
        }

    }

    render = (sketch) => {

        const { renderer, camera } = sketch;
        const time = sketch.getElapsedTime();

        const _uniforms = this.#_uniforms;

        if (_uniforms) {

            const _orthCamera = this.#_orthCamera
            const _depthScene = this.#_depthScene
            const _target = this.#_target

            _uniforms.cameraPosition.value = camera.position;
            _uniforms.time.value = time;

            _uniforms.cameraMatrix.value = new THREE.Matrix4().multiplyMatrices(
                _orthCamera.projectionMatrix,
                _orthCamera.matrixWorldInverse
            );

            renderer.setRenderTarget(_target);
            renderer.render(_depthScene, _orthCamera);
            renderer.setRenderTarget(null);
            _uniforms.tDepth.value = _target.texture;
        }

    };
}