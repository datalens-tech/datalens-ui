import {
    pickActionParamsFromParams,
    transformParamsToActionParams,
} from '@gravity-ui/dashkit/helpers';
import {gray, lab} from 'd3';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {StringParams} from 'shared';
import {isMacintosh} from 'ui/utils';

import type {WidgetProps, YMapWidget} from '../../../../types';
import {addParams, subtractParameters} from '../../../helpers/action-params-handlers';
import {hasMatchedActionParams} from '../../../helpers/utils';
import {GEO_OBJECT_TYPE} from '../../../modules/yandex-map/yandex-map';

import type {
    GeoPoint,
    GeoPointCollection,
    GeoPointData,
    GeoPolygon,
    GeoPolygonCollection,
} from './types';

type ApplyEventsArgs = YMapWidget &
    Pick<WidgetProps, 'onChange'> & {
        geoObjects: (GeoPointCollection | GeoPolygonCollection)[];
    };

export function setSelectedState(args: {data: YMapWidget['data']; actionParams: StringParams}) {
    const {data, actionParams} = args;

    data.forEach((item) => {
        const polygons: GeoPolygon[] = get(item, 'polygonmap.polygons.features', []);
        if (polygons.length) {
            const anySelected = polygons.some((polygon) => {
                const ap = polygon?.properties?.custom?.actionParams ?? {};
                return hasMatchedActionParams(ap, actionParams);
            });

            polygons.forEach((polygon) => {
                let selected: boolean | undefined;
                if (anySelected) {
                    const ap = polygon?.properties?.custom?.actionParams ?? {};
                    selected = hasMatchedActionParams(ap, actionParams);
                }

                if (selected === false) {
                    const originalFillColor = polygon.options.fillColor;
                    polygon.options.fillColorHover = originalFillColor;
                    polygon.options.fillColor = originalFillColor
                        ? gray(lab(originalFillColor).l).formatRgb()
                        : undefined;
                    polygon.options.fillOpacity = 0.5;
                }
            });
            return;
        }

        const geoPoints: GeoPointData[] = get(item, 'collection.children', []);
        if (geoPoints.length) {
            const anySelected = geoPoints.some((point) => {
                const ap = point?.feature?.properties?.custom?.actionParams ?? {};
                return hasMatchedActionParams(ap, actionParams);
            });

            geoPoints.forEach((point) => {
                let selected: boolean | undefined;
                if (anySelected) {
                    const ap = point?.feature?.properties?.custom?.actionParams ?? {};
                    selected = hasMatchedActionParams(ap, actionParams);
                }

                point.options.active = selected;
            });
            return;
        }
    });
}

function getGeoObjectCollection(geoObjectCollection: any) {
    const type = geoObjectCollection.options.get('geoObjectType');
    switch (type) {
        case GEO_OBJECT_TYPE.POLYGONMAP: {
            return geoObjectCollection.objectManager.objects.getAll() as GeoPolygon[];
        }
        case GEO_OBJECT_TYPE.GEOCOLLECTION: {
            return geoObjectCollection.toArray() as GeoPoint[];
        }
    }

    return [];
}

function getGeoObjectActionParams(geoObject: GeoPolygon | GeoPoint) {
    const geoType = get(geoObject, 'geometry.type');
    if (geoType === 'Polygon') {
        return (geoObject as GeoPolygon).properties.custom?.actionParams ?? {};
    }

    return (geoObject as GeoPoint).properties.get('custom')?.actionParams ?? {};
}

