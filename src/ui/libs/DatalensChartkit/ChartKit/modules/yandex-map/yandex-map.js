import block from 'bem-cn-lite';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import merge from 'lodash/merge';

import logger from '../../../../logger';
import {getRandomCKId} from '../../helpers/getRandomCKId';
import {ChartKitCustomError, ERROR_CODE} from '../chartkit-custom-error/chartkit-custom-error';
import Performance from '../perfomance';

import {fetchScript, numberFormat} from './helpers/';
import defineGridmap from './modules/components/gridmap/Gridmap';
import defaultMapper from './modules/components/polygonmap/utils/defaultMapper';
import defineModules from './modules/modules';

import './yandex-map.scss';
import '../graph/graph.scss';

// TODO: CHARTS-4847
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

const ONLOAD = '__chartkit_ymaps_onload';
const ONERROR = '__chartkit_ymaps_onerror';

function getFetchUrl(lang, apiKey = '') {
    const apiKeyParam = apiKey ? `&apikey=${apiKey}` : '';

    return (
        'https://api-maps.yandex.ru/2.1' +
        `?lang=${lang}_RU` + //https://yandex.ru/dev/maps/jsapi/doc/2.1/dg/concepts/localization.html
        `${apiKeyParam}` +
        `&mode=${IS_DEVELOPMENT ? 'debug' : 'release'}` +
        '&ns=' + // an empty value to prevent the API fall into the global scope
        `&onload=${ONLOAD}` +
        `&onerror=${ONERROR}`
    );
}

function combinedMapper(feature) {
    const mappedFeature = defaultMapper.call(this, feature);
    const nameProperty = this.options.get('nameProperty');
    const name = nameProperty ? mappedFeature.properties[nameProperty] : undefined;
    return merge({}, mappedFeature, {
        properties: {
            name,
            text: this.options.get('valuesText'),
            value:
                this.options.get('fillBy') === 'weight'
                    ? mappedFeature.properties.pointsWeight
                    : mappedFeature.properties.pointsCount,
        },
    });
}

// the case of Wizard graphs, where polygonmap is used without points/values and everything is set manually
// CHARTS-3100
function combinedMapperNoPoints(feature) {
    const mappedFeature = defaultMapper.call(this, feature);
    const nameProperty = this.options.get('nameProperty');
    const name = nameProperty ? mappedFeature.properties[nameProperty] : undefined;
    return merge({}, mappedFeature, {
        properties: {
            name,
            text: this.options.get('valuesText'),
        },
    });
}

function arrayOfArraysToPointsCollection(points) {
    return {
        type: 'FeatureCollection',
        features: points.map(([coordA, coordB, weight]) => {
            return {
                geometry: {
                    coordinates: [coordA, coordB],
                    type: 'Point',
                },
                properties: {weight},
                type: 'Feature',
            };
        }),
    };
}

export const GEO_OBJECT_TYPE = {
    POLYGONMAP: 'polygonmap',
    GRIDMAP: 'gridmap',
    HEATMAP: 'heatmap',
    GEOCOLLECTION: 'geocollection',
};

const b = block('chartkit-tooltip');

// without `display: none` with the condition for the existence of a block, the tooltip goes beyond the screen boundaries
// <wbr> for "splitting" into 2 conditional tables: properties.data and properties.value + properties.text
export const TOOLTIP_TWIG_TEMPLATE = `<div
        class="${b({'yandex-map': true})}"
        {% if (!(properties.name || properties.value !== undefined || properties.text || properties.data)) %}
            style="display: none"
        {% endif %}
    >
        {% if (properties.name) %}
            <div class="${b('header')}">
                {{properties.name}}
            </div>
        {% endif %}
        {% if (properties.value !== undefined || properties.text) %}
            <div class="${b('row')}">
                {% if (properties.value !== undefined) %}
                    <div class="${b('cell', {
                        'yandex-map': true,
                    })}">{{properties.value|number}}</div>
                {% endif %}
                {% if (properties.text) %}
                    <div class="${b('cell', {'yandex-map': true})}">
                        {% if (properties.rawText) %}
                            {{properties.text|raw}}
                        {% else %}
                            {{properties.text}}
                        {% endif %}
                    </div>
                {% endif %}
            </div>
        {% endif %}
        {% if (properties.data) %}
            {% if (properties.value !== undefined || properties.text || properties.name) %}
                <wbr>
            {% endif %}
            {% for part in properties.data %}
                <div class="${b('row')}
                ">
                    {% if (properties.data.0.color) %}
                        <div class="${b('cell')}">
                            <span class="${b(
                                'color',
                            )}" style="background-color: {{part.color}};"></span>
                        </div>
                    {% endif %}
                    <div class="${b('cell', {'yandex-map': true})}">{{part.weight|number}}</div>
                    <div class="${b('cell', {'yandex-map': true})}">
                        {% if (properties.rawText) %}
                            {{part.text|raw}}
                        {% else %}
                            {{part.text}}
                        {% endif %}
                    </div>
                </div>
            {% endfor %}
        {% endif %}
    </div>`;

