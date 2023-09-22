import contains from 'robust-point-in-polygon';

/**
 * Determining the occurrence of a point in a polygon (PIP).
 *
 * @param {Object} polygon Polygon geometry.
 * @param {Object} point Point geometry.
 * @returns {boolean} Entering a point in the polygon.
 */
const inside = (polygon, point) => {
    const pointCoord = point.coordinates;
    const polygonsCoord = polygon.coordinates;
    const polygonCoord = polygonsCoord[0];

    let result = contains(polygonCoord, pointCoord) !== 1;

    if (result) {
        // If the point enters the first polygon, then the rest are likely to be holes.
        // If not, the point will not be in them.
        // Since it lies in the first polygon.
        for (let k = 1; k < polygonsCoord.length; k++) {
            const holeCoord = polygonsCoord[k];
            const isInsideHole = contains(holeCoord, pointCoord) !== 1;

            if (isInsideHole) {
                result = !isInsideHole;

                break;
            }
        }
    } else {
        // If a point does not enter the first polygon, then the rest is likely not a hole.
        // If not, the point will not be in them.
        // Otherwise, it would fall into the first polygon.
        for (let k = 1; k < polygonsCoord.length; k++) {
            const polygonCoord = polygonsCoord[k];
            const isInsidePolygon = contains(polygonCoord, pointCoord) !== 1;

            if (isInsidePolygon) {
                result = isInsidePolygon;

                break;
            }
        }
    }

    return result;
};

export default inside;
