import { drawBoundingBox, drawKeypoints, drawSkeleton } from "./util.js";

const videoWidth = 600;
const videoHeight = 500;

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

// const defaultResNetMultiplier = 1.0;
// const defaultResNetStride = 32;
// const defaultResNetInputResolution = 250;

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

function detectPoses(video) {

  const canvas = document.getElementById('output');
  const ctx = canvas.getContext('2d');
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  function frameProcessing() {

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

      console.log(multiPoses);

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
  
      requestAnimationFrame(frameProcessing);
    })
  }

  requestAnimationFrame(frameProcessing);
}

function loadVideo() {

  const video = document.getElementById("video");
  video.width = videoWidth;
  video.height = videoHeight;

  return Promise.resolve(
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        return video;
      })
      .then((video) => {
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            resolve(video);
          };
        });
      })
      .then((video) => {
        video.play();
        return video;
      })
  );
}

(async () => {

  const net = await posenet.load({
    architecture: model.input.architecture,
    outputStride: model.input.outputStride,
    inputResolution: model.input.inputResolution,
    multiplier: model.input.multiplier,
    quantBytes: model.input.quantBytes
  });

  loadVideo()
    .then(video => {
      model.net = net;
      detectPoses(video);
    })
    .catch(e => {
      console.log(e);

      const info = document.getElementById('info');
      info.textContent = 'this browser does not support video capture, or this device does not have a camera';
      info.style.display = 'block';
    });

})()