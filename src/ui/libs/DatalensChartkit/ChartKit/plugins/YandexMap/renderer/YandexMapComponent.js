import React from 'react';

import block from 'bem-cn-lite';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import isNumber from 'lodash/isNumber';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import {getRandomCKId} from '../../../helpers/getRandomCKId';
import Performance from '../../../modules/perfomance';
import YandexMapModule, {
    GEO_OBJECT_TYPE,
    TOOLTIP_TWIG_TEMPLATE,
} from '../../../modules/yandex-map/yandex-map';
import {StyledSplitPane} from '../../../plugins/components';

import Legend from './Legend/Legend';
import {renderPossibleMarkupItems} from './utils';

import './YandexMapComponent.scss';

let ReactDOMServer;

const PROVIDER_DATA_FIELDS = ['data', 'config', 'libraryConfig'];

const b = block('chartkit-ymap');

const hoveredPolygonOptions = {strokeWidth: 2, fillOpacity: 1};
const CHART_SECTION_PERCENTAGE = 0.6;
const PANE_RESIZER_HEIGHT = 24;
const MOBILE_CHART_HEIGHT = 400;

const paneSplits = {
    vertical: 'vertical',
    horizontal: 'horizontal',
};

// methods from here - https://ru.stackoverflow.com/a/463666
function getTileContainer(layer) {
    for (const k in layer) {
        if (Object.prototype.hasOwnProperty.call(layer, k)) {
            if (
                layer[k] instanceof YandexMapModule._ymaps.layer.tileContainer.CanvasContainer ||
                layer[k] instanceof YandexMapModule._ymaps.layer.tileContainer.DomContainer
            ) {
                return layer[k];
            }
        }
    }
    return null;
}

function waitForTilesLoad(layer) {
    return new YandexMapModule._ymaps.vow.Promise((resolve) => {
        const tileContainer = getTileContainer(layer);
        let readyAll = true;

        tileContainer.tiles.each((tile) => {
            if (!tile.isReady()) {
                readyAll = false;
            }
        });
        if (readyAll) {
            resolve();
        } else {
            tileContainer.events.once('ready', () => {
                resolve();
            });
        }
    });
}

function getCurrentPaneSplit() {
    return window.innerWidth > window.innerHeight ? paneSplits.vertical : paneSplits.horizontal;
}

function getNodeHeight(node) {
    return node?.getBoundingClientRect().height || 0;
}

export class YandexMapComponent extends React.Component {
    static propTypes = {
        data: PropTypes.shape({
            data: PropTypes.array,
            config: PropTypes.object,
            libraryConfig: PropTypes.object,
        }).isRequired,
        lang: PropTypes.oneOf(['ru', 'en']),
        splitTooltip: PropTypes.bool,
        onLoad: PropTypes.func,
        onChartLoad: PropTypes.func,
        onRender: PropTypes.func,
        onChange: PropTypes.func.isRequired,
        onError: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const paneSplit = getCurrentPaneSplit();
        const paneMinSize = paneSplits.horizontal ? MOBILE_CHART_HEIGHT : undefined;

        this.state = {
            paneSplit,
            paneMinSize,
            geoObjects: [],
            bounds: undefined,
            paneSize: undefined,
            paneMaxSize: undefined,
            error: undefined,
        };
    }

