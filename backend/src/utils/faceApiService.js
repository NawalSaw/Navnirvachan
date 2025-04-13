// import { ApiHandler } from "./ApiHandler.js";
// import { ApiError } from "./ApiError.js";
import sharp from "sharp";
import { canvas, faceapi, loadModels } from "./faceApiConfig.js";
import { readFile } from "fs/promises";

// Load models at service init

let modelsLoaded = false;

async function initFaceApi() {
  if (!modelsLoaded) {
    await loadModels();
    modelsLoaded = true;
  }
}


function isRemoteUrl(path) {
  return path.startsWith("http://") || path.startsWith("https://");
}

async function resizeImage(inputPath, width = 200) {
  let inputBuffer;

  if (isRemoteUrl(inputPath)) {
    const response = await fetch(inputPath);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    inputBuffer = Buffer.from(await response.arrayBuffer());
  } else {
    inputBuffer = await readFile(inputPath);
  }

  const resizedBuffer = await sharp(inputBuffer).resize({ width }).toBuffer();
  return await canvas.loadImage(resizedBuffer);
}

async function verifyFaces(referencePath, testPath) {
  await initFaceApi(); // Ensure models are loaded before running detection

  const refImage = await resizeImage(referencePath);
  const testImage = await resizeImage(testPath);

  const options = new faceapi.TinyFaceDetectorOptions({
    inputSize: 160,
    scoreThreshold: 0.5,
  });

  const [refDetection, testDetection] = await Promise.all([
    faceapi
      .detectSingleFace(refImage, options)
      .withFaceLandmarks()
      .withFaceDescriptor(),
    faceapi
      .detectSingleFace(testImage, options)
      .withFaceLandmarks()
      .withFaceDescriptor(),
  ]);

  if (!refDetection) {
    return {
      verified: false,
      reason: "Face not detected in reference image",
    };
  }

  if (!testDetection) {
    return {
      verified: false,
      reason: "Face not detected in test image",
    };
  }

  const distance = faceapi.euclideanDistance(
    refDetection.descriptor,
    testDetection.descriptor
  );
  const isVerified = distance < 0.6; // Recommended threshold
  console.log("Distance:", distance);
  return { verified: isVerified, distance: distance.toFixed(4) };
}

export { verifyFaces, initFaceApi };
