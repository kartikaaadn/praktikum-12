
// Membatasi nilai agar berada di antara nilai minimum dan maksimum.
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Mengubah setiap piksel RGB menjadi nilai grayscale.
export function grayscaleValues(imageData) {
    const values = new Uint8Array(
        imageData.width * imageData.height
    );

    for (let i = 0; i < values.length; i++) {
        const index = i * 4;

        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];

        values[i] = Math.round(
            0.299 * r +
            0.587 * g +
            0.114 * b
        );
    }

    return values;
}

// Membuat citra biner hitam-putih.
export function makeBinaryImage(width, height, pixels) {
    const output = new ImageData(width, height);

    for (let i = 0; i < pixels.length; i++) {
        const value = pixels[i] ? 255 : 0;
        const index = i * 4;

        output.data[index] = value;
        output.data[index + 1] = value;
        output.data[index + 2] = value;
        output.data[index + 3] = 255;
    }

    return output;
}
