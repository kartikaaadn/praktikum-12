
import {
    grayscaleValues,
    makeBinaryImage
} from "../utils.js";

export function globalThreshold(imageData, threshold) {
    const gray = grayscaleValues(imageData);

    const binary = new Uint8Array(gray.length);

    for (let i = 0; i < gray.length; i++) {
        binary[i] = gray[i] > threshold ? 1 : 0;
    }

    return makeBinaryImage(
        imageData.width,
        imageData.height,
        binary
    );
}