function getNewActionParams(args: {
    multiSelect: boolean;
    currentPoint: GeoPoint | GeoPolygon;
    geoObjects: (GeoPointCollection | GeoPolygonCollection)[];
    actionParams: StringParams;
}) {
    const {multiSelect, currentPoint, geoObjects, actionParams: prevActionParams} = args;
    let newActionParams: StringParams = prevActionParams;
    const currentPointParams = getGeoObjectActionParams(currentPoint);
    const hasSomePointSelected = geoObjects.some((item) => {
        return getGeoObjectCollection(item).some((point) => {
            return hasMatchedActionParams(getGeoObjectActionParams(point), prevActionParams);
        });
    });

    if (hasSomePointSelected) {
        if (hasMatchedActionParams(currentPointParams, prevActionParams)) {
            if (multiSelect) {
                newActionParams = subtractParameters(newActionParams, currentPointParams);
                geoObjects.forEach((item) => {
                    return getGeoObjectCollection(item).forEach((point) => {
                        const pointActionParams = getGeoObjectActionParams(point);
                        if (hasMatchedActionParams(pointActionParams, newActionParams)) {
                            newActionParams = addParams(newActionParams, pointActionParams);
                        }
                    });
                });
            } else {
                newActionParams = {};
            }
        } else {
            if (!multiSelect) {
                // should remove the selection from the previously selected points
                geoObjects.forEach((item) => {
                    return getGeoObjectCollection(item).forEach((point) => {
                        const pointActionParams = getGeoObjectActionParams(point);
                        if (hasMatchedActionParams(pointActionParams, newActionParams)) {
                            newActionParams = subtractParameters(
                                newActionParams,
                                pointActionParams,
                            );
                        }
                    });
                });
            }

            newActionParams = addParams(newActionParams, currentPointParams);
        }
    } else {
        newActionParams = addParams(newActionParams, currentPointParams);
    }

    return newActionParams;
}

function shouldUseMultiselect(event: any) {
    const sourceEvent = typeof event?.getSourceEvent === 'function' ? event.getSourceEvent() : null;
    if (sourceEvent) {
        return shouldUseMultiselect(sourceEvent);
    }

    const originalEvent = event?.originalEvent?.domEvent ?? event?.originalEvent;
    const key = isMacintosh() ? 'metaKey' : 'ctrlKey';
    return Boolean(originalEvent?.get?.(key) ?? originalEvent?.[key]);
}

export function applyEventHandlers(args: ApplyEventsArgs) {
    const {geoObjects, config, unresolvedParams = {}, onChange} = args;
    const prevActionParams = pickActionParamsFromParams(unresolvedParams);

    const handleClick = function (geoObject: GeoPoint | GeoPolygon, event: YMapClickEvent) {
        const actions = config?.events?.click ?? [];
        const clickActions = Array.isArray(actions) ? actions : [actions];

        clickActions.forEach((action) => {
            const handlers = Array.isArray(action.handler) ? action.handler : [action.handler];
            handlers.forEach((handler) => {
                switch (handler.type) {
                    case 'setActionParams': {
                        const clickScope = get(action, 'scope', 'point');
                        if (clickScope !== 'point') {
                            return;
                        }

                        const newActionParams = getNewActionParams({
                            geoObjects,
                            actionParams: prevActionParams,
                            currentPoint: geoObject,
                            multiSelect: shouldUseMultiselect(event),
                        });

                        if (isEqual(prevActionParams, newActionParams)) {
                            return;
                        }

                        const params = transformParamsToActionParams(newActionParams);

                        onChange?.(
                            {
                                type: 'PARAMS_CHANGED',
                                data: {params},
                            },
                            {forceUpdate: true},
                            true,
                            true,
                        );
                    }
                }
            });
        });
    };

    geoObjects.forEach((collection: any) => {
        const type = collection.options.get('geoObjectType');
        switch (type) {
            case GEO_OBJECT_TYPE.POLYGONMAP: {
                collection.objectManager.events.add('click', function (event: YMapClickEvent) {
                    const objId = event.get('objectId');
                    const object = collection.objectManager.objects.getById(objId);
                    handleClick(object, event);
                });
                break;
            }
            case GEO_OBJECT_TYPE.GEOCOLLECTION: {
                collection.events.add('click', function (event: YMapClickEvent) {
                    handleClick(event.get('target') as GeoPolygon, event);
                });
                break;
            }
        }
    });
}

type YMapClickEvent = MouseEvent & {get: (key: string) => unknown};
