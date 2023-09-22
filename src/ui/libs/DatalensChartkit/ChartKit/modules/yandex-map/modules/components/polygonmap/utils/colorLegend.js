import './colorLegend.css';

/**
 * @module colorLegend
 * Add color legend to map.
 */

/**
 * Init colorLegend.
 * @param {Polygonmap} polygonmap Instance of polygonemap.
 */
const init = (polygonmap) => {
    const show = polygonmap.options.get('showLegend');

    if (!show) return;

    const template = polygonmap.options.get('legendTemplate');
    const map = polygonmap.getMap();
    const colorScheme = polygonmap.colorize.getColorMap();
    const colorRanges = polygonmap.colorize.getColorRanges();

    const colors = colorScheme.map((el, i) => {
        return {
            name: el,
            value: colorRanges[i],
            opacity: polygonmap.options.get('colorOpacity'),
        };
    });

    const CustomControlClass = function (options) {
        CustomControlClass.superclass.constructor.call(this, options);
    };

    const ymaps = polygonmap.getYMaps();

    ymaps.util.augment(CustomControlClass, ymaps.collection.Item, {
        onAddToMap(map) {
            CustomControlClass.superclass.onAddToMap.call(this, map);
            this.getParent().getChildElement(this).then(this._onGetChildElement, this);
            polygonmap._legendControl = this;
        },
        _onGetChildElement(parentDomContainer) {
            const legend = document.createElement('div');
            legend.className = 'ymaps-color-legend';
            legend.innerHTML = template.call(polygonmap, colors);

            parentDomContainer.appendChild(legend);
        },
    });

    const customControl = new CustomControlClass();

    map.controls.add(customControl, {
        float: 'none',
        position: polygonmap.options.get('legendPosition'),
    });
};

/**
 * Function for generate html template of legend.
 * @param {Object} colors Object of colors and values.
 * @returns {string} Rendered html template.
 * @this Polygonmap
 */
const defaultTemplate = function (colors) {
    const fillBy = this.options.get('fillBy');
    const fillByWeight = fillBy === 'weight';
    const colorRangesMinimum = this.options.get('colorRangesMinimum');
    const min =
        colorRangesMinimum === 'min'
            ? fillByWeight
                ? this.pointsWeightMinimum
                : this.pointsCountMinimum
            : colorRangesMinimum;

    return `
        <div class="legend">
            ${colors
                .map(
                    (color, i) => `
                <div class="legend__row">
                    <span class="legend__value">
                        ${
                            colors[i - 1]
                                ? `${colors[i - 1].value + 1} - ${color.value}`
                                : `${min} - ${color.value}`
                        }
                    </span>
                    <span class="legend__color" style="background: ${color.name}; opacity: ${
                        color.opacity
                    }"></span>
                </div>
            `,
                )
                .join('\n')}
        </div>
    `;
};

export default {init, defaultTemplate};
