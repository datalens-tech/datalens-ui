import colorLegend from './utils/colorLegend';
import Colorize from './utils/colorize';
import defaultBalloonContent from './utils/defaultBalloonContent';
import defaultFilter from './utils/defaultFilter';
import defaultMapper from './utils/defaultMapper';
import defaultOnClick from './utils/defaultOnClick';
import defaultOnMouseEnter from './utils/defaultOnMouseEnter';
import defaultOnMouseLeave from './utils/defaultOnMouseLeave';
import inside from './utils/inside';
import normalizeFeature from './utils/normalizeFeature';

function define(ymaps) {
    /**
     * Polygonmap module.
     *
     * @module Polygonmap
     * @requires option.Manager
     * @requires ObjectManager
     */
    ymaps.modules.define(
        'Polygonmap',
        ['meta', 'option.Manager', 'ObjectManager'],
        (provide, meta, OptionManager, ObjectManager) => {
            /**
             * @param {Object} [data] Polygons and points.
             * @param {Object} data.polygons GeoJSON FeatureCollections.
             * @param {Object} data.points GeoJSON FeatureCollections.
             * @param {Object} [options] Options for customization.
             * @param {function} [options.mapper=defaultMapper] Function of iterative transformation of features.
             * @param {string} [options.fillBy=points] Calculate the color by points | weight.
             * @param {string} [options.fillByWeightProp=weight] Prop name in data object, for weight value.
             * If fillBy is "weight".
             * @param {string} [options.fillByWeightType=middle] Type of calculate color by weight. Can be middle | maximum
             * @param {number|string} [options.colorRangesMinimum=0] Minimal value for ranges.
             * Set to 'min' for auto calculating minimal value.
             * @param {number|array} [options.colorRanges=4] Count of ranges or array of custom ranges.
             * @param {string|array} [options.colorScheme=['#e66a54', '#ce4356', '#ab2960', '#571756']]
             * Preset for colorize or array of custom colors.
             * @param {number} [options.fillOpacity=0.8] Opacity of polygon.
             * @param {string} [options.fillColorEmptyPolygon=#f4f6f8] Color of polygon
             * where points count equal 0.
             * @param {string} [options.strokeColor=#fff] Color of polygon stroke.
             * @param {number} [options.strokeWidth=1] Width of polygon stroke.
             * @param {boolean} [options.showLegend=true] Flag to show color legend.
             * @param {function} [options.legendTemplate=colorLegend.defaultTemplate] Receives object {color: value}
             * returns html legend template.
             * @param {object} [options.legendPosition=top: 10, right: 10] Position of legend,
             * you can only change the top or bottom and right or left.
             * @param {function} [options.filter=undefined] Function for custom filter polygons with points.
             * @param {boolean} [options.filterEmptyPolygons=false] Flag for show polygon with count of points equal 0.
             * @param {function} [options.onMouseEnter=defaultOnMouseEnter] Handler for mouseEnter event.
             * @param {function} [options.onMouseLeave=defaultOnMouseLeave] Handler for mouseLeave event.
             * @param {function} [options.onClick=defaultOnClick] Handler for click event.
             * @param {function} [options.balloonContent=defaultBalloonContent] Function for render content of baloon.
             * Recieves object with properties of polygon.
             * @param {string} [options.fillColorHover] Color of polygon on polygon hover.
             * @param {number} [options.fillOpacityHover=0.9] Number of opacity on polygon hover.
             * @param {string} [options.strokeColorHover] Color of polygon stroke on polygon hover.
             * @param {number} [options.strokeWidthHover=2] Number of stroke width on polygon hover.
             * @param {string} [options.fillColorActive] Color of polygon on polygon active.
             * @param {number} [options.fillOpacityActive=0.9] Number of opacity on polygon active.
             * @param {string} [options.strokeColorActive] Color of polygon stroke on polygon active.
             * @param {number} [options.strokeWidthActive=2] Number of stroke width on polygon active.
             * @param {boolean} [options.interactivity=true] Flag for enable interactivity.
             *
             * @alias module:Polygonmap
             */
            class Polygonmap {
                constructor(data, options = {}) {
                    const defaultOptions = new OptionManager({
                        mapper: defaultMapper,
                        fillBy: 'points',
                        fillByWeightProp: 'weight',
                        fillByWeightType: 'middle',
                        colorRangesMinimum: 0,
                        colorRanges: 4,
                        colorScheme: ['#e66a54', '#ce4356', '#ab2960', '#571756'],
                        fillOpacity: 0.8,
                        fillColorEmptyPolygon: '#f4f6f8',
                        strokeColor: '#fff',
                        strokeWidth: 1,
                        showLegend: true,
                        legendTemplate: colorLegend.defaultTemplate,
                        legendPosition: {
                            top: 10,
                            right: 10,
                        },
                        // Since the default filter for empty polygons is disabled by default,
                        // this option will be undefined.
                        filter: undefined,
                        filterEmptyPolygons: false,
                        onMouseEnter: defaultOnMouseEnter,
                        onMouseLeave: defaultOnMouseLeave,
                        onClick: defaultOnClick,
                        balloonContent: defaultBalloonContent,
                        fillColorHover: undefined,
                        fillOpacityHover: 0.9,
                        strokeColorHover: '#fff',
                        strokeWidthHover: 2,
                        fillColorActive: undefined,
                        fillOpacityActive: 0.9,
                        strokeColorActive: '#fff',
                        strokeWidthActive: 2,
                        interactivity: true,
                    });

                    this._initOptions(options, defaultOptions);
                    this.setData(data);
                }

                /**
                 * Get Yandex Maps main class.
                 *
                 * @public
                 * @returns {YMaps} Reference to YMaps.
                 */
                getYMaps() {
                    return ymaps;
                }

                /**
                 * Get the data, polygons and points.
                 *
                 * @public
                 * @returns {Object} Polygons and points.
                 */
                getData() {
                    return this._data || null;
                }

                /**
                 * Set the data, polygons and points.
                 *
                 * @public
                 * @param {Object} data Polygons and points.
                 * @param {Object} data.polygons GeoJSON FeatureCollections.
                 * @param {Object} data.points GeoJSON FeatureCollections.
                 * @returns {Polygonmap} Self-reference.
                 */
                setData(data) {
                    this._data = data;

                    if (data) {
                        this._data = {
                            points: {type: 'FeatureCollection', features: []},
                            polygons: {type: 'FeatureCollection', features: []},
                        };
                        this._prepare(data);
                        this._initObjectManager();
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
                 * Set Map instance to render Polygonmap object.
                 *
                 * @public
                 * @param {Map} map Map instance.
                 * @returns {Polygonmap} Self-reference.
                 */
                setMap(map) {
                    if (this._map !== map) {
                        this._map = map;

                        if (map && this._data) {
                            this._render();
                        }
                    }

                    return this;
                }

                /**
                 * Destructs Polygonmap instance.
                 *
                 * @public
                 */
                destroy() {
                    this.setData(null);
                    this.objectManager.removeAll();
                    this._legendControl.setParent(null);
                    this.balloon.close();
                    this.setMap(null);
                }

                /**
                 * Prepare for render Polygonmap.
                 *
                 * @private
                 * @param {Object} data Polygons and points.
                 * @param {Object} data.polygons GeoJSON FeatureCollections.
                 * @param {Object} data.points GeoJSON FeatureCollections.
                 * @returns {undefined}
                 */
                _prepare(data) {
                    if (
                        data.polygons.type === 'FeatureCollection' &&
                        data.points.type === 'FeatureCollection'
                    ) {
                        const polygonFeatures = data.polygons.features;

                        const fillBy = this.options.get('fillBy');
                        const fillByWeightType = this.options.get('fillByWeightType');
                        const fillByWeightProp = this.options.get('fillByWeightProp');

                        let pointFeatures = data.points.features;

                        for (let i = 0; i < polygonFeatures.length; i++) {
                            const restPointFeatures = [];
                            const polygonFeature = normalizeFeature(polygonFeatures[i], meta, {
                                id: i,
                            });

                            polygonFeature.properties = polygonFeature.properties || {};

                            if (
                                typeof polygonFeature.properties.pointsCount !== 'number' &&
                                typeof polygonFeature.properties.pointsWeight !== 'number'
                            ) {
                                let pointsCount = 0;
                                let pointsWeight = 0;

                                for (let j = 0; j < pointFeatures.length; j++) {
                                    let pointFeature;

                                    if (i === 0) {
                                        pointFeature = normalizeFeature(pointFeatures[j], meta, {
                                            id: j,
                                        });
                                        this._data.points.features.push(pointFeature);
                                    } else {
                                        pointFeature = pointFeatures[j];
                                    }

                                    if (inside(polygonFeature.geometry, pointFeature.geometry)) {
                                        pointsCount++;
                                        pointsWeight += pointFeature.properties[fillByWeightProp];
                                    } else {
                                        restPointFeatures.push(pointFeature);
                                    }
                                }

                                pointFeatures = restPointFeatures;

                                if (fillBy === 'weight') {
                                    pointsWeight =
                                        fillByWeightType === 'middle'
                                            ? pointsWeight === 0 && pointsCount === 0
                                                ? 0
                                                : pointsWeight / pointsCount
                                            : pointsWeight;
                                }

                                polygonFeature.properties.pointsCount = pointsCount;
                                polygonFeature.properties.pointsWeight = pointsWeight;
                            }

                            this._calculator(polygonFeature, {fillBy});

                            this._data.polygons.features.push(polygonFeature);
                        }
                    }
                }

                /**
                 * Calculator for feture values.
                 *
                 * @param {Object} feature GeoJSON FeatureCollection.
                 * @param {Object} options Options for calculating.
                 * @private
                 */
                _calculator(feature, options) {
                    const {pointsCount} = feature.properties;
                    const {pointsWeight} = feature.properties;
                    const {fillBy} = options;

                    if (
                        typeof this.pointsCountMinimum === 'undefined' ||
                        pointsCount <= this.pointsCountMinimum
                    ) {
                        this.pointsCountMinimum = pointsCount;
                    }

                    if (
                        typeof this.pointsCountMaximum === 'undefined' ||
                        pointsCount >= this.pointsCountMaximum
                    ) {
                        this.pointsCountMaximum = pointsCount;
                    }

                    if (fillBy === 'weight') {
                        if (
                            typeof this.pointsWeightMinimum === 'undefined' ||
                            pointsWeight <= this.pointsWeightMinimum
                        ) {
                            this.pointsWeightMinimum = pointsWeight;
                        }

                        if (
                            typeof this.pointsWeightMaximum === 'undefined' ||
                            pointsWeight >= this.pointsWeightMaximum
                        ) {
                            this.pointsWeightMaximum = pointsWeight;
                        }
                    }
                }

                /**
                 * Render ObjectManager.
                 *
                 * @private
                 */
                _render() {
                    if (this.options.get('interactivity')) {
                        this._initInteractivity();
                    }

                    this._map.geoObjects.add(this.objectManager);
                    colorLegend.init(this);
                }

                /**
                 * Init Options.
                 *
                 * @param {Object} options Options.
                 * @param {Object} defaultOptions Default options.
                 * @private
                 */
                _initOptions(options, defaultOptions) {
                    this.options = new OptionManager(options, defaultOptions);

                    const mapper = this.options.get('mapper');
                    const filterEmptyPolygons = this.options.get('filterEmptyPolygons');
                    const colorScheme = this.options.get('colorScheme');
                    const colorRanges = this.options.get('colorRanges');
                    const onMouseEnter = this.options.get('onMouseEnter');
                    const onMouseLeave = this.options.get('onMouseLeave');
                    const onClick = this.options.get('onClick');

                    this.options.set('mapper', mapper.bind(this));

                    if (filterEmptyPolygons) {
                        this.options.set('filter', defaultFilter.bind(this));
                    }

                    if (
                        typeof options.colorRanges === 'undefined' &&
                        colorRanges !== colorScheme.length
                    ) {
                        this.options.set('colorRanges', colorScheme.length);
                    }

                    this.options.set('onMouseEnter', onMouseEnter.bind(this));
                    this.options.set('onMouseLeave', onMouseLeave.bind(this));
                    this.options.set('onClick', onClick.bind(this));
                }

                /**
                 * Init ObjectManager.
                 *
                 * @private
                 */
                _initObjectManager() {
                    const mapper = this.options.get('mapper');
                    const filter = this.options.get('filter');
                    const fillBy = this.options.get('fillBy');
                    const fillByWeight = fillBy === 'weight';
                    const colorRangesMinimum = this.options.get('colorRangesMinimum');

                    if (colorRangesMinimum === 'min') {
                        delete this.pointsCountMinimum;
                        delete this.pointsWeightMinimum;

                        const reducer = (acc, feature) => {
                            if (!filter || filter(feature)) {
                                this._calculator(feature, {fillBy});

                                acc.push(feature);
                            }

                            return acc;
                        };

                        this._data.polygons.features = this._data.polygons.features.reduce(
                            reducer,
                            [],
                        );
                    }

                    try {
                        this.colorize = new Colorize(
                            colorRangesMinimum === 'min'
                                ? fillByWeight
                                    ? this.pointsWeightMinimum
                                    : this.pointsCountMinimum
                                : colorRangesMinimum,
                            fillByWeight ? this.pointsWeightMaximum : this.pointsCountMaximum,
                            {
                                colorScheme: this.options.get('colorScheme'),
                                colorRanges: this.options.get('colorRanges'),
                            },
                        );
                    } catch (error) {
                        console.error(error);
                    }

                    const reducer = (acc, feature) => {
                        if (!filter || filter(feature)) {
                            if (mapper) {
                                acc.push(mapper(feature));
                            } else {
                                acc.push(feature);
                            }

                            this._calculator(feature, {fillBy});
                        }

                        return acc;
                    };

                    this._data.polygons.features = this._data.polygons.features.reduce(reducer, []);

                    this.objectManager = new ObjectManager();
                    this.objectManager.add(this._data.polygons);
                }

                /**
                 * Init interactivity.
                 *
                 * @private
                 */
                _initInteractivity() {
                    this._prevObjectId = null;
                    this.balloon = new ymaps.Balloon(this._map);

                    const onMouseEnter = this.options.get('onMouseEnter');
                    const onMouseLeave = this.options.get('onMouseLeave');
                    const onClick = this.options.get('onClick');

                    this.objectManager.events.add('mouseenter', onMouseEnter);

                    this.objectManager.events.add('mouseleave', onMouseLeave);

                    this.balloon.options.setParent(this._map.options);

                    this.objectManager.events.add('click', onClick);
                }
            }

            provide(Polygonmap);
        },
    );
}

export default define;
