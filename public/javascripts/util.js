let isInstructor = true;
let colour = "aqua";
const boundingBoxColor = "red";
const lineWidth = 3;

/**
 * Sets the colour of a certain part of the model
 * @param {*} c colour
 */
function setColour(c) {
  colour = c;
}

/**
 * Calculates the slope between two keypoints
 * @param {*} param0 the first keypoint
 * @param {*} param1 the second keypoint
 */
export function calculateSlope([ay, ax], [by, bx]) {
  return (ay - by) / (bx - ax);
}

/**
 * Calculates the angle between two points
 * @param {*} m1 first number
 * @param {*} m2 second number
 */
function calculateAngle(m1, m2) {
  // console.log(m1, m2);
  const tan = Math.abs((m2 - m1) / (1 + m1 * m2));
  const radians = Math.atan(tan);
  const angle = (radians * 180) / Math.PI;
  return angle;
}

// Cosine similarity as a distance function. The lower the number, the closer // the match
// poseVector1 and poseVector2 are a L2 normalized 34-float vectors (17 keypoints each
// with an x and y. 17 * 2 = 32)
function cosineDistanceMatching(poseVector1, poseVector2) {
  let cosineSimilarity = similarity(poseVector1, poseVector2);
  let distance = 2 * (1 - cosineSimilarity);
  return Math.sqrt(distance);
}

/**
 * Used to change keypoints in the instructor model to tuples
 * @param {*} param0 x and y coordinate
 */
function toTuple({ y, x }) {
  return [y, x];
}

/**
 * Boolean to tell whether it is an instructors model or user model
 * @param {*} t true, used to indicate its an instructors model
 */
export function toggleInstructor(t) {
  isInstructor = t;
}

/**
  * Gets the keypoints from the adjacent keypoints and turns it into 
  * an array so we can calculate vectors
  * @param {*} keypoint keypoint to be changed to vector
  */
function keypointsToArray(keypoint) {
  var pos1 = keypoint[0].position;
  var pos2 = keypoint[1].position;

  return [pos1.x, pos1.y, pos2.x, pos2.y];
}

/**
 * Draws a keypoint onto a canvas
 * @param {*} ctx context of the canvas
 * @param {*} y y coordinate of the point
 * @param {*} x x coordinate of the point
 * @param {*} r radius of the point, as point will be a circle
 * @param {*} color the color of the keypoint
 */
export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 * @param {*} param0 the first keypoint with an x and y coordinate
 * @param {*} param1 the second keypoint with an x and y coordinate
 * @param {*} color the colour of the part of the pose
 * @param {*} scale the scale of the model
 * @param {*} ctx the context of the canvas
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 * @param {*} instructor an instructor object
 * @param {*} keypoints the keypoints of the pose estimation model
 * @param {*} minConfidence the minimum confidence that PoseNet thinks
 *                          the model is accurate
 * @param {*} ctx context of the canvas
 * @param {*} scale scale of the model; always set to 1
 */
export function drawSkeleton(
  instructor,
  keypoints,
  minConfidence,
  ctx,
  scale = 1
) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  adjacentKeyPoints.forEach((keypoints) => {
    if (isInstructor) {
      setColour("Yellow");
    } else {
      const key = `${keypoints[0].part}_${keypoints[1].part}`;

      const instructorKeypoint = instructor.getKeypointByName(key);
      const userKeypoint = keypointsToArray(keypoints);
    
      const distance = cosineDistanceMatching(instructorKeypoint, userKeypoint);
      console.log(distance);

      // If the cosine is greater than 0.925 then it is deemed accurate
      if (distance < 0.15) {
       setColour("Red");
      } else {
        setColour("LightGreen");
      }
    }

    drawSegment(
      toTuple(keypoints[0].position),
      toTuple(keypoints[1].position),
      colour,
      scale,
      ctx
    );
  });
}

/**
 * Draw keypoints of a pose onto a canvas
 * @param {*} keypoints the keypoints of the pose estimation model
 * @param {*} minConfidence the minimum confidence that PoseNet thinks
 *                          the model is accurate
 * @param {*} ctx context of the canvas
 * @param {*} scale scale of the model; always set to 1
 */
export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i];

    if (
      keypoint.score < minConfidence ||
      keypoint.part === "nose" ||
      keypoint.part === "leftEye" ||
      keypoint.part === "rightEye" ||
      keypoint.part === "leftEar" ||
      keypoint.part === "rightEar"
    ) {
      continue;
    }

    if (isInstructor) {
      setColour("MediumSeaGreen");
    } else {
      setColour("DarkCyan");
    }

    const { y, x } = keypoint.position;
    drawPoint(ctx, y * scale, x * scale, 6, colour);
  }
}

/**
 * Draw the bounding box of a pose. For example, for a whole person standing
 * in an image, the bounding box will begin at the nose and extend to one of
 * ankles
 * @param {*} keypoints the keypoints of the pose estimation model
 * @param {*} ctx context of the canvas
 */
export function drawBoundingBox(keypoints, ctx) {
  const boundingBox = posenet.getBoundingBox(keypoints);

  ctx.rect(
    boundingBox.minX,
    boundingBox.minY,
    boundingBox.maxX - boundingBox.minX,
    boundingBox.maxY - boundingBox.minY
  );

  ctx.strokeStyle = boundingBoxColor;
  ctx.stroke();
}

/**
 * Draw an image onto a canvas
 * @param {*} image the image to draw onto the canvas
 * @param {*} size the size of the canvas
 * @param {*} canvas the canvas to draw onto
 */
export function renderImageToCanvas(image, size, canvas) {
  canvas.width = size[0];
  canvas.height = size[1];
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0, size[0], size[1]);
}
