import * as THREE from "three";
import { FontLoader, GLTFLoader, KTX2Loader, OBJLoader, RGBELoader } from "three-stdlib";
import { loadVideoTexture } from "../utils";
/**
 * This class can handle the preloads of assets (gltf, texture, cubeTexture, font, etc). You can just write a simple js file to config your assets without caring about various loaders.
 *
 * Demo: https://kokomi-js.vercel.app/examples/#assetManager
 */
export class AssetManager {

    resourceList;
    items;
    toLoad;
    loaded;
    loaders;
    constructor(list) {

        this.resourceList = list;
        this.items = {};
        this.toLoad = list.length;
        this.loaded = 0;
        this.loaders = {};
        this.setLoaders();
        this.startLoading();
    }
    // 设置加载器
    setLoaders() {
        this.loaders.gltfLoader = new GLTFLoader();
        this.loaders.textureLoader = new THREE.TextureLoader();
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader();
        this.loaders.fontLoader = new FontLoader();
        // @ts-ignore
        this.loaders.audioLoader = new THREE.AudioLoader();
        this.loaders.objLoader = new OBJLoader();
        this.loaders.hdrTextureLoader = new RGBELoader();
        this.loaders.ktx2Loader = new KTX2Loader();
    }

    // 开始加载
    startLoading() {

        const resourceList = this.resourceList

        for (let i = 0, l = resourceList.length; i < l; i++) {

            const resource = resourceList[i];
            const { path, type } = resource

            if (type === "gltf") {
                this.loaders.gltfLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "texture") {
                this.loaders.textureLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "cubeTexture") {
                this.loaders.cubeTextureLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "font") {
                this.loaders.fontLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "audio") {
                this.loaders.audioLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "objModel") {
                this.loaders.objLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "hdrTexture") {
                this.loaders.hdrTextureLoader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "video") {
                loadVideoTexture(path).then((file) => {
                    this.resourceLoaded(resource, file);
                });
            } else if (type === "ktx2Texture") {
                this.loaders.ktx2Loader.load(path, (file) => {
                    this.resourceLoaded(resource, file);
                });
            }
        }
    }
    // 加载完单个素材
    resourceLoaded(resource, file) {
        this.items[resource.name] = file;
        this.loaded += 1;
        if (this.isLoaded) {
            this.emit("ready");
        }
    }
    // 加载进度
    get loadProgress() {
        return this.loaded / this.toLoad;
    }
    // 是否加载完毕
    get isLoaded() {
        return this.loaded === this.toLoad;
    }
}
