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

import type {GeoPoint, GeoPointCollection} from './types';

type ApplyEventsArgs = YMapWidget &
    Pick<WidgetProps, 'onChange'> & {
        geoObjects: GeoPointCollection[];
    };

function setSelectedState(args: {geoObjects: GeoPointCollection[]; actionParams: StringParams}) {
    const {geoObjects, actionParams} = args;
    const anySelected = hasSomePointSelected(args);

    geoObjects.forEach((item) => {
        return item.toArray().forEach((point) => {
            let selected: boolean | undefined;
            if (anySelected) {
                const custom = point.properties.get('custom');
                selected = hasMatchedActionParams(custom?.actionParams, actionParams);
            }

            point.options.set('active', selected);
        });
    });
}

function hasSomePointSelected(args: {
    geoObjects: GeoPointCollection[];
    actionParams: StringParams;
}) {
    const {geoObjects, actionParams} = args;
    return geoObjects.some((item) => {
        return item.toArray().some((point) => {
            const custom = point.properties.get('custom');
            return hasMatchedActionParams(custom?.actionParams, actionParams);
        });
    });
}

function getNewActionParams(args: {
    multiSelect: boolean;
    currentPoint: GeoPoint;
    geoObjects: GeoPointCollection[];
    actionParams: StringParams;
}) {
    const {multiSelect, currentPoint, geoObjects, actionParams: prevActionParams} = args;
    let newActionParams: StringParams = prevActionParams;
    const pointCustomData = {custom: currentPoint.properties.get('custom')};
    const currentPointParams = pointCustomData.custom?.actionParams;

    if (hasSomePointSelected({geoObjects, actionParams: prevActionParams})) {
        if (hasMatchedActionParams(currentPointParams, prevActionParams)) {
            if (multiSelect) {
                newActionParams = subtractParameters(newActionParams, currentPointParams);
                geoObjects.forEach((item) => {
                    return item.toArray().forEach((point) => {
                        const custom = point.properties.get('custom');
                        if (hasMatchedActionParams(custom?.actionParams, newActionParams)) {
                            newActionParams = addParams(newActionParams, custom?.actionParams);
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
                    return item.toArray().forEach((point) => {
                        const custom = point.properties.get('custom');
                        if (hasMatchedActionParams(custom?.actionParams, newActionParams)) {
                            newActionParams = subtractParameters(
                                newActionParams,
                                custom?.actionParams,
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
    const actions = config?.events?.click ?? [];
    const clickActions = Array.isArray(actions) ? actions : [actions];

    setSelectedState({geoObjects, actionParams: prevActionParams});

    geoObjects.forEach((items) => {
        items.events.add('click', function (event: any) {
            const multiSelect = isMacintosh() ? event.get('metaKey') : event.get('ctrlKey');

            clickActions.forEach((action) => {
                const handlers = Array.isArray(action.handler) ? action.handler : [action.handler];
                handlers.forEach((handler) => {
                    switch (handler.type) {
                        case 'setActionParams': {
                            const clickScope = get(action, 'scope', 'point');
                            if (clickScope !== 'point') {
                                return;
                            }

                            const currentPoint = event.get('target');
                            const newActionParams = getNewActionParams({
                                geoObjects,
                                actionParams: prevActionParams,
                                currentPoint,
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
        });
    });
}
