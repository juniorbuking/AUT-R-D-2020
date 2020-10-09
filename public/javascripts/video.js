import { drawBoundingBox, drawKeypoints, drawSkeleton } from "./util.js";

// const videoWidth = 600;
// const videoHeight = 500;

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

const defaultResNetMultiplier = 1.0;
const defaultResNetStride = 32;
const defaultResNetInputResolution = 250;

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
    showKeyPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

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

function detectPoses() {
  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // canvas for extracting video frame
  const poseCanvas = document.createElement('canvas');
  poseCanvas.width =  videoWidth;
  poseCanvas.height = videoHeight;

  function frameProcessing() {
    const video = extractFrame(poseCanvas);

    model.net.estimateMultiplePoses(video, {
      flipHorizontal: false,
      maxDetections: model.multiPoseDetection.maxPoseDetections,
      scoreThreshold: model.multiPoseDetection.minPartConfidence,
      nmsRadius: model.multiPoseDetection.nmsRadius
    }).then((multiPoses) => {

      const minPoseConfidence = +model.multiPoseDetection.minPoseConfidence;
      const minPartConfidence = +model.multiPoseDetection.minPartConfidence;

      ctx.clearRect(0, 0, videoWidth, videoHeight);

      if (model.output.showVideo) {
        ctx.save();
        // ctx.scale(-1, 1);
        // ctx.translate(-videoWidth, 0);
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
        ctx.restore();
      }

      // console.log(multiPoses);

      multiPoses.forEach(({score, keypoints}) => {
        if (score >= minPoseConfidence) {
          if (model.output.showKeyPoints) {
            // console.log("drawkeypoints");
            drawKeypoints(keypoints, minPartConfidence, ctx);
          }
  
          if (model.output.showSkeleton) {
            // console.log("drawskeleton");
            drawSkeleton(keypoints, minPartConfidence, ctx);
          }
  
          if (model.output.showBoundingBox) {
            // console.log("drawkeyBoundingbox");
            drawBoundingBox(keypoints, ctx);
          }
        }
      });
  
      videoID = requestAnimationFrame(frameProcessing);
  
      if (videoElement.paused) {
        cancelAnimationFrame(videoID);
      }
    })
  }

  requestAnimationFrame(frameProcessing);
}

var videoID;
const videoElement = document.getElementById("video");
const videoControl = document.getElementById("control");
const videoWidth = videoElement.width || 640;
const videoHeight = videoElement.height || 360;


videoControl.onclick = async () => {
  
  if (videoElement.paused) {
    const net = await posenet.load({
      architecture: model.input.architecture,
      outputStride: model.input.outputStride,
      inputResolution: model.input.inputResolution,
      multiplier: model.input.multiplier,
      quantBytes: model.input.quantBytes
    });
    model.net = net;
    videoElement.play();
    detectPoses();
  }
  else {
    videoElement.pause();
  }
}

// Both return 0?
// console.log(videoElement.width);
// console.log(videoElement.height);

// videoElement.onloadedmetadata = () => {
//   console.log(videoElement.width);
//   console.log(videoElement.height);
// }

function extractFrame(cvs) {     
  // const cvs = document.createElement('canvas');
  const context = cvs.getContext('2d');

  // context.clearRect(0, 0, videoWidth, videoHeight);
  // context.save();
  context.scale(-1, 1);
  context.translate(w, 0);
  context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  // context.restore();

  return cvs;
}