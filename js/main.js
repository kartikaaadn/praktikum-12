
import { toGrayscale } from "./filters/grayscale.js";
import { globalThreshold } from "./filters/globalThreshold.js";
import { adaptiveThreshold } from "./filters/adaptiveThreshold.js";
import { otsuThreshold } from "./filters/otsuThreshold.js";
import { hsvSegmentation } from "./filters/hsvSegmentation.js";

// ==========================================
// MENGAMBIL ELEMEN HTML
// ==========================================

const imageInput = document.getElementById("imageInput");

const originalCanvas = document.getElementById("originalCanvas");
const resultCanvas = document.getElementById("resultCanvas");

const originalContext = originalCanvas.getContext("2d", {
    willReadFrequently: true
});

const resultContext = resultCanvas.getContext("2d");

const imageInfo = document.getElementById("imageInfo");
const statusMessage = document.getElementById("statusMessage");
const resultDescription = document.getElementById("resultDescription");

const originalPlaceholder =
    document.getElementById("originalPlaceholder");

const resultPlaceholder =
    document.getElementById("resultPlaceholder");

const methodSelect = document.getElementById("methodSelect");

const globalControls =
    document.getElementById("globalControls");

const adaptiveControls =
    document.getElementById("adaptiveControls");

const hsvControls =
    document.getElementById("hsvControls");

const applyButton =
    document.getElementById("applyButton");

const resetButton =
    document.getElementById("resetButton");

// Menyimpan data citra asli.
let originalImageData = null;


// ==========================================
// MENGATUR TAMPILAN PARAMETER METODE
// ==========================================

function updateMethodControls() {
    const method = methodSelect.value;

    // Menampilkan parameter sesuai metode.
    globalControls.hidden = method !== "global";

    adaptiveControls.hidden = method !== "adaptive";

    hsvControls.hidden = method !== "hsv";

    // Menghapus hasil sebelumnya ketika metode berubah.
    clearResult();
}

methodSelect.addEventListener("change", () => {
    updateMethodControls();

    if (originalImageData) {
        statusMessage.textContent =
            "Metode dipilih. Tekan Terapkan Segmentasi untuk memproses citra.";
    }
});


// ==========================================
// MENAMPILKAN HASIL PENGOLAHAN
// ==========================================

function displayResult(imageData, description) {
    resultCanvas.width = imageData.width;
    resultCanvas.height = imageData.height;

    resultContext.putImageData(imageData, 0, 0);

    resultPlaceholder.hidden = true;

    resultDescription.textContent = description;
}


// ==========================================
// MENGHAPUS HASIL PENGOLAHAN
// ==========================================

function clearResult() {
    resultCanvas.width = 0;
    resultCanvas.height = 0;

    resultPlaceholder.hidden = false;

    resultDescription.textContent =
        "Belum ada proses yang dijalankan.";
}


// ==========================================
// UPLOAD DAN MENAMPILKAN CITRA ASLI
// ==========================================

imageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        statusMessage.textContent =
            "File yang dipilih bukan gambar.";

        imageInput.value = "";
        return;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {

        // Membatasi ukuran gambar agar proses tidak terlalu berat.
        const maxWidth = 700;
        const maxHeight = 500;

        const scale = Math.min(
            1,
            maxWidth / image.width,
            maxHeight / image.height
        );

        const width = Math.max(
            1,
            Math.round(image.width * scale)
        );

        const height = Math.max(
            1,
            Math.round(image.height * scale)
        );

        // Menampilkan gambar pada canvas asli.
        originalCanvas.width = width;
        originalCanvas.height = height;

        originalContext.clearRect(
            0,
            0,
            width,
            height
        );

        originalContext.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        // Mengambil data piksel untuk proses segmentasi.
        originalImageData = originalContext.getImageData(
            0,
            0,
            width,
            height
        );

        originalPlaceholder.hidden = true;

        imageInfo.textContent =
            `${file.name} — ${width} × ${height} piksel`;

        statusMessage.textContent =
            "Gambar berhasil dimuat. Silakan pilih metode segmentasi.";

        clearResult();

        URL.revokeObjectURL(imageUrl);
    };

    image.onerror = () => {
        statusMessage.textContent =
            "Gambar gagal dibaca. Silakan pilih file lain.";

        URL.revokeObjectURL(imageUrl);
    };

    image.src = imageUrl;
});


// ==========================================
// MENJALANKAN METODE SEGMENTASI
// ==========================================

