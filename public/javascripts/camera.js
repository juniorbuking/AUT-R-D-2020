import { drawInstructor, renderImageToCanvas, drawStudent } from "./util.js";
import { instructor } from "./instructor.js";

// const videoWidth = 500;
// const videoHeight = 500;
const outputWidth = 480;
const outputHeight = 853;

const defaultQuantBytes = 2;

const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16;
const defaultMobileNetInputResolution = 500;

// const defaultResNetMultiplier = 1.0;
// const defaultResNetStride = 32;
// const defaultResNetInputResolution = 250;

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
    showKeyPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

function detectPoses(video, instructorCanvas) {
  const canvas = document.getElementById("output");
  const ctx = canvas.getContext("2d");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  canvas.style.display = "block";

  function frameProcessing() {
    model.net
      .estimateMultiplePoses(video, {
        flipHorizontal: true,
        maxDetections: model.multiPoseDetection.maxPoseDetections,
        scoreThreshold: model.multiPoseDetection.minPartConfidence,
        nmsRadius: model.multiPoseDetection.nmsRadius,
      })
      .then((multiPoses) => {
        const minPoseConfidence = +model.multiPoseDetection.minPoseConfidence;
        const minPartConfidence = +model.multiPoseDetection.minPartConfidence;

        ctx.clearRect(0, 0, outputWidth, outputHeight);

        if (model.output.showVideo) {
          ctx.save();
          ctx.scale(-1, 1);
          ctx.translate(-outputWidth, 0);
          ctx.drawImage(video, 0, 0, outputWidth, outputHeight);
          ctx.restore();
        }

        // console.log(multiPoses);

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
          multiPoses,
          minPartConfidence,
          minPoseConfidence,
          model.output.showKeyPoints,
          model.output.showSkeleton,
          model.output.showBoundingBox
        );

        requestAnimationFrame(frameProcessing);
      });
  }

  requestAnimationFrame(frameProcessing);
}

function loadVideo() {
  const video = document.getElementById("video");
  video.width = outputWidth;
  video.height = outputHeight;

  return Promise.resolve(
    // Not adding `{ audio: true }` since we only want video now
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
        return video;
      })
      .then((video) => {
        return new Promise((resolve) => {
          video.onloadedmetadata = () => {
            // console.log("w", video.width);
            // console.log("h", video.height);
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
  const scale = 3.5;
  const pose = 2;
  const instructorCanvas = drawInstructor(
    instructor[pose].keypoints,
    model.multiPoseDetection.minPartConfidence,
    [outputWidth / scale, outputHeight / scale],
    1 / scale
  );

  const net = await posenet.load({
    architecture: model.input.architecture,
    outputStride: model.input.outputStride,
    inputResolution: model.input.inputResolution,
    multiplier: model.input.multiplier,
    quantBytes: model.input.quantBytes,
  });

  loadVideo()
    .then((video) => {
      model.net = net;
      detectPoses(video, instructorCanvas);
    })
    .catch((e) => {
      console.log(e);

      const info = document.getElementById("info");
      info.textContent =
        "Require permission to use the camera or camera is not supported on this device.";
      info.style.display = "flex";
    });
})();