// It is important that the display order does not change if you hide/show in different order,
// therefore, use opacity.
// In theory, you need to do it by geoObject.setMap(value ? this.map : null);
// + it is necessary to somehow support and use zIndex on the mapsapi-heatmap side
function setHeatmapVisibility(heatmap, value) {
    if (value) {
        heatmap.options.set('opacity', heatmap.options.get('opacitySaved'));
        heatmap.options.set('opacitySaved', null);
    } else {
        heatmap.options.set('opacitySaved', heatmap.options.get('opacity'));
        heatmap.options.set('opacity', 0);
    }
}

// It is important that the display order does not change if you hide/show in different order,
// therefore, use opacity.
// In theory, you need to do it by geoObject.objectManager.setFilter(() => Boolean(value));
// In addition, the visible option does not work for objectManager.
function setPolygonmapVisibility(geoObject, value) {
    const objects = geoObject.objectManager.objects;
    objects.getAll().forEach(
        ({
            id,

            options: {
                fillOpacity,
                fillOpacityHover,
                strokeWidth,
                strokeWidthHover,

                fillOpacitySaved,
                fillOpacityHoverSaved,
                strokeWidthSaved,
                strokeWidthHoverSaved,
            },
        }) => {
            // openHintOnHover to hide the tooltip that is shown on transparent layers
            // zIndex to prevent transparent layer get hover when there is a visible layer underneath it
            if (value) {
                objects.setObjectOptions(id, {
                    openHintOnHover: true,
                    zIndex: 100,

                    fillOpacity: fillOpacitySaved,
                    fillOpacityHover: fillOpacityHoverSaved,
                    strokeWidth: strokeWidthSaved,
                    strokeWidthHover: strokeWidthHoverSaved,

                    fillOpacitySaved: null,
                    fillOpacityHoverSaved: null,
                    strokeWidthSaved: null,
                    strokeWidthHoverSaved: null,
                });
            } else {
                objects.setObjectOptions(id, {
                    openHintOnHover: false,
                    zIndex: -100,

                    fillOpacity: 0,
                    fillOpacityHover: 0,
                    strokeWidth: 0,
                    strokeWidthHover: 0,

                    fillOpacitySaved: fillOpacity,
                    fillOpacityHoverSaved: fillOpacityHover,
                    strokeWidthSaved: strokeWidth,
                    strokeWidthHoverSaved: strokeWidthHover,
                });
            }
        },
    );
}

class YandexMap {
    static _ymaps;
    static _promise;
    static _shared = {};

    static _loadApi(lang, apiKey) {
        return new Promise((resolve, reject) => {
            window[ONLOAD] = (api) => {
                YandexMap._ymaps = api;
                resolve(api);
                delete window[ONLOAD];
            };

            window[ONERROR] = (error) => {
                reject(ChartKitCustomError.wrap(error));
                delete window[ONERROR];
            };

            fetchScript(getFetchUrl(lang, apiKey)).catch((error) => {
                throw ChartKitCustomError.wrap(error);
            });
        });
    }

