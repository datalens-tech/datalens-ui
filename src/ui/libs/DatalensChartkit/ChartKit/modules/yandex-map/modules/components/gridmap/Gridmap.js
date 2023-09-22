import get from 'lodash/get';

import definePolygonmap from '../polygonmap/Polygonmap';

import hexagonGrid from './utils/hexagonGrid';
import squareGrid from './utils/squareGrid';

function define(ymaps) {
    definePolygonmap(ymaps);

    /**
     * Gridmap module.
     *
     * @module Gridmap
     * @requires Polygonmap
     * @requires util.bounds
     */
    ymaps.modules.define(
        'Gridmap',
        ['Polygonmap', 'util.bounds'],
        (provide, Polygonmap, bounds) => {
            /**
             * getRequiredOption
             * @param {Object} options Options.
             * @param {string} path Name of option.
             * @returns {*} Value of option.
             */
            function getRequiredOption(options, path) {
                const value = get(options, path);
                if (!value) {
                    throw new Error(`options.${path} is required parameter`);
                }
                return value;
            }

            /**
             * @typedef {Object} GridBounds
             * @property {number[]} leftBotom Geographical coordinate of the left bottom point.
             * @property {number[]} rigthTop Geographical coordinate of the right top point.
             */

            /**
             * @typedef {Object} GridOptions
             * @property {string} type Type of grid.
             * @property {GridBounds=} bounds Bounds for grid.
             * @property {HexagonGripParams|SquareGripParams} params Params of grid.
             */

            /**
             * @typedef {Object} HexagonGripParams
             * @property {number} bigRadius Length of the big radius of a hexagon in pixels.
             */

            /**
             * @typedef {Object} SquareGripParams
             * @property {number} sideLenght Length of a side of square in pixels.
             */

            /**
             *
             * @param {Object} [data] Points, GeoJSON FeatureCollections.
             * @param {Object} data.polygons GeoJSON FeatureCollections.
             * @param {Object} data.points GeoJSON FeatureCollections.
             * @param {Object} [options] Options for customization.
             * @param {number} [options.zoom] Zoom which will be used for the grid calculation.
             * @param {GridOptions} [options.grid] Options which will be used in a grid calculation.
             * @param {GridOptions} [options.grid.type] Type of grid. Can be "hexagon" | "square".
             * @param {GridParamsOptions} [options.grid.params] Options which will be used in a grid render
             * @param {number} [options.grid.params.bigRadius] Radius of hexagon.
             * @param {number} [options.grid.params.sideLength] Side length of square.
             * @param {GridBoundsOptions} [options.grid.bouds] Options of bound for render grid.
             * @param {number} [options.grid.bouds] Options of bound for render grid.
             * @param {Array} [options.grid.bouds.leftBottom] Coordinates of left bottom point of bound.
             * @param {Array} [options.grid.bouds.topRight] Coordinates of right top point of bound.
             * @alias module:Gridmap
             */
            class Gridmap {
                constructor(data, options) {
                    this._data = data;
                    this.options = options;
                }

                /**
                 * Set Map instance to render Polygonmap object.
                 *
                 * @public
                 * @param {Map} map Map instance.
                 * @returns {Gridmap|Polygonmap} Self-reference.
                 */
                setMap(map) {
                    if (this._map !== map) {
                        this._map = map;

                        if (map && this._data) {
                            this._render();
                            return this._polygonmap;
                        }
                    }

                    return this;
                }

                /**
                 * Get the Map instance.
                 *
                 * @public
                 * @returns {Map} Reference to Map instance.
                 */
                getMap() {
                    return this._map;
                }

                /**
                 * Render Polygonmap.
                 *
                 * @private
                 */
                _render() {
                    const points = this._data;
                    const zoom = getRequiredOption(this.options, 'zoom');
                    const projection = this._map.options.get('projection');

                    let leftBottom;
                    let rightTop;

                    if (get(this.options, 'grid.bounds')) {
                        leftBottom = getRequiredOption(this.options, 'grid.bounds.leftBottom');
                        rightTop = getRequiredOption(this.options, 'grid.bounds.rightTop');
                    } else {
                        const coords = points.features.map(
                            ({geometry: {coordinates}}) => coordinates,
                        );
                        [leftBottom, rightTop] = bounds.fromPoints(coords, projection);
                    }

                    const [left, bottom] = projection.toGlobalPixels(leftBottom, zoom);
                    const [right, top] = projection.toGlobalPixels(rightTop, zoom);
                    const width = right - left;
                    const height = bottom - top;
                    const gripType = getRequiredOption(this.options, 'grid.type');

                    let polygons;

                    switch (gripType) {
                        case 'hexagon': {
                            const bigRadius = getRequiredOption(
                                this.options,
                                'grid.params.bigRadius',
                            );
                            polygons = hexagonGrid(
                                projection,
                                zoom,
                                bigRadius,
                                left,
                                top,
                                width,
                                height,
                            );
                            break;
                        }
                        case 'square': {
                            const sideWidth = getRequiredOption(
                                this.options,
                                'grid.params.sideLength',
                            );
                            polygons = squareGrid(
                                projection,
                                zoom,
                                sideWidth,
                                left,
                                top,
                                width,
                                height,
                            );
                            break;
                        }
                        default: {
                            throw new Error(`Unsupported grid's type ${gripType}`);
                        }
                    }

                    this._polygonmap = new Polygonmap({polygons, points}, this.options);

                    this._polygonmap.setMap(this._map);
                }
            }

            provide(Gridmap);
        },
    );
}

export default define;
