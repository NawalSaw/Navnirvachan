import * as faceapi from "face-api.js";
import canvas from "canvas";
// import { ApiHandler } from "./ApiHandler.js";

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function loadModels () {
  const modelPath = "./src/faceApiModels";

  await faceapi.nets.tinyFaceDetector.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  // await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  console.log("✅ FaceAPI Models Loaded");
};

export { faceapi, loadModels, canvas };
