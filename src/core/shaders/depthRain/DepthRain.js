import * as THREE from "three";
import { SketchBase } from "fast-three-sketch";
import vertexShader from "./depth_rain.vertex.glsl?raw";
import fragmentShader from "./depth_rain.fragment.glsl?raw";
import override_vertexShader from "./depth_rain_override.vertex.glsl?raw";
import override_fragmentShader from "./depth_rain_override.fragment.glsl?raw";

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

        const box = this.box;
        const parameters = this.defaultParameters;

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

        const box = this.box;
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