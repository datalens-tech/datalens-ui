function defineCanvas(ymaps) {
    /**
     * Heatmap rendering onto canvas module. Allows to get Headmap as Data URL.
     * @module heatmap.component.Canvas
     * @requires option.Manager
     * @requires Monitor
     */
    ymaps.modules.define(
        'heatmap.component.Canvas',
        ['option.Manager', 'Monitor'],
        function (provide, OptionManager, Monitor) {
            /**
             * @constant DEFAULT_OPTIONS
             * @description Default Heatmap options.
             */
            const DEFAULT_OPTIONS = {
                // Point radius.
                radius: 10,
                // Radius factor.
                radiusFactor: 1,
                // Map layer opacity.
                opacity: 0.8,
                // Median point intencity.
                intensityOfMidpoint: 0.2,
                // Median of points weights.
                medianaOfWeights: 1,
                // Gradient.
                gradient: {
                    0.1: 'rgba(128, 255, 0, 0.7)',
                    0.2: 'rgba(255, 255, 0, 0.8)',
                    0.7: 'rgba(234, 72, 58, 0.9)',
                    1.0: 'rgba(162, 36, 25, 1)',
                },
            };

            /**
             * @constant EMPTY_PNG
             * @description Empty transparent png
             */
            const EMPTY_PNG =
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAABFUlEQVR4nO3BMQEAAADCoPVP7WsIoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAeAMBPAABPO1TCQAAAABJRU5ErkJggg==';

            /**
             * @public
             * @function Canvas
             * @description Heatmap rendering module constructor.
             *
             * @param {Number[]} size Heatmap size, [width, height].
             */
            const Canvas = function (size) {
                this._canvas = document.createElement('canvas');
                this._canvas.width = size[0];
                this._canvas.height = size[1];

                this._context = this._canvas.getContext('2d');

                this.options = new OptionManager({});

                this._setupDrawTools();
                this._setupOptionMonitor();
            };

            /**
             * @public
             * @function getBrushRadius
             * @description Returns brush size to use for points drawing.
             *
             * @returns {Number} margin.
             */
            Canvas.prototype.getBrushRadius = function () {
                return (
                    this.options.get('radius', DEFAULT_OPTIONS.radius) *
                    this.options.get('radiusFactor', DEFAULT_OPTIONS.radiusFactor)
                );
            };

            /**
             * @public
             * @function generateDataURLHeatmap
             * @description Returns Generates Heatmap and returns as Data URL
             *
             * @param {Number[][]} points Array of points [[x1, y1], [x2, y2], ...].
             * @returns {String} Data URL.
             */
            Canvas.prototype.generateDataURLHeatmap = function (points) {
                if (points && points.length > 0) {
                    this._drawHeatmap(points);
                    return this._canvas.toDataURL();
                } else {
                    return EMPTY_PNG;
                }
            };

            /**
             * @public
             * @function destroy
             * @description Destroys module.
             */
            Canvas.prototype.destroy = function () {
                this._destroyOptionMonitor();
                this._destroyDrawTools();
            };

            /**
             * @private
             * @function _setupOptionMonitor
             * @description Sets up Heatmap options monitor.
             *
             * @returns {Monitor} Options monitor.
             */
            Canvas.prototype._setupOptionMonitor = function () {
                this._optionMonitor = new Monitor(this.options);

                return this._optionMonitor.add(
                    ['radius', 'radiusFactor', 'gradient'],
                    this._setupDrawTools,
                    this,
                );
            };

            /**
             * @private
             * @function _destroyOptionMonitor
             * @description Destroys options monitor.
             */
            Canvas.prototype._destroyOptionMonitor = function () {
                this._optionMonitor.removeAll();
                this._optionMonitor = {};
            };

            /**
             * @private
             * @function _setupDrawTools
             * @description Sets up internal components.
             *
             * @returns {Canvas} Canvas instanse.
             */
            Canvas.prototype._setupDrawTools = function () {
                this._brush = this._createBrush();
                this._gradient = this._createGradient();

                return this;
            };

            /**
             * @private
             * @function _destroyDrawTools
             * @description Destroys internal components.
             */
            Canvas.prototype._destroyDrawTools = function () {
                this._brush = null;
                this._gradient = null;
            };

            /**
             * @private
             * @function _createBrush
             * @description Creates brush to draw points.
             *
             * @returns {HTMLElement} brush Canvas with brush pattern.
             */
            Canvas.prototype._createBrush = function () {
                const brush = document.createElement('canvas');
                const context = brush.getContext('2d');

                const radius = this.getBrushRadius();
                const gradient = context.createRadialGradient(
                    radius,
                    radius,
                    0,
                    radius,
                    radius,
                    radius,
                );

                brush.width = 2 * radius;
                brush.height = 2 * radius;

                gradient.addColorStop(0, 'rgba(0,0,0,1)');
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                context.fillStyle = gradient;
                context.fillRect(0, 0, 2 * radius, 2 * radius);

                return brush;
            };

            /**
             * @private
             * @function _createGradient
             * @description Creates 256x1 px gradient to draw Heatmap.
             *
             * @returns {Number[]} Image data.
             */
            Canvas.prototype._createGradient = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                const gradient = context.createLinearGradient(0, 0, 0, 256);

                canvas.width = 1;
                canvas.height = 256;

                const gradientOption = this.options.get('gradient', DEFAULT_OPTIONS.gradient);
                for (const i in gradientOption) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (gradientOption.hasOwnProperty(i)) {
                        gradient.addColorStop(i, gradientOption[i]);
                    }
                }

                context.fillStyle = gradient;
                context.fillRect(0, 0, 1, 256);

                return context.getImageData(0, 0, 1, 256).data;
            };

            /**
             * @private
             * @function _drawHeatmap
             * @description Draws Heatmap.
             *
             * @returns {Canvas} Canvas.
             */
            Canvas.prototype._drawHeatmap = function (points) {
                const context = this._context;
                const radius = this.getBrushRadius();

                const intensityOfMidpoint = this.options.get(
                    'intensityOfMidpoint',
                    DEFAULT_OPTIONS.intensityOfMidpoint,
                );
                const medianaOfWeights = this.options.get(
                    'medianaOfWeights',
                    DEFAULT_OPTIONS.medianaOfWeights,
                );
                // Factor to set median intensity.
                const weightFactor = intensityOfMidpoint / medianaOfWeights;

                context.clearRect(0, 0, this._canvas.width, this._canvas.height);

                for (let i = 0, length = points.length; i < length; i++) {
                    context.globalAlpha = Math.min(points[i].weight * weightFactor, 1);
                    context.drawImage(
                        this._brush,
                        points[i].coordinates[0] - radius,
                        points[i].coordinates[1] - radius,
                    );
                }

                const heatmapImage = context.getImageData(
                    0,
                    0,
                    this._canvas.width,
                    this._canvas.height,
                );
                this._colorize(heatmapImage.data);
                context.putImageData(heatmapImage, 0, 0);

                return this;
            };

            /**
             * @private
             * @function _colorize
             * @description Paints Heatmap pixels.
             *
             * @param {Number[]} pixels Colorless Heatmap as pixel data.
             * @param {Number[]} gradient Gradient as pixel data.
             */
            Canvas.prototype._colorize = function (pixels) {
                const opacity = this.options.get('opacity', DEFAULT_OPTIONS.opacity);
                for (let i = 3, length = pixels.length, j; i < length; i += 4) {
                    if (pixels[i]) {
                        // Obtain a color in gradient by transparency.
                        j = 4 * pixels[i];
                        pixels[i - 3] = this._gradient[j];
                        pixels[i - 2] = this._gradient[j + 1];
                        pixels[i - 1] = this._gradient[j + 2];

                        // Sets layer opacity.
                        pixels[i] = opacity * (this._gradient[j + 3] || 255);
                    }
                }
            };

            provide(Canvas);
        },
    );
}

export default defineCanvas;
