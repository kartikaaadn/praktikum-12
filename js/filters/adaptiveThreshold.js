
import {
    grayscaleValues,
    makeBinaryImage,
    clamp
} from "../utils.js";

export function adaptiveThreshold(
    imageData,
    blockSize = 5,
    constantC = 5
) {
    const width = imageData.width;
    const height = imageData.height;

    const gray = grayscaleValues(imageData);
    const binary = new Uint8Array(gray.length);

    const radius = Math.floor(blockSize / 2);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {

            let sum = 0;
            let count = 0;

            // Menghitung rata-rata piksel di sekitar piksel pusat.
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {

                    const px = clamp(x + kx, 0, width - 1);
                    const py = clamp(y + ky, 0, height - 1);

                    sum += gray[py * width + px];
                    count++;
                }
            }

            const localMean = sum / count;

            const index = y * width + x;

            const threshold = localMean - constantC;

            binary[index] = gray[index] > threshold ? 1 : 0;
        }
    }

    return makeBinaryImage(
        width,
        height,
        binary
    );
}