    static async _initModules() {
        try {
            // Make crossOrigin anonymous for canvas tiles to prevent Tainted canvases
            await YandexMap._ymaps.modules
                .require('layer.tileContainer.CanvasContainer')
                .then(([canvasContainer]) => {
                    if (canvasContainer?.superclass?.constructor) {
                        const superclassCtor = canvasContainer.superclass.constructor;

                        canvasContainer.superclass.constructor = function (...args) {
                            const result = superclassCtor.call(this, args);

                            this.options?.set('crossOrigin', 'anonymous');

                            return result;
                        };
                    }
                });

            defineGridmap(YandexMap._ymaps);
            defineModules(YandexMap._ymaps);

            YandexMap._ymaps.template.filtersStorage.add('number', (dataLogger, value) =>
                numberFormat(value),
            );

            // https://tech.yandex.ru/maps/jsbox/2.1/placemark_hint_layout
            YandexMap._shared.hintLayout = YandexMap._ymaps.templateLayoutFactory.createClass(
                TOOLTIP_TWIG_TEMPLATE,
                {
                    // Defining the getShape method, which will return the dimensions of the hint layout.
                    // This is necessary in order for the hint to automatically shift the position when going outside the map.
                    getShape: function () {
                        const element = this.getElement();
                        let result = null;
                        if (element) {
                            const firstChild = element.firstChild;
                            result = new YandexMap._ymaps.shape.Rectangle(
                                new YandexMap._ymaps.geometry.pixel.Rectangle([
                                    [0, 0],
                                    [firstChild.offsetWidth, firstChild.offsetHeight],
                                ]),
                            );
                        }
                        return result;
                    },
                },
            );

            // https://tech.yandex.ru/maps/jsbox/2.1/balloon_autopan
            // TODO: balloonLayout did not start - positioned incorrectly and not close
            YandexMap._shared.balloonContentLayout =
                YandexMap._ymaps.templateLayoutFactory.createClass(
                    `{% if (properties.balloonContentHeader || properties.balloonContentBody || properties.balloonContentFooter) %}
                    <div class="${b()}">
                        <div class="${b('header')}">
                            $[properties.balloonContentHeader]
                        </div>
                        <div class="${b('row')}">
                            $[properties.balloonContentBody]
                        </div>
                        <div class="${b('footer')}">
                            $[properties.balloonContentFooter]
                        </div>
                    </div>
                {% endif %}`,
                );

            // https://tech.yandex.ru/maps/jsbox/2.1/scalable_placemarks
            const Chips = YandexMap._ymaps.templateLayoutFactory.createClass(
                '<div class="chartkit-yandex-map-chips">$[properties.label]</div>',
                {
                    build: function () {
                        Chips.superclass.build.call(this);

                        const map = this.getData().geoObject.getMap();

                        if (!this.inited) {
                            this.inited = true;
                            // Get the current zoom level
                            let zoom = map.getZoom();
                            // Subscribe to the event of changing the map viewport
                            map.events.add(
                                'boundschange',
                                function () {
                                    // Let's start rebuilding the layout when the zoom level changes
                                    const currentZoom = map.getZoom();
                                    if (currentZoom !== zoom) {
                                        zoom = currentZoom;
                                        this.rebuild();
                                    }
                                },
                                this,
                            );
                        }

                        const properties = this.getData().properties;
                        const options = this.getData().options;
                        const geoObjectOptions = this.getData().geoObject.options;

                        const radius = properties.get('radius');
                        const label = properties.get('label');

                        const size = map.getZoom() * radius;

                        const element = this.getParentElement().getElementsByClassName(
                            'chartkit-yandex-map-chips',
                        )[0];
                        // Setting the height and width of the label
                        element.style.width = element.style.height = size + 'px';
                        // Setting the offset
                        element.style.marginLeft = element.style.marginTop = -size / 2 + 'px';
                        // Setting the color
                        element.style.backgroundColor = options.get('color');
                        // Setting transparency
                        element.style.opacity = geoObjectOptions.get('opacity');

                        const MIN_SIZE_TO_SHOW_LABEL = 25;

                        if (label && size >= MIN_SIZE_TO_SHOW_LABEL) {
                            const BASE_TEXT_MULTIPLIER = 0.31;
                            // The value is selected empirically.
                            // If the value is greater, then large numbers begin to press too hard against the boundaries of the point
                            element.style.fontSize = size * BASE_TEXT_MULTIPLIER + 'px';
                        } else {
                            element.style.fontSize = '0px';
                        }

                        // By default, when setting your HTML layout, the hotspot shape is not set,
                        // and you need to set it yourself
                        // Interactivity will not work properly without a hotspot
                        // Creating a shape of the "Circle" hotspot
                        const circleShape = {type: 'Circle', coordinates: [0, 0], radius: size / 2};
                        // Setting the shape of the hotspot
                        options.set('shape', circleShape);

                        // Set additional className
                        const isActive = geoObjectOptions.get('active');
                        const classNames = new Set(element.className.split(' '));
                        if (isActive === true) {
                            classNames.delete('inactive');
                            classNames.add('active');
                        } else if (isActive === false) {
                            classNames.delete('active');
                            classNames.add('inactive');
                        } else {
                            classNames.delete('inactive');
                            classNames.delete('active');
                        }
                        element.className = Array.from(classNames).join(' ');

                        this.optionsMonitor = new YandexMap._ymaps.Monitor(geoObjectOptions).add(
                            'opacity',
                            (newValue) => {
                                element.style.opacity = newValue;
                            },
                        );
                    },
                    clear: function () {
                        Chips.superclass.clear.call(this);
                        this.optionsMonitor.removeAll();
                    },
                },
            );

            YandexMap._ymaps.option.presetStorage.add('chartkit#chips', {iconLayout: Chips});
        } catch (error) {
            throw ChartKitCustomError.wrap(error);
        }
    }

