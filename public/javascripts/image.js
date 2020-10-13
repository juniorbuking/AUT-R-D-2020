import { drawInstructor, renderImageToCanvas, drawStudent } from "./util.js";
import { instructor } from "./instructor.js";

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

/**
 * Mobilenet Model
 */
const model = {
  algorithm: "multi-pose",
  input: {
    architecture: "MobileNetV1",
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes,
  },
  multiPoseDetection: {
    maxPoseDetections: 5,
    minPoseConfidence: 0.15,
    minPartConfidence: 0.1,
    nmsRadius: 30.0,
  },
  output: {
    showVideo: true,
    showSkeleton: true,
    showKeypoint: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * ResNet Model
 */
// const model = {
//   algorithm: 'multi-pose',
//   input: {
//     architecture: 'ResNet50',
//     outputStride: defaultResNetStride,
//     inputResolution: defaultResNetInputResolution,
//     multiplier: defaultResNetMultiplier,
//     quantBytes: defaultQuantBytes
//   },
//   singlePoseDetection: {
//     minPoseConfidence: 0.1,
//     minPartConfidence: 0.5,
//   },
//   multiPoseDetection: {
//     maxPoseDetections: 5,
//     minPoseConfidence: 0.15,
//     minPartConfidence: 0.1,
//     nmsRadius: 30.0,
//   },
//   output: {
//     showVideo: true,
//     showSkeleton: true,
//     showKeypoint: true,
//     showBoundingBox: false,
//   },
//   net: null,
// };

const imageElement = document.getElementById("image");
// draw instructor
const scale = 3.5;
const pose = 2;
const instructorCanvas = drawInstructor(
  instructor[pose].keypoints,
  model.multiPoseDetection.minPartConfidence,
  [imageElement.width / scale, imageElement.height / scale],
  1 / scale
);

posenet
  .load({
    architecture: model.input.architecture,
    outputStride: model.input.outputStride,
    inputResolution: model.input.inputResolution,
    multiplier: model.input.multiplier,
    quantBytes: model.input.quantBytes,
  })
  .then(function (net) {
    const poses = net.estimateMultiplePoses(imageElement, {
      flipHorizontal: true,
      maxDetections: model.multiPoseDetection.maxPoseDetections,
      scoreThreshold: model.multiPoseDetection.minPartConfidence,
      nmsRadius: model.multiPoseDetection.nmsRadius,
    });
    return poses;
  })
  .then(function (poses) {
    console.log(poses);
    const canvas = document.getElementById("output");
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    renderImageToCanvas(
      imageElement,
      canvas,
      [0, 0],
      [imageElement.width, imageElement.height]
    );

    // draw instructor
    renderImageToCanvas(
      instructorCanvas,
      canvas,
      [20, 590],
      [instructorCanvas.width, instructorCanvas.height]
    );

    // draw student
    drawStudent(
      canvas,
      poses,
      model.multiPoseDetection.minPartConfidence,
      model.multiPoseDetection.minPoseConfidence,
      model.output.showKeypoint,
      model.output.showSkeleton,
      model.output.showBoundingBox
    );
  });
