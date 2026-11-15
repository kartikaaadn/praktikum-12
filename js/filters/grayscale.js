
import { grayscaleValues } from "../utils.js";

export function toGrayscale(imageData) {
    const gray = grayscaleValues(imageData);

    const output = new ImageData(
        imageData.width,
        imageData.height
    );

    for (let i = 0; i < gray.length; i++) {
        const index = i * 4;

        output.data[index] = gray[i];
        output.data[index + 1] = gray[i];
        output.data[index + 2] = gray[i];
        output.data[index + 3] = 255;
    }

    return output;
}
