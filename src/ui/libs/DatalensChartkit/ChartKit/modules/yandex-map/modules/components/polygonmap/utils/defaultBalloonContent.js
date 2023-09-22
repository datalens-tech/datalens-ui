/**
 * defaultBalloonContent
 * @param {Object} object Stores in itself info about polygon and points inside.
 * @returns {string} Template of baloon.
 */
const defaultBalloonContent = (object) => {
    return `<div>
            <h3>Object data</h3>
            <div>Number of points: ${object.properties.pointsCount}</div>
    </div>`;
};

export default defaultBalloonContent;