    componentDidMount() {
        this.init('onMount');

        if (this.props.splitTooltip) {
            window.addEventListener('resize', this.resizeHandler);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // the component should be redrawn when switching from splitTooltip to standard
        // the tooltip (and vice versa) since the appearance of the split tooltip reduces the size of the map container
        const splitTooltipModeWasSwitched = nextProps.splitTooltip !== this.props.splitTooltip;
        const orientationWasChanged = nextState.paneSplit !== this.state.paneSplit;

        const shouldUpdate =
            splitTooltipModeWasSwitched ||
            orientationWasChanged ||
            !isEqual(
                pick(nextProps.data, PROVIDER_DATA_FIELDS),
                pick(this.props.data, PROVIDER_DATA_FIELDS),
            ) ||
            nextState.geoObjects !== this.state.geoObjects ||
            nextState.paneSize !== this.state.paneSize;

        return shouldUpdate;
    }

    componentDidUpdate(prevProps, prevState) {
        const splitTooltipModeWasSwitched = prevProps.splitTooltip !== this.props.splitTooltip;
        const orientationWasChanged = prevState.paneSplit !== this.state.paneSplit;

        const needReInit =
            splitTooltipModeWasSwitched ||
            orientationWasChanged ||
            !isEqual(
                pick(prevProps.data, PROVIDER_DATA_FIELDS),
                pick(this.props.data, PROVIDER_DATA_FIELDS),
            );

        if (needReInit) {
            if (!prevProps.splitTooltip && this.props.splitTooltip) {
                window.addEventListener('resize', this.resizeHandler);
            } else if (prevProps.splitTooltip && !this.props.splitTooltip) {
                window.removeEventListener('resize', this.resizeHandler);
            }

            this.init('onRender');
        }
    }

    componentWillUnmount() {
        this.destroy();
        window.removeEventListener('resize', this.resizeHandler);
    }

    tooltipContainerRef = React.createRef();
    mapContainerRef = React.createRef();
    selectedObjectId = null;
    geoObjectsStates = {};
    node = undefined;
    map = undefined;
    // If there is a chart with a map and description on the dashboard,
    // then after the description appears, sizechange is triggered, and then boundschange.
    // In the described case, it is necessary that bounds are not stored in state.
    sizeChanged = false;

    resizeHandler = () => {
        const currentPaneSplit = getCurrentPaneSplit();

        if (this.state.paneSplit !== currentPaneSplit) {
            this.setState({paneSplit: currentPaneSplit});
        }
    };

    /**
     * helper for Wizard to set opacity for geo layers
     *
     * @param {string} geoObjectId
     * @param {number} value
     * @returns {void}
     */
    setOpacity = (geoObjectId, value) => {
        const geoObject = this.state.geoObjects.find(
            (item) => item.options.get('geoObjectId') === geoObjectId,
        );

        const geoObjectType = geoObject.options.get('geoObjectType');

        if (geoObjectType === GEO_OBJECT_TYPE.HEATMAP) {
            geoObject.options.set('opacity', value);
        } else if (
            geoObjectType === GEO_OBJECT_TYPE.POLYGONMAP ||
            geoObjectType === GEO_OBJECT_TYPE.GRIDMAP
        ) {
            // because each element has its own non-inherited options
            const objects = geoObject.objectManager.objects;
            let opacityHover = value + 0.1;
            opacityHover = opacityHover > 1 ? 1 : opacityHover;
            objects.getAll().forEach(({id}) =>
                objects.setObjectOptions(id, {
                    fillOpacity: value,
                    fillOpacityHover: opacityHover,
                }),
            );
        } else {
            geoObject.options.set('opacity', value);
        }
    };

    /**
     * helper for Wizard to set visibility for geo layers
     *
     *  @param {string} geoObjectId
     * @param {boolean} value
     * @returns {void}
     */
    setVisibility = (geoObjectId, value) => {
        const geoObject = this.state.geoObjects.find(
            (item) => item.options.get('geoObjectId') === geoObjectId,
        );

        geoObject.options.set('visible', value);

        this.geoObjectsStates[geoObjectId] = {options: {visible: value}};

        this.props.onChange(
            {type: 'YMAP_GEOOBJECT_VISIBILITY_CHANGED', data: {geoObjectId, value}},
            {},
            true,
        );
    };

    destroy() {
        if (this.map) {
            this.map.destroy();
        }
    }

    async init(callBackType) {
        try {
            ReactDOMServer = await import(
                /* webpackChunkName: "react-dom/server" */ 'react-dom/server'
            );

            const {data, libraryConfig, config} = this.props.data;
            const {map, geoObjects, mapPerformanceMetrics} = await YandexMapModule.draw({
                node: this.node,
                data: data.map((geoObject) => {
                    const geoObjectState =
                        geoObject.options && this.geoObjectsStates[geoObject.options.geoObjectId];
                    const children = get(geoObject, 'collection.children', []);
                    const polygons = get(geoObject, 'polygonmap.polygons.features', []);
                    const renderToString = ReactDOMServer?.renderToString;

                    if (renderToString && children.length) {
                        children.forEach((child) => {
                            const childData = get(child, 'feature.properties.data', []);
                            renderPossibleMarkupItems(renderToString, childData);
                        });
                    } else if (renderToString && polygons.length) {
                        polygons.forEach((polygon) => {
                            const polygonData = get(polygon, 'properties.data', []);
                            renderPossibleMarkupItems(renderToString, polygonData);
                        });
                    }

                    return geoObjectState ? merge({}, geoObject, geoObjectState) : geoObject;
                }),
                lang: this.props.lang,
                config: Object.assign(
                    {ymap: merge(libraryConfig, {state: {bounds: this.state.bounds}})},
                    config,
                ),
                events: {
                    boundschange: (event) => {
                        if (!this.sizeChanged) {
                            this.setState({
                                bounds: event.get('newBounds'),
                            });
                        }
                        this.sizeChanged = false;
                    },
                    sizechange: () => {
                        this.sizeChanged = true;
                    },
                },
            });

            YandexMapModule._ymaps.ready(() => {
                class CustomControlClass extends YandexMapModule._ymaps.collection.Item {
                    constructor(component) {
                        super();

                        this._$content = null;
                        this._$component = component;
                    }

                    onAddToMap() {
                        this._lastCenter = null;
                        this.getParent().getChildElement(this).then(this._onGetChildElement, this);
                    }

                    onRemoveFromMap() {
                        if (this._$content) {
                            this._$content.remove();
                        }
                    }

                    _onGetChildElement(parentDomContainer) {
                        this._$content = document.createElement('div');
                        ReactDOM.render(this._$component, this._$content);
                        parentDomContainer.appendChild(this._$content);
                    }
                }

                const customControl = new CustomControlClass(
                    (
                        <Legend
                            map={this.map}
                            geoObjects={this.state.geoObjects}
                            onSetVisibility={this.setVisibility}
                        />
                    ),
                );

                this.map.controls.add(customControl, {
                    float: 'none',
                });
            });

            this.destroy();
            this.map = map;

            const allLayers = [];

            const tilesLoadingMarkId = getRandomCKId();
            Performance.mark(tilesLoadingMarkId);

            this.map.layers.each((layerOrCollection) => {
                if (layerOrCollection instanceof YandexMapModule._ymaps.LayerCollection) {
                    layerOrCollection.each((createdLayer) => {
                        allLayers.push(createdLayer);
                    });
                } else {
                    allLayers.push(layerOrCollection);
                }
            });

            const [firstLayer] = allLayers;

            if (firstLayer) {
                firstLayer._element?.classList.add('chartkit-map-ground-pane');
            }

            const {geoObjectsInstantiationDuration, yandexMapAPIWaiting} = mapPerformanceMetrics;

            YandexMapModule._ymaps.vow
                .all(allLayers.map((layer) => waitForTilesLoad(layer)))
                .then(() => {
                    const tilesLoadingDuration = Performance.getDuration(tilesLoadingMarkId);
                    if (callBackType === 'onMount') {
                        this.props.onChartLoad?.({
                            widget: {
                                setOpacity: this.setOpacity,
                                setVisibility: this.setVisibility,
                            },
                        });
                    }
                    if (callBackType === 'onRender') {
                        this.props.onRender?.({
                            widgetRendering: geoObjectsInstantiationDuration + tilesLoadingDuration,
                        });
                    }
                    this.props.onLoad?.({
                        widgetRendering: geoObjectsInstantiationDuration + tilesLoadingDuration,
                        yandexMapAPIWaiting,
                        widget: {
                            setOpacity: this.setOpacity,
                            setVisibility: this.setVisibility,
                        },
                    });
                });

            if (this.props.splitTooltip) {
                this.prepareForSplitTooltipMode();
            }

            this.setState({
                geoObjects: geoObjects.slice().reverse(),
            });
        } catch (error) {
            if (this.props.onError) {
                this.props.onError({error});
            }
        }
    }

    getPaneSizeOptions = () => {
        let paneSize;
        let paneMinSize;
        let paneMaxSize;

        const mapContainerHeight = getNodeHeight(this.mapContainerRef.current);
        const tooltipHeight = getNodeHeight(this.tooltipContainerRef.current);

        if (this.state.paneSplit === paneSplits.vertical) {
            paneSize = window.innerWidth * CHART_SECTION_PERCENTAGE;
        } else {
            paneSize = mapContainerHeight - tooltipHeight - PANE_RESIZER_HEIGHT;
            paneMinSize = mapContainerHeight - tooltipHeight - PANE_RESIZER_HEIGHT;
            paneMaxSize = mapContainerHeight - PANE_RESIZER_HEIGHT;
        }

        return {paneSize, paneMinSize, paneMaxSize};
    };

    // in split-tooltip mode, the tooltip must be shown in a separate split-pane "sash".
    // Can't find the solutions in map-api about how to render a tooltip outside the map container, so we use the Template capabilities from the Maps API
    // (https://tech.yandex.ru/maps/jsapi/doc/2.1/ref/reference/Template-docpage /) and append the resulting markup in
    // the necessary node.
    // When activating the split tooltip mode, you must:
    // - show something in the tooltip (wait for the user's first interaction with map objects and only after
    // showing this is not a good solution, since showing the tooltip will change the size of the map container
    // and its redrawing). Therefore, we will take the first element from the first collection and show the tooltip for it, and
    // set the element (if possible) active state.
    // - subscribe for events on map objects that will update the tooltip and manage the activity states of objects
    prepareForSplitTooltipMode = () => {
        this.map.geoObjects.each((collection, index) => {
            if (!index) {
                this.setState(this.getPaneSizeOptions(), () => {
                    if (collection.objects) {
                        const firstObject = collection.objects.getIterator().getNext();
                        this.selectedObjectId = firstObject.id;
                        collection.objects.setObjectOptions(firstObject.id, hoveredPolygonOptions);
                    }
                });
            }

            // subscribe for necessary events
            this.bindEventsForSplitTooltip(collection);
        });
    };

    bindEventsForSplitTooltip = (collection) => {
        if (collection.objects) {
            // By default, the activity state is set/removed when mouseenter/mouseleave.
            // On touch devices, we disable this behavior and update the tooltip and activity states by click.
            collection.objects.events.add('mouseenter', (event) => {
                event.stopPropagation();
                event.preventDefault();
            });

            collection.objects.events.add('mouseleave', (event) => {
                event.stopPropagation();
                event.preventDefault();
            });

            collection.objects.events.add('click', (event) => {
                const objectId = event.get('objectId');

                if (isNumber(this.selectedObjectId) && this.selectedObjectId !== objectId) {
                    const prevSelectedObject = collection.objects.getById(this.selectedObjectId);

                    const options = {
                        strokeWidth: prevSelectedObject.options.strokeWidthDefault,
                        fillOpacity: prevSelectedObject.options.fillOpacityDefault,
                    };

                    collection.objects.setObjectOptions(this.selectedObjectId, options);
                }

                this.selectedObjectId = objectId;

                collection.objects.setObjectOptions(objectId, hoveredPolygonOptions);

                const selectedObject = collection.objects.getById(objectId);

                if (this.tooltipContainerRef && this.tooltipContainerRef.current) {
                    const tooltipTemplate = new YandexMapModule._ymaps.Template(
                        TOOLTIP_TWIG_TEMPLATE,
                    );
                    const {properties} = selectedObject;
                    const templateData = new YandexMapModule._ymaps.data.Manager({properties});
                    const tooltipMarkup = tooltipTemplate.build(templateData).text;
                    this.tooltipContainerRef.current.innerHTML = tooltipMarkup;
                    this.setState(this.getPaneSizeOptions());
                }
            });
        } else {
            collection.events.add('click', (event) => {
                const target = event.get('target');

                if (this.tooltipContainerRef && this.tooltipContainerRef.current) {
                    const tooltipTemplate = new YandexMapModule._ymaps.Template(
                        TOOLTIP_TWIG_TEMPLATE,
                    );
                    const properties = target.properties.getAll();
                    const templateData = new YandexMapModule._ymaps.data.Manager({properties});
                    const tooltipMarkup = tooltipTemplate.build(templateData).text;
                    this.tooltipContainerRef.current.innerHTML = tooltipMarkup;
                    this.setState(this.getPaneSizeOptions());
                }
            });
        }
    };

    renderMapWithSplitPane = () => {
        const {paneSplit, paneSize, paneMinSize, paneMaxSize} = this.state;

        return (
            <StyledSplitPane
                split={paneSplit}
                size={paneSize}
                minSize={paneMinSize}
                maxSize={paneMaxSize}
                allowResize={paneSplit === paneSplits.horizontal}
                resizerStyle={{...(!this.node && {display: 'none'})}}
                paneOneRender={() => (
                    <div
                        className={b({'with-split-tooltip': Boolean(this.props.splitTooltip)})}
                        ref={(node) => {
                            this.node = node;
                        }}
                    />
                )}
                paneTwoRender={() => (
                    <div className={b('tooltip-container')} ref={this.tooltipContainerRef} />
                )}
            />
        );
    };

    render() {
        return (
            <div className={b('wrapper')} ref={this.mapContainerRef}>
                {this.props.splitTooltip ? (
                    this.renderMapWithSplitPane()
                ) : (
                    <div
                        className={b()}
                        ref={(node) => {
                            this.node = node;
                        }}
                    />
                )}
            </div>
        );
    }
}
