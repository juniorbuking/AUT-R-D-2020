import { instructor } from "./instructor.js";

let isInstructor = true;
let colour = "aqua";
const boundingBoxColor = "red";
const lineWidth = 3;
const lineCap = "round";
const pose = 2;

function setColour(c) {
  colour = c;
}

function calculateSlope([ay, ax], [by, bx]) {
  return (ay - by) / (bx - ax);
}

function calculateAngle(m1, m2) {
  // console.log(m1, m2);
  const tan = Math.abs((m2 - m1) / (1 + m1 * m2));
  const radians = Math.atan(tan);
  const angle = (radians * 180) / Math.PI;
  return angle;
}

function toTuple({ y, x }) {
  return [y, x];
}

export function toggleInstructor(t) {
  isInstructor = t;
}

export function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Draws a line on a canvas, i.e. a joint
 */
export function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
  ctx.beginPath();
  ctx.moveTo(ax * scale, ay * scale);
  ctx.lineTo(bx * scale, by * scale);
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = color;
  ctx.lineCap = lineCap;
  ctx.stroke();
}

/**
 * Draws a pose skeleton by looking up all adjacent keypoints/joints
 */
export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence
  );

  //   console.log("adjacent", adjacentKeyPoints);
  //   console.log("keypoint", keypoints);

  let totalIncorrect = 0;
  adjacentKeyPoints.forEach((keypoints) => {
    if (isInstructor) {
      setColour("LightGreen");
    } else {
      const key1 = `${keypoints[0].part}_${keypoints[1].part}`;
      const key2 = `${keypoints[1].part}_${keypoints[0].part}`;
      const instructorSlope =
        instructor[pose].slope[key1] || instructor[pose].slope[key2];
      const studentSlope = calculateSlope(
        toTuple(keypoints[0].position),
        toTuple(keypoints[1].position)
      );

      const angle = Math.floor(calculateAngle(instructorSlope, studentSlope));
      // console.log(key1, angle);

      if (angle > 10) {
        setColour("OrangeRed");
        totalIncorrect++;
      } else {
        setColour("Yellow");
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

  if (!isInstructor) {
    if (totalIncorrect === 0) {
      drawText("&#10003;"); // tick
    } else {
      drawText("&#10060;"); // cross
    }
  }
}

/**
 * Draw pose keypoints onto a canvas
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
 * Draw an image on a canvas
 */
export function renderImageToCanvas(image, canvas, [x, y], [width, height]) {
  // canvas.width = size[0];
  // canvas.height = size[1];
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, x, y, width, height);
}

/**
 * Draw an instructor pose on a canvas
 */
export function drawInstructor(
  keypoints,
  minConfidence,
  [width, height],
  scale = 1
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 50, width, height);

  toggleInstructor(true);
  drawKeypoints(keypoints, minConfidence, ctx, scale);
  drawSkeleton(keypoints, minConfidence, ctx, scale);

  return canvas;
}

/**
 * Draw a student pose on a canvas
 */
export function drawStudent(
  canvas,
  poses,
  minPartConfidence,
  minPoseConfidence,
  showKeypoint,
  showSkeleton,
  showBoundingBox
) {
  const ctx = canvas.getContext("2d");

  toggleInstructor(false);
  poses.forEach((pose) => {
    // console.log(pose)
    if (pose.score >= minPoseConfidence) {
      if (findPoints(pose.keypoints)) {
        drawText(
          "Position the camera or move backwards until the camera covers the whole body."
        );
      } else {
        if (showKeypoint) {
          // console.log("drawkeypoints");
          drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        }

        if (showSkeleton) {
          // console.log("drawskeleton");
          drawSkeleton(pose.keypoints, minPartConfidence, ctx);
        }

        if (showBoundingBox) {
          // console.log("drawkeyBoundingbox");
          drawBoundingBox(pose.keypoints, ctx);
        }
      }
    }
  });
}

function findPoints(keypoints) {
  return keypoints.some((el) => el.score <= 0.02);
}

function drawText(text) {
  const message = document.getElementById("message");
  message.innerHTML = text;
  message.style.display = "block";
}
