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

    /**
     * Gets the name of the two keypoints for a drawn line and returns an array
     * for the two points 
     * @param {*} keypointsName the name of the two keypoints seperated by a '_'
     *                          e.g leftShoulder_rightShoulder 
     */
    getKeypointByName(keypointsName) {
        var parts = keypointsName.split("_");
        
        var pos1 = this.keypoints[this.keypoints.findIndex(x => x.part == parts[0])];
        var pos2 = this.keypoints[this.keypoints.findIndex(x => x.part == parts[1])];

        return [pos1.position.x, pos1.position.y, pos2.position.x, pos2.position.y];
    }
}