import { GLTFLoader, DRACOLoader } from "three-stdlib";
import { LoadingManager } from "three";

let dracoLoader = null

function onload() {

    if (dracoLoader) {

        dracoLoader.dispose()
        dracoLoader = null

    }

    console.log("All Loaded!");
}

/**
 * 
 * @param {string} url 
 * @param {number} loaded 
 * @param {number} total 
 */
function onprogress(url, loaded, total) {

    console.log(`Loading ${url} : ${(loaded * 100 / total).toFixed(2)}%`)

}

/**
 * @param {string} url 
 */
function onerror(url) {

    console.log(`Error loading ${url}`);

}

const loadingManager = new LoadingManager(onload, onprogress, onerror);

export function loadGLTF(path, useDraco = false) {

    return new Promise((resolve) => {

        const loader = new GLTFLoader(loadingManager);

        if (useDraco) {
            dracoLoader = dracoLoader || new DRACOLoader();
            dracoLoader.setDecoderPath(typeof useDraco === "string"
                ? useDraco
                : "https://www.gstatic.com/draco/versioned/decoders/1.4.3/");
            loader.setDRACOLoader(dracoLoader);
        }

        loader.load(path, (gltf) => {
            resolve(gltf);
        });

    });

}

const loadVideoTexture = (src, options = {}) => {
    const { unsuspend = "loadedmetadata", crossOrigin = "Anonymous", loop = true, muted = true, start = true, } = options;
    return new Promise((resolve) => {
        const video = Object.assign(document.createElement("video"), {
            src,
            crossOrigin,
            loop,
            muted,
            ...options,
        });
        const texture = new THREE.VideoTexture(video);
        video.addEventListener("loadedmetadata", () => {
            if (start) {
                texture.image.play();
            }
            resolve(texture);
        });
    });
};