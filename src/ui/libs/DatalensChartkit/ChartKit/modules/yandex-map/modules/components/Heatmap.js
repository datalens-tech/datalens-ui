function defineHeatmap(ymaps) {
    /**
     * Heatmap module.
     * @module Heatmap
     * @requires option.Manager
     * @requires Monitor
     * @requires Layer
     * @requires heatmap.component.dataConverter
     * @requires heatmap.component.TileUrlsGenerator
     */
    ymaps.modules.define(
        'Heatmap',
        [
            'option.Manager',
            'Monitor',
            'Layer',
            'heatmap.component.dataConverter',
            'heatmap.component.TileUrlsGenerator',
        ],
        function (provide, OptionManager, Monitor, Layer, dataConverter, TileUrlsGenerator) {
            /**
             * @public
             * @function Heatmap
             * @description Heatmap constructor.
             *
             * @param {Object} [data] Points described using one of following formats:
             *  IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
             * @param {Object} [options] Object describing rendering options:
             *  {Number} [options.radius] - radius of point influence (px);
             *  {Boolean|Function} [options.dissipating=false] - true - disperse points
             *   on higher zoom levels according to radius, false - don't disperse;
             *  {Number} [opacity.options] - Heatmap opacity (from 0 to 1);
             *  {Number} [opacity.intensityOfMidpoint] - Intensity of median point (from 0 to 1);
             *  {Object} [opacity.gradient] - JSON description of gradient.
             */
            const Heatmap = function (data, options) {
                this._unprocessedPoints = [];
                if (data) {
                    this.setData(data);
                }

                this.options = new OptionManager(options);
            };

            /**
             * @public
             * @function getData
             * @description Returns reference to data provided to constructor or {@link Heatmap.setData} method.
             *
             * @returns {Object|null}
             */
            Heatmap.prototype.getData = function () {
                return this._data || null;
            };

            /**
             * @public
             * @function setData
             * @description Sets points. If `Heatmap` instance is already rendered, it will be re-rendered.
             *
             * @param {Object} data Points described using one of following formats:
             * IGeoObject, IGeoObject[], ICollection, ICollection[], GeoQueryResult, String|Object.
             * @returns {Heatmap} Self-reference.
             */
            Heatmap.prototype.setData = function (data) {
                this._data = data;

                const points = dataConverter.convert(data);
                if (this._tileUrlsGenerator) {
                    this._tileUrlsGenerator.setPoints(points);
                    this._refresh();
                } else {
                    this._unprocessedPoints = points;
                }
                return this;
            };

            /**
             * @public
             * @function getMap
             *
             * @returns {Map} reference to Map instance.
             */
            Heatmap.prototype.getMap = function () {
                return this._map;
            };

            /**
             * @public
             * @function setMap
             * @description Sets Map instance to render `Heatmap` object over it.
             *
             * @param {Map} map Map instance.
             * @returns {Heatmap} Self-reference.
             */
            Heatmap.prototype.setMap = function (map) {
                if (this._map != map) {
                    if (this._layer) {
                        this._map.layers.remove(this._layer);
                        this._destroyLayer();
                    }
                    this._map = map;
                    if (map) {
                        this._setupLayer();
                        this._map.layers.add(this._layer);
                    }
                }
                return this;
            };

            /**
             * @public
             * @function destroy
             * @description Destructs Heatmap instance.
             */
            Heatmap.prototype.destroy = function () {
                this._data = null;
                this.setMap(null);
            };

            /**
             * @private
             * @function _refresh
             * @description Re-renders Heatmap.
             *
             * @returns {Heatmap} Self-reference.
             */
            Heatmap.prototype._refresh = function () {
                if (this._layer) {
                    this._layer.update();
                }
                return this;
            };

            /**
             * @private
             * @function _setupLayer
             * @description Sets up associated map layer.
             *
             * @returns {Layer} Layer instance.
             */
            Heatmap.prototype._setupLayer = function () {
                this._setupTileUrlsGenerator();
                const getTileUrl = this._tileUrlsGenerator.getTileUrl.bind(this._tileUrlsGenerator);

                this._layer = new Layer(getTileUrl, {tileTransparent: true});
                this._setupOptionMonitor();

                return this._layer;
            };

            /**
             * @private
             * @function _destroyLayer
             * @description Destroys associated layer instance.
             */
            Heatmap.prototype._destroyLayer = function () {
                this._destroyTileUrlsGenerator();
                this._destroyOptionMonitor();
                this._layer = null;
            };

            /**
             * @private
             * @function _setupTileUrlsGenerator
             * @description Sets up tile URL generator.
             *
             * @returns {TileUrlsGenerator} Tile URL generator.
             */
            Heatmap.prototype._setupTileUrlsGenerator = function () {
                this._tileUrlsGenerator = new TileUrlsGenerator(
                    this._map.options.get('projection'),
                    this._unprocessedPoints,
                );
                this._unprocessedPoints = null;

                this._tileUrlsGenerator.options.setParent(this.options);

                return this._tileUrlsGenerator;
            };

            /**
             * @private
             * @function _destroyTileUrlsGenerator
             * @description Destroys tile URL generator.
             */
            Heatmap.prototype._destroyTileUrlsGenerator = function () {
                this._unprocessedPoints = this._tileUrlsGenerator.getPoints();
                this._tileUrlsGenerator.destroy();
                this._tileUrlsGenerator = null;
            };

            /**
             * @private
             * @function _setupOptionMonitor
             * @description Sets up options monitor.
             *
             * @returns {Monitor} Options monitor.
             */
            Heatmap.prototype._setupOptionMonitor = function () {
                this._optionMonitor = new Monitor(this.options);

                return this._optionMonitor.add(
                    ['radius', 'dissipating', 'opacity', 'intensityOfMidpoint', 'gradient'],
                    this._refresh,
                    this,
                );
            };

            /**
             * @private
             * @function _destroyOptionMonitor
             * @description Destroys options monitor.
             */
            Heatmap.prototype._destroyOptionMonitor = function () {
                this._optionMonitor.removeAll();
                this._optionMonitor = {};
            };

            provide(Heatmap);
        },
    );
}
export default defineHeatmap;
