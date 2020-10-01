import { drawBoundingBox, drawKeypoints, drawSkeleton, renderImageToCanvas } from "./util.js";

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
  algorithm: 'multi-pose',
  input: {
    architecture: 'MobileNetV1',
    outputStride: defaultMobileNetStride,
    inputResolution: defaultMobileNetInputResolution,
    multiplier: defaultMobileNetMultiplier,
    quantBytes: defaultQuantBytes
  },
  singlePoseDetection: {
    minPoseConfidence: 0.1,
    minPartConfidence: 0.5,
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

const imageElement = document.getElementById('image');

posenet.load({
  architecture: model.input.architecture,
  outputStride: model.input.outputStride,
  inputResolution: model.input.inputResolution,
  multiplier: model.input.multiplier,
  quantBytes: model.input.quantBytes
}).then(function(net) {
  const poses = net.estimateMultiplePoses(imageElement, {
    flipHorizontal: false,
    maxDetections: model.multiPoseDetection.maxPoseDetections,
    scoreThreshold: model.multiPoseDetection.minPartConfidence,
    nmsRadius: model.multiPoseDetection.nmsRadius
  });
  return poses;
}).then(function(poses) {
  console.log(poses);
  const canvas = document.getElementById('output');
  drawResults(
      canvas, poses, model.multiPoseDetection.minPartConfidence,
      model.multiPoseDetection.minPoseConfidence);
})

function drawResults(canvas, poses, minPartConfidence, minPoseConfidence) {
  renderImageToCanvas(imageElement, [imageElement.width, imageElement.height], canvas);
  const ctx = canvas.getContext('2d');
  poses.forEach((pose) => {
    // console.log(pose)
    if (pose.score >= minPoseConfidence) {
      if (model.output.showKeypoint) {
        // console.log("drawkeypoints");
        drawKeypoints(pose.keypoints, minPartConfidence, ctx);
      }

      if (model.output.showSkeleton) {
        // console.log("drawskeleton");
        drawSkeleton(pose.keypoints, minPartConfidence, ctx);
      }

      if (model.output.showBoundingBox) {
        // console.log("drawkeyBoundingbox");
        drawBoundingBox(pose.keypoints, ctx);
      }
    }
  });
}