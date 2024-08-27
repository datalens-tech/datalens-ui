import {
    pickActionParamsFromParams,
    transformParamsToActionParams,
} from '@gravity-ui/dashkit/helpers';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import type {StringParams} from 'shared';
import {isMacintosh} from 'ui/utils';

import type {WidgetProps, YMapWidget} from '../../../../types';
import {addParams, subtractParameters} from '../../../helpers/action-params-handlers';
import {hasMatchedActionParams} from '../../../helpers/utils';
import {GEO_OBJECT_TYPE} from '../../../modules/yandex-map/yandex-map';

import type {GeoPoint, GeoPointCollection} from './types';

type ApplyEventsArgs = YMapWidget &
    Pick<WidgetProps, 'onChange'> & {
        geoObjects: GeoPointCollection[];
    };

export function setSelectedState(args: {data: YMapWidget['data']; actionParams: StringParams}) {
    const {data, actionParams} = args;

    data.forEach((item) => {
        const polygons = get(item, 'polygonmap.polygons.features', []);
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

                polygon.options.fillOpacity = selected === false ? 0.25 : 0.8;
            });
            return;
        }

        const geoPoints = get(item, 'collection.children', []);
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

function getGeoObjectCollection(geoObjectCollection: unknown) {
    const type = geoObjectCollection.options.get('geoObjectType');
    switch (type) {
        case GEO_OBJECT_TYPE.POLYGONMAP: {
            return geoObjectCollection.objectManager.objects.getAll();
        }
        case GEO_OBJECT_TYPE.GEOCOLLECTION: {
            return geoObjectCollection.toArray();
        }
    }

    return [];
}

function getGeoObjectActionParams(geoObject: unknown) {
    if (geoObject.geometry?.type === 'Polygon') {
        return geoObject.properties.custom?.actionParams ?? {};
    }

    return geoObject.properties.get('custom')?.actionParams ?? {};
}

function getNewActionParams(args: {
    multiSelect: boolean;
    currentPoint: GeoPoint;
    geoObjects: GeoPointCollection[];
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
                            newActionParams = addParams(pointActionParams, itemActionParams);
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

export function applyEventHandlers(args: ApplyEventsArgs) {
    const {geoObjects, config, unresolvedParams = {}, onChange} = args;
    const prevActionParams = pickActionParamsFromParams(unresolvedParams);

    const handleClick = function (geoObject, event: any) {
        const multiSelect = isMacintosh() ? event.get('metaKey') : event.get('ctrlKey');
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
                            multiSelect,
                        });

                        if (isEqual(prevActionParams, newActionParams)) {
                            return;
                        }

                        const params = transformParamsToActionParams(
                            newActionParams as StringParams,
                        );

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

    geoObjects.forEach((collection) => {
        const type = collection.options.get('geoObjectType');
        switch (type) {
            case GEO_OBJECT_TYPE.POLYGONMAP: {
                collection.objectManager.events.add('click', function (event) {
                    const objId = event.get('objectId');
                    const object = collection.objectManager.objects.getById(objId);
                    handleClick(object, event);
                });
                break;
            }
            case GEO_OBJECT_TYPE.GEOCOLLECTION: {
                collection.events.add('click', function (event) {
                    handleClick(event.get('target'), event);
                });
                break;
            }
        }
    });
}
