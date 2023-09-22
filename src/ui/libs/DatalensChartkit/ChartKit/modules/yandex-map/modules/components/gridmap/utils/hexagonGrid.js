/**
 * Get sin of angle
 *
 * @param {number} angle angle
 * @return {number} sin of angle
 */
export function sin(angle) {
    return Math.sin((Math.PI * angle) / 180);
}

/**
 * Get cos of angle
 *
 * @param {number} angle angle
 * @return {number} cos of angle
 */
export function cos(angle) {
    return Math.cos((Math.PI * angle) / 180);
}

/**
 * hexagonGrid
 * @param {IProjection} projection Projection of map.
 * @param {number} zoom Zoom of map.
 * @param {number} R Hexagon radius.
 * @param {number} offsetLeft Offset left.
 * @param {number} offsetTop Offset top.
 * @param {number} width Width.
 * @param {number} height Height.
 */
export default function hexagonGrid(projection, zoom, R, offsetLeft, offsetTop, width, height) {
    const colWidth = 1.5 * R;
    const rowHeight = 1.5 * R;
    const cols = Math.floor((width + R / 2) / colWidth) + 1;
    const rows = Math.floor(height / rowHeight);

    const result = {type: 'FeatureCollection', features: []};

    let id = 0;
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            const horizontalShift = c % 2 === 0 ? 0 : -1 * sin(60);
            const x = c * 1.5;
            const y = r * (2 * sin(60)) + horizontalShift;
            const hexagon = [
                [cos(0) + x, sin(0) + y],
                [cos(60) + x, sin(60) + y],
                [cos(120) + x, sin(120) + y],
                [cos(180) + x, sin(180) + y],
                [cos(240) + x, sin(240) + y],
                [cos(300) + x, sin(300) + y],
                [cos(0) + x, sin(0) + y],
            ];

            const hexagonGlobals = hexagon.map(([x, y]) =>
                projection.fromGlobalPixels([offsetLeft + x * R, offsetTop + y * R], zoom),
            );

            result.features.push({
                type: 'Feature',
                id: 'hxg' + id++,
                geometry: {
                    type: 'Polygon',
                    coordinates: [hexagonGlobals],
                },
                properties: {},
            });
        }
    }
    return result;
}
