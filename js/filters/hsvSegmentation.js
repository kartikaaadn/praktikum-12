import { makeBinaryImage } from "../utils.js";

// Mengubah warna RGB menjadi HSV.
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;

    if (delta !== 0) {
        if (max === r) {
            h = 60 * (((g - b) / delta) % 6);
        } else if (max === g) {
            h = 60 * ((b - r) / delta + 2);
        } else {
            h = 60 * ((r - g) / delta + 4);
        }
    }

    if (h < 0) {
        h += 360;
    }

    const s = max === 0 ? 0 : (delta / max) * 100;
    const v = max * 100;

    return { h, s, v };
}

// Melakukan segmentasi berdasarkan rentang HSV.
export function hsvSegmentation(imageData, options) {
    const {
        hueMin,
        hueMax,
        saturationMin,
        valueMin
    } = options;

    const binary = new Uint8Array(
        imageData.width * imageData.height
    );

    for (let i = 0; i < binary.length; i++) {
        const index = i * 4;

        const hsv = rgbToHsv(
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2]
        );

        // Mendukung rentang Hue yang melewati 0 derajat.
        const hueMatch = hueMin <= hueMax ?
            hsv.h >= hueMin && hsv.h <= hueMax :
            hsv.h >= hueMin || hsv.h <= hueMax;

        const saturationMatch = hsv.s >= saturationMin;
        const valueMatch = hsv.v >= valueMin;

        binary[i] =
            hueMatch && saturationMatch && valueMatch ?
            1 :
            0;
    }

    return makeBinaryImage(
        imageData.width,
        imageData.height,
        binary
    );
}