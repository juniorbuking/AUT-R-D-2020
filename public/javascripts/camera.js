import {
  drawBoundingBox,
  drawKeypoints,
  drawSkeleton,
  toggleInstructor,
} from "./util.js";

const videoWidth = 600;
const videoHeight = 500;

const defaultQuantBytes = 2;

// Constants needed for MobileNet
const defaultMobileNetMultiplier = 0.75; // lower for mobile
const defaultMobileNetStride = 16; 
const defaultMobileNetInputResolution = 500;

// Constants needed for ResNet
// const defaultResNetMultiplier = 1.0;
// const defaultResNetStride = 32;
// const defaultResNetInputResolution = 250;

/**
 * Mobilenet Model
 * Faster, less accurate pose estimation library
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
    showKeyPoints: true,
    showBoundingBox: false,
  },
  net: null,
};

/**
 * The camera class which can be exported for use on the instructor scripts
 */
export class camera{
  constructor() { }

  /**
   * Function that detects the poses of the instructor model and the user
   * @param {*} instructor an instructor object used for comparison with the
   *                       user model
   * @param {*} video a video object as this needs to be referneced in the 
   *                  function
   */
  detectPoses(instructor, video) {    
    // Set up canvas
    const canvas = document.getElementById("outputCamera");
    const ctx = canvas.getContext("2d");
    canvas.width = videoWidth;
    canvas.height = videoHeight;
  
    function frameProcessing() {
      model.net
        .estimateMultiplePoses(video, {
          flipHorizontal: false,
          maxDetections: model.multiPoseDetection.maxPoseDetections,
          scoreThreshold: model.multiPoseDetection.minPartConfidence,
          nmsRadius: model.multiPoseDetection.nmsRadius,
        })
        .then((multiPoses) => {
          const minPoseConfidence = +model.multiPoseDetection.minPoseConfidence;
          const minPartConfidence = +model.multiPoseDetection.minPartConfidence;
  
          ctx.clearRect(0, 0, videoWidth, videoHeight);
  
          if (model.output.showVideo) {
            ctx.save();
            ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
            ctx.restore();
          }

          // draw instructor
          toggleInstructor(true);
          if (instructor.score >= minPoseConfidence) {
            if (model.output.showSkeleton) {
              drawSkeleton(
                instructor,
                instructor.keypoints,
                model.multiPoseDetection.minPartConfidence,
                ctx
              );
            }
          }
  
          // draw student
          toggleInstructor(false);
          multiPoses.forEach(({ score, keypoints }) => {
            if (score >= minPoseConfidence) {
              if (model.output.showKeyPoints) {
                // console.log("drawkeypoints");
                drawKeypoints(keypoints, minPartConfidence, ctx);
              }
  
              if (model.output.showSkeleton) {
                // console.log("drawskeleton");
                drawSkeleton(instructor, keypoints, minPartConfidence, ctx);
              }
  
              if (model.output.showBoundingBox) {
                // console.log("drawkeyBoundingbox");
                drawBoundingBox(keypoints, ctx);
              }
            }
          });
  
          requestAnimationFrame(frameProcessing);
        });
    }
  
    requestAnimationFrame(frameProcessing);
  }
  
  /**
   * Loads up a video object based on the webcam canvas
   */
  loadVideo() {
    const video = document.getElementById("video");
    video.width = videoWidth;
    video.height = videoHeight;
  
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
  
  /**
   * Async function used to load PoseNet in the instructor file
   * @param {*} instructorModel an instructor object 
   */
  async loadPosenet(instructorModel) {
    const net = await posenet.load({
      architecture: model.input.architecture,
      outputStride: model.input.outputStride,
      inputResolution: model.input.inputResolution,
      multiplier: model.input.multiplier,
      quantBytes: model.input.quantBytes,
    });
  
    this.loadVideo()
      .then((video) => {
        model.net = net;
        this.detectPoses(instructorModel, video);
      })
      .catch((e) => {
        console.log(e);
  
        const info = document.getElementById("info");
        info.textContent =
          "this browser does not support video capture, or this device does not have a camera";
        info.style.display = "block";
      });
  };
}