applyButton.addEventListener("click", () => {

    // Memastikan gambar sudah diunggah.
    if (!originalImageData) {
        statusMessage.textContent =
            "Unggah gambar terlebih dahulu sebelum menjalankan metode.";

        return;
    }

    // Mengambil metode dari dropdown.
    const method = methodSelect.value;

    try {

        let output;
        let description;

        // ----------------------------------
        // GRAYSCALE
        // ----------------------------------

        if (method === "grayscale") {

            output = toGrayscale(originalImageData);

            description =
                "Hasil konversi citra RGB menjadi grayscale.";
        }

        // ----------------------------------
        // GLOBAL THRESHOLDING
        // ----------------------------------

        else if (method === "global") {

            const threshold = Number(
                document.getElementById("globalThreshold").value
            );

            if (!Number.isFinite(threshold) ||
                threshold < 0 ||
                threshold > 255) {

                throw new Error(
                    "Threshold harus berada antara 0 sampai 255."
                );
            }

            output = globalThreshold(
                originalImageData,
                threshold
            );

            description =
                `Global Thresholding dengan T = ${threshold}.`;
        }

        // ----------------------------------
        // ADAPTIVE MEAN THRESHOLDING
        // ----------------------------------

        else if (method === "adaptive") {

            const blockSize = Number(
                document.getElementById("blockSize").value
            );

            const constantC = Number(
                document.getElementById("adaptiveC").value
            );

            if (!Number.isInteger(blockSize) ||
                blockSize < 3 ||
                blockSize % 2 === 0) {

                throw new Error(
                    "Ukuran area harus berupa bilangan ganjil minimal 3."
                );
            }

            if (!Number.isFinite(constantC) ||
                constantC < -20 ||
                constantC > 20) {

                throw new Error(
                    "Konstanta C harus berada antara -20 sampai 20."
                );
            }

            output = adaptiveThreshold(
                originalImageData,
                blockSize,
                constantC
            );

            description =
                `Adaptive Mean Thresholding: area ${blockSize} × ${blockSize}, konstanta C = ${constantC}.`;
        }

        // ----------------------------------
        // OTSU THRESHOLDING
        // ----------------------------------

        else if (method === "otsu") {

            const result = otsuThreshold(originalImageData);

            output = result.imageData;

            description =
                `Otsu Thresholding menggunakan nilai ambang otomatis T = ${result.threshold}.`;
        }

        // ----------------------------------
        // HSV COLOR SEGMENTATION
        // ----------------------------------

        else if (method === "hsv") {

            const options = {
                hueMin: Number(
                    document.getElementById("hueMin").value
                ),

                hueMax: Number(
                    document.getElementById("hueMax").value
                ),

                saturationMin: Number(
                    document.getElementById("saturationMin").value
                ),

                valueMin: Number(
                    document.getElementById("valueMin").value
                )
            };

            if (
                options.hueMin < 0 ||
                options.hueMin > 360 ||
                options.hueMax < 0 ||
                options.hueMax > 360 ||
                options.saturationMin < 0 ||
                options.saturationMin > 100 ||
                options.valueMin < 0 ||
                options.valueMin > 100
            ) {
                throw new Error(
                    "Nilai parameter HSV berada di luar rentang yang diperbolehkan."
                );
            }

            output = hsvSegmentation(
                originalImageData,
                options
            );

            description =
                `Segmentasi HSV: Hue ${options.hueMin}°–${options.hueMax}°, Saturation ≥ ${options.saturationMin}%, Value ≥ ${options.valueMin}%.`;
        }

        else {
            throw new Error("Metode segmentasi tidak dikenali.");
        }

        // Menampilkan hasil segmentasi.
        displayResult(output, description);

        statusMessage.textContent =
            `Segmentasi selesai. ${methodSelect.options[methodSelect.selectedIndex].text} dengan berhasil diterapkan.`;

    } catch (error) {

        console.error(error);

        statusMessage.textContent =
            error.message ||
            "Terjadi kesalahan saat memproses gambar.";
    }
});


// ==========================================
// TOMBOL RESET
// ==========================================

resetButton.addEventListener("click", () => {

    imageInput.value = "";

    originalImageData = null;

    originalCanvas.width = 0;
    originalCanvas.height = 0;

    originalPlaceholder.hidden = false;

    imageInfo.textContent =
        "Belum ada gambar yang dipilih.";

    clearResult();

    // Mengembalikan metode ke Global Thresholding.
    methodSelect.value = "global";

    // Mengembalikan nilai parameter ke awal.
    document.getElementById("globalThreshold").value = 128;
    document.getElementById("blockSize").value = 5;
    document.getElementById("adaptiveC").value = 5;

    document.getElementById("hueMin").value = 0;
    document.getElementById("hueMax").value = 60;
    document.getElementById("saturationMin").value = 30;
    document.getElementById("valueMin").value = 20;

    updateMethodControls();

    statusMessage.textContent =
        "Silakan unggah gambar terlebih dahulu.";
});


// ==========================================
// PENGATURAN AWAL
// ==========================================

updateMethodControls();
