const a = document.createElement("a");
document.body.appendChild(a);
a.style.display = "none";

/**
 * 
 * @param {Blob} blob 
 * @param {string} name 
 */
export function download(blob, name) {
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = name;
    a.click();
};