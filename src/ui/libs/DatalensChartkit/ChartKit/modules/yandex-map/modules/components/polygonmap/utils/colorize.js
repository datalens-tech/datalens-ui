import colormap from 'colormap';

/**
 * Polygon colorize.
 * Needed for coloring polygons as you need.
 */
class Colorize {
    /**
     * @param {number} min Min value.
     * @param {number} max Max value.
     * @param {object} options Setting for generate colormap.
     * @param {string|array} options.colorScheme Sheme of colormap or array of custom colors (from light to dark).
     * @param {number|array} options.colorRanges Count of ranges to automaticly generate or custom array
     * of ranges (from light to dark).
     */
    constructor(min, max, options) {
        if (typeof min !== 'number') {
            throw new Error('Wrong "min" value');
        }
        if (typeof max !== 'number') {
            throw new Error('Wrong "max" value');
        }

        this._min = min;
        this._max = max;

        if (typeof options.colorRanges === 'object') {
            this._ranges = options.colorRanges;
            this._rangesCount = this._ranges.length;
        } else {
            this._rangesCount = options.colorRanges;
            this._ranges = this._createRangesArray();
        }

        this._colors =
            typeof options.colorScheme === 'object'
                ? options.colorScheme
                : colormap({
                      colormap: options.colorScheme,
                      nshades: this._rangesCount,
                  }).reverse();

        if (this._colors.length !== this._rangesCount) {
            throw new Error('The length of the colorScheme array and ranges must be equal');
        }
    }

    /**
     * Create array for ranges depending on rangesCount.
     * @returns {Array.<*>} Return array of ranges.
     * @private
     */
    _createRangesArray() {
        const arr = [];
        const step = Math.floor((this._max - this._min) / this._rangesCount, 10);

        for (let i = 1; i < this._rangesCount; i++) {
            arr.push(this._min + i * step);
        }

        arr.push(this._max + 1);

        return arr;
    }

    /**
     * @returns {Array} Return generated array of colors.
     */
    getColorMap() {
        return this._colors;
    }

    /**
     * @returns {Array} Return generated array of ranges.
     */
    getColorRanges() {
        return this._ranges;
    }

    /**
     * Return color depending on count of points inside polygon
     * @param {number} pointsCount=0 Count of point inside polygon.
     * @returns {string} Return color.
     */
    getColor(pointsCount = 0) {
        let color = this._colors[0];

        for (let i = 0; i < this._rangesCount; i++) {
            if (pointsCount > this._ranges[i - 1] && pointsCount <= this._ranges[i]) {
                color = this._colors[i];
                break;
            }
        }

        return color;
    }
}

export default Colorize;