    // TODO: Calling YandexMap._initModules and YandexMap._promise = null look kind of sloppy
    static async _initYmaps(lang, apiKey) {
        try {
            if (window.ymaps) {
                YandexMap._ymaps = window.ymaps;
            } else if (!YandexMap._promise) {
                YandexMap._promise = YandexMap._loadApi(lang, apiKey).then(YandexMap._initModules);
            }
            await YandexMap._promise;
        } catch (error) {
            // for "Repeat again"
            YandexMap._promise = null;
            throw ChartKitCustomError.wrap(error);
        }
    }

    static async draw({node, data, config, events, lang}) {
        let yandexMapAPIWaiting = null;
        let geoObjectsInstantiationDuration = null;

        const {ymap: {state, options: configOptions, apiKey} = {}} = config;

        if (!YandexMap._ymaps) {
            const initYmapsMarkId = getRandomCKId();
            Performance.mark(initYmapsMarkId);

            await YandexMap._initYmaps(lang, apiKey);

            yandexMapAPIWaiting = Performance.getDuration(initYmapsMarkId);
        }

        // When only one point on the map, the map is displayed at the z zoom level, which is not there (too close).
        // As a result, it shows an empty square instead of a map by default.
        const bounds = state.bounds;
        if (bounds && isEqual(bounds[0], bounds[1])) {
            const zoomRange = await YandexMap._ymaps.getZoomRange('yandex#map', bounds[0]);

            state.center = bounds[0];
            state.zoom = zoomRange[1];
            delete state.bounds;
        }

        const geoObjectsInstantiationMarkId = getRandomCKId();
        Performance.mark(geoObjectsInstantiationMarkId);

        const map = new YandexMap._ymaps.Map(
            node,
            {
                controls: [],
                behaviors: [],
                ...state,
            },
            {
                yandexMapDisablePoiInteractivity: true,
                suppressMapOpenBlock: true,
                hintCloseTimeout: 100,
                hintOpenTimeout: 100,
                hintPane: 'hint',
                hintLayout: YandexMap._shared.hintLayout,
                balloonPanelMaxMapArea: 0,
                autoFitToViewport: 'always',
                ...configOptions,
            },
        );

        if (events) {
            Object.entries(events).forEach(([key, value]) => {
                map.events.add(key, value);
            });
        }

        // if you pass balloonContentLayout when creating a map, it does not work
        const extendOptions = (options) => {
            const result = {
                balloonContentLayout: YandexMap._shared.balloonContentLayout,
                ...options,
            };

            if (result.showCustomLegend) {
                result.showLegend = false;
            }

            return result;
        };

        if (isEmpty(data)) {
            throw new ChartKitCustomError(null, {code: ERROR_CODE.NO_DATA});
        }

        const responses = await Promise.allSettled(
            data.map(async (item, index) => {
                if (item.collection) {
                    const {
                        collection: {geometry, properties, children},
                    } = item;

                    // using ObjectManager should be more productive,
                    // but inside the Chips preset methods there is no way to get an instance of map
                    // const objectManager = new YandexMap._ymaps.ObjectManager();
                    const geoObjectChildren = children.reduce(
                        (result, {feature, options: childOptions}) => {
                            result.push(new YandexMap._ymaps.GeoObject(feature, childOptions));

                            return result;
                        },
                        [],
                    );

                    const geoCollection = new YandexMap._ymaps.GeoObjectCollection(
                        {geometry, properties, children: geoObjectChildren},
                        {
                            ...extendOptions(item.options),
                            geoObjectType: GEO_OBJECT_TYPE.GEOCOLLECTION,
                            zIndex: index,
                        },
                    );

                    map.geoObjects.add(geoCollection);

                    return geoCollection;
                } else if (item.clusterer) {
                    const {clusterer, options} = item;

                    const geoClusterer = new YandexMap._ymaps.Clusterer(options);

                    clusterer.forEach(({feature, options: innerOptions}) => {
                        const geoObject = new YandexMap._ymaps.GeoObject(
                            feature,
                            extendOptions(innerOptions),
                        );
                        geoClusterer.add(geoObject);
                    });

                    map.geoObjects.add(geoClusterer);

                    return geoClusterer;
                } else if (item.polygonmap) {
                    const {
                        polygonmap: {
                            polygons,
                            points = {type: 'FeatureCollection', features: []},
                            values,
                        },
                        options,
                    } = item;

                    const featurePointsCollection =
                        points.type === 'FeatureCollection'
                            ? points
                            : arrayOfArraysToPointsCollection(points);

                    const useValues = options.joinByProperty && values;

                    if (useValues) {
                        const valuesDict = values.reduce((result, value) => {
                            const key = value[options.joinByProperty];
                            result[key] = value.value;
                            return result;
                        }, {});

                        polygons.features = polygons.features.map((feature) => {
                            const key = feature.properties[options.joinByProperty];
                            return merge({}, feature, {properties: {pointsCount: valuesDict[key]}});
                        });
                    }

                    return new Promise((resolve, reject) => {
                        YandexMap._ymaps.modules.require(['Polygonmap'], (Polygonmap) => {
                            // for Wizard charts that used this,
                            // when only global options were used and the options of the polygons themselves were ignored
                            if (options.mapper === 'emptyMapper') {
                                delete options.mapper;
                            }

                            const mapper =
                                featurePointsCollection.features.length || useValues
                                    ? combinedMapper
                                    : combinedMapperNoPoints;

                            let polygonmap = new Polygonmap(
                                {polygons, points: featurePointsCollection},
                                Object.assign(
                                    {
                                        colorRangesMinimum: 1,
                                        onClick: function () {},
                                        mapper,
                                        geoObjectType: GEO_OBJECT_TYPE.POLYGONMAP,
                                    },
                                    extendOptions(options),
                                ),
                            );

                            try {
                                polygonmap = polygonmap.setMap(map);
                            } catch (error) {
                                logger.logError('YandexMapModule.draw failed [Polygonmap]', error);
                                reject();
                            }

                            if (polygonmap.options.get('visible') === false) {
                                setPolygonmapVisibility(polygonmap, false);
                            }

                            polygonmap.optionsMonitor = new YandexMap._ymaps.Monitor(
                                polygonmap.options,
                            ).add('visible', (newValue) =>
                                setPolygonmapVisibility(polygonmap, newValue),
                            );

                            resolve(polygonmap);
                        });
                    });
                }
                if (item.gridmap) {
                    const featurePointsCollection =
                        item.gridmap.type === 'FeatureCollection'
                            ? item.gridmap
                            : arrayOfArraysToPointsCollection(item.gridmap);

                    return new Promise((resolve) => {
                        YandexMap._ymaps.modules.require(['Gridmap'], (Gridmap) => {
                            let gridmap = new Gridmap(
                                featurePointsCollection,
                                merge(
                                    {
                                        filterEmptyPolygons: true,
                                        colorRangesMinimum: 1,
                                        onClick: function () {},
                                        mapper: combinedMapper,
                                        geoObjectType: GEO_OBJECT_TYPE.GRIDMAP,
                                    },
                                    extendOptions(item.options),
                                ),
                            );

                            gridmap = gridmap.setMap(map);

                            if (gridmap.options.get('visible') === false) {
                                setPolygonmapVisibility(gridmap, false);
                            }

                            gridmap.optionsMonitor = new YandexMap._ymaps.Monitor(
                                gridmap.options,
                            ).add('visible', (newValue) =>
                                setPolygonmapVisibility(gridmap, newValue),
                            );

                            resolve(gridmap);
                        });
                    });
                }
                if (item.heatmap) {
                    return new Promise((resolve) => {
                        YandexMap._ymaps.modules.require(['Heatmap'], (Heatmap) => {
                            const heatmap = new Heatmap(item.heatmap, {
                                ...extendOptions(item.options),
                                geoObjectType: GEO_OBJECT_TYPE.HEATMAP,
                            });

                            if (heatmap.options.get('visible') === false) {
                                setHeatmapVisibility(heatmap, false);
                            }

                            heatmap.setMap(map);

                            heatmap.optionsMonitor = new YandexMap._ymaps.Monitor(
                                heatmap.options,
                            ).add('visible', (newValue) => setHeatmapVisibility(heatmap, newValue));

                            resolve(heatmap);
                        });
                    });
                } else {
                    const {feature, options} = item;
                    const geoObject = new YandexMap._ymaps.GeoObject(
                        feature,
                        extendOptions(options),
                    );

                    map.geoObjects.add(geoObject);

                    return geoObject;
                }
            }),
        );

        const geoObjects = responses.reduce((acc, response) => {
            if (response.status === 'fulfilled') {
                acc.push(response.value);
            }
            return acc;
        }, []);

        geoObjectsInstantiationDuration = Performance.getDuration(geoObjectsInstantiationMarkId);

        const mapPerformanceMetrics = {
            geoObjectsInstantiationDuration,
            yandexMapAPIWaiting,
        };

        return {map, geoObjects, mapPerformanceMetrics};
    }
}

export default YandexMap;
