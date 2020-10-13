import { Instructor } from "../instructor.js";
import { camera } from "../camera.js";
import { video } from "../video.js";
//import { calculateSlope } from "../util.js"; **SEE BELOW FOR USE

/**
 * Model for an instructor with their arms by their side and
 * their legs in a natural standing position.
 * 
 * Call the script using a module on the index.jade page
 */
var instructorArmsOut = new Instructor(
    // confidence score of the model
    0.9323163383147296,
    //keypoints of the model
    [
        {
            part: "nose",
            position: {x: 302.31578335675675, y: 97.8966801219303},
            score: 0.9995670914649963
        },
        {
            part: "leftEye",
            position: {x: 312.7788821936133, y: 91.33311181480974},
            score: 0.9996479749679565
        },
        {
            part: "rightEye",
            position: {x: 291.3072889239735, y: 90.64059056026835},
            score: 0.999535858631134
        },
        {
            part: "leftEar",
            position: {x: 326.9449293493505, y: 102.04671393457792},
            score: 0.9300721287727356
        },
        {
            part: "rightEar",
            position: {x: 277.1166070366289, y: 103.43156237477507},
            score: 0.947840690612793
        },
        {
            part: "leftShoulder",
            position: {x: 356.65643392674156, y: 152.33760810713892},
            score: 0.9967093467712402
        },
        {
            part: "rightShoulder",
            position: {x: 256.28227870948837, y: 153.5215184002575},
            score: 0.9936508536338806
        },
        {
            part: "leftElbow",
            position: {x: 381.2535376136212, y: 208.56703982746575},
            score: 0.9614564776420593
        },
        {
            part: "rightElbow",
            position: {x: 226.85456343100103, y: 212.4724627980284},
            score: 0.9946464896202087
        },
        {
            part: "leftWrist",
            position: {x: 394.42626408168246, y: 262.44592877700774},
            score: 0.9884083867073059
        },
        {
            part: "rightWrist",
            position: {x: 211.17126442776836, y: 261.85917988629404},
            score: 0.9813303351402283
        },
        {
            part: "leftHip",
            position: {x: 341.3961934371733, y: 267.15940709565007},
            score: 0.9625933170318604
        },
        {
            part: "rightHip",
            position: {x: 261.15190901266976, y: 261.5452545749349},
            score: 0.9723162651062012
        },
        {
            part: "leftKnee",
            position: {x: 344.45524810545396, y: 359.9695777509294},
            score: 0.7678905725479126
        },
        {
            part: "rightKnee",
            position: {x: 264.5853627855389, y: 359.5193851401868},
            score: 0.9857508540153503
        },
        {
            part: "leftAnkle",
            position: {x: 355.9812388429699, y: 458.9562611800564},
            score: 0.9086828827857971
        },
        {
            part: "rightAnkle",
            position: {x: 261.1701642963248, y: 460.17194552200897},
            score: 0.8549326658248901
        }
    ],
    // slopes of the model, calculated using the calculateSlope function in utils.js
    {
        leftWrist_leftElbow: -0.2444877154092329,
        leftElbow_leftShoulder: -0.43744179754866375,
        leftShoulder_rightShoulder: 84.78189251387852,
        rightShoulder_rightElbow: 0.4991898871021323,
        rightElbow_rightWrist: 0.31756107568767794,
        rightShoulder_rightHip: 0.045079261980969315,
        leftShoulder_leftHip: 0.13290368748790624,
        leftHip_rightHip: -14.293214181199641,
        leftAnkle_leftKnee: -0.1164398112779319,
        leftKnee_leftHip: -0.03296033879350132,
        rightAnkle_rightKnee: 0.0339305674516243,
        rightKnee_rightHip: -0.035044493409231374,
    }
);

/**
 * Runs the model using the camera
 */
function runModelOnCamera() {
    var cameraInstructor = new camera();
    cameraInstructor.loadPosenet(instructorArmsOut);
}
  
// Run the function
runModelOnCamera();

/**
 * HOW TO CALCULATE THE SLOPES OF THE MODEL 
 * 1. Use the import for calculate slopes at the top
 * 2. For each of the following slopes, get both the x and y values of the keypoints and run it throught the function
 * 3. Add it to the slopes variables
 * 
 * EXAMPLE BELOW: (commented out for obvious reasons)
 * console.log("leftWrist_leftElbow", calculateSlope([394.42626408168246, 262.44592877700774], [381.2535376136212, 208.56703982746575]));
 * console.log("leftElbow_leftShoulder", calculateSlope([381.2535376136212, 208.56703982746575], [356.65643392674156, 152.33760810713892]));
 * console.log("leftShoulder_rightShoulder", calculateSlope([356.65643392674156, 152.33760810713892], [256.28227870948837, 153.5215184002575]));
 * console.log("rightShoulder_rightElbow", calculateSlope([256.28227870948837, 153.5215184002575], [226.85456343100103, 212.4724627980284]));
 * console.log("rightElbow_rightWrist", calculateSlope([226.85456343100103, 212.4724627980284], [211.17126442776836, 261.85917988629404]));
 * console.log("rightShoulder_rightHip", calculateSlope([256.28227870948837, 153.5215184002575], [261.15190901266976, 261.5452545749349]));
 * console.log("leftShoulder_leftHip", calculateSlope([356.65643392674156, 152.33760810713892], [341.3961934371733, 267.15940709565007]));
 * console.log("leftHip_rightHip", calculateSlope([341.3961934371733, 267.15940709565007], [261.15190901266976, 261.5452545749349]));
 * console.log("leftAnkle_leftKnee", calculateSlope([355.9812388429699, 458.9562611800564], [344.45524810545396, 359.9695777509294]));
 * console.log("leftKnee_leftHip", calculateSlope([344.45524810545396, 359.9695777509294], [341.3961934371733, 267.15940709565007]));
 * console.log("rightAnkle_rightKnee", calculateSlope([261.1701642963248, 460.17194552200897], [264.5853627855389, 359.5193851401868]));
 * console.log("rightKnee_rightHip", calculateSlope([264.5853627855389, 359.5193851401868], [261.15190901266976, 261.5452545749349]));
 */
