/**
 * Prototype that contains the parts of building a instructor model to compare with the user model
 * 
 * @param {number} score The confidence score of the instructor model
 * @param {array} keypoints The keypoints of the instructor model
 * @param {array} slope The slopes between the keypoints of the instructor model
 */
export let Instructor =  class {
    score;
    keypoints;
    slope;

    constructor(score, keypoints, slope) {
        this.score = score;
        this.keypoints = keypoints;
        this.slope = slope;
    }

    get score() {
        return this.score;
    }

    get keypoints() {
        return this.keypoints;
    }

    get slope() {
        return this.slope;
    }
}