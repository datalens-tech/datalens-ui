/**
 * squaresGrid
 * @param {IProjection} projection Projection of map.
 * @param {number} zoom Zoom of map.
 * @param {number} sideLength Side legth of square.
 * @param {number} offsetLeft Offset left.
 * @param {number} offsetTop Offset top.
 * @param {number} width Width.
 * @param {number} height Height.
 */
export default function squaresGrid(
    projection,
    zoom,
    sideLength,
    offsetLeft,
    offsetTop,
    width,
    height,
) {
    const cols = width / sideLength;
    const rows = height / sideLength;
    const result = {type: 'FeatureCollection', features: []};
    let id = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const left = offsetLeft + c * sideLength;
            const top = offsetTop + r * sideLength;
            const right = left + sideLength;
            const bottom = top + sideLength;
            const squarePixels = [
                [left, top],
                [right, top],
                [right, bottom],
                [left, bottom],
            ];
            const squareGlobals = squarePixels.map((point) =>
                projection.fromGlobalPixels(point, zoom),
            );
            result.features.push({
                type: 'Feature',
                id: 'sqr' + id++,
                geometry: {
                    type: 'Polygon',
                    coordinates: [squareGlobals],
                },
                properties: {},
            });
        }
    }

    return result;
}
