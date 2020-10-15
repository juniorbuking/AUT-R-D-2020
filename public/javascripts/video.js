import { 
  drawBoundingBox, 
  drawKeypoints, 
  drawSkeleton,
  toggleInstructor
} from "./util.js";

const videoWidth = 600;
const videoHeight = 500;

const defaultQuantBytes = 2;

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

/**
 * ResNet Model
 * Not in use but if wanting a more accurate model then we recommend ResNet
 * NOTE: ResNet also takes more time to compute
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

/**
 * Creates the post estimation model
 * @param {*} instructor an instructor model
 * @param {*} videoElement the video which the user model is based on
 */
function detectPoses(instructor, videoElement) {
  const canvas = document.getElementById('outputCamera');
  const ctx = canvas.getContext('2d');
  canvas.width = videoWidth;
  canvas.height = videoHeight;

  // canvas for extracting video frame
  const poseCanvas = document.createElement('canvas');
  poseCanvas.width =  videoWidth;
  poseCanvas.height = videoHeight;

  function frameProcessing() {
    const video = extractFrame(poseCanvas, videoElement);

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
      multiPoses.forEach(({score, keypoints}) => {
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
  
      var videoID = requestAnimationFrame(frameProcessing);
  
      if (videoElement.paused) {
        cancelAnimationFrame(videoID);
      }
    })
  }

  requestAnimationFrame(frameProcessing);
}

/**
 * A video class to be exported for use in the instructor class
 */
export class video{
  constructor() { }

  /**
   * Loads a video element
   * @param {*} instructorModel an instructor model
   */
  async loadVideo(instructorModel) {
    const videoElement = document.getElementById("video");
    const videoControl = document.getElementById("control");
    const videoWidth = videoElement.width || 640;
    const videoHeight = videoElement.height || 360;
  
    if (videoElement.paused) {
      const net = await posenet.load({
        architecture: model.input.architecture,
        outputStride: model.input.outputStride,
        inputResolution: model.input.inputResolution,
        multiplier: model.input.multiplier,
        quantBytes: model.input.quantBytes
      });
      model.net = net;

      // So that an error does not show due to Google Autoplay Policies
      var promise = videoElement.play();
      if (promise !== undefined) {
        promise.then(_ => { }).catch(error => { });
      }

      detectPoses(instructorModel, videoElement);
    }
    else {
      videoElement.pause();
    }
  };
}

/**
 * Extracts the frame and draws the image
 * @param {*} cvs the context of where the element came from
 * @param {*} videoElement the video element where it is displayed
 */
function extractFrame(cvs, videoElement) {     
  // const cvs = document.createElement('canvas');
  const context = cvs.getContext('2d');

  // context.clearRect(0, 0, videoWidth, videoHeight);
  // context.save();
  //context.scale(-1, 1);
  //context.translate(w, 0);
  context.drawImage(videoElement, 0, 0, videoWidth, videoHeight);
  // context.restore();

  return cvs;
}