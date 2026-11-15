
import {
    grayscaleValues,
    makeBinaryImage
} from "../utils.js";

export function otsuThreshold(imageData) {
    const gray = grayscaleValues(imageData);

    // Membuat histogram dengan 256 tingkat intensitas.
    const histogram = new Array(256).fill(0);

    for (const value of gray) {
        histogram[value]++;
    }

    const total = gray.length;

    let totalIntensity = 0;

    for (let i = 0; i < 256; i++) {
        totalIntensity += i * histogram[i];
    }

    let backgroundWeight = 0;
    let backgroundSum = 0;

    let maxVariance = -1;
    let bestThreshold = 0;

    // Mencari threshold dengan varians antarkelas terbesar.
    for (let threshold = 0; threshold < 256; threshold++) {

        backgroundWeight += histogram[threshold];

        if (backgroundWeight === 0) {
            continue;
        }

        const foregroundWeight = total - backgroundWeight;

        if (foregroundWeight === 0) {
            break;
        }

        backgroundSum += threshold * histogram[threshold];

        const meanBackground =
            backgroundSum / backgroundWeight;

        const meanForeground =
            (totalIntensity - backgroundSum) / foregroundWeight;

        const variance =
            backgroundWeight *
            foregroundWeight *
            Math.pow(meanBackground - meanForeground, 2);

        if (variance > maxVariance) {
            maxVariance = variance;
            bestThreshold = threshold;
        }
    }

    // Menerapkan threshold terbaik pada citra.
    const binary = new Uint8Array(gray.length);

    for (let i = 0; i < gray.length; i++) {
        binary[i] = gray[i] > bestThreshold ? 1 : 0;
    }

    return {
        imageData: makeBinaryImage(
            imageData.width,
            imageData.height,
            binary
        ),
        threshold: bestThreshold
    };
}
