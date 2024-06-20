import type {CSSProperties} from 'react';

import type {QueueItem, StringParams} from '@gravity-ui/dashkit/helpers';
import pick from 'lodash/pick';
import type {DashTabItemControlData} from 'shared';
import type {ResponseSuccessControls} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';

import type {ExtendedLoadedData} from './types';

export const getControlWidthStyle = (
    placementMode: DashTabItemControlData['placementMode'],
    width: DashTabItemControlData['width'],
): CSSProperties => {
    if (placementMode === 'auto') {
        return {flex: '1 1 auto'};
    }

    return {width: `${width}${placementMode}`};
};

export const clearLoaderTimer = (timer?: NodeJS.Timeout) => {
    if (timer) {
        clearTimeout(timer);
    }
};

export const addItemToLocalQueue = (queue: QueueItem[], widgetId: string, groupItemId: string) => {
    const updatedQueue = queue.filter((queueItem) => queueItem.groupItemId !== groupItemId);

    updatedQueue.push({id: widgetId, groupItemId});

    return updatedQueue;
};

export const filterSignificantParams = ({
    params,
    loadedData,
    defaults,
    dependentSelectors,
}: {
    params: StringParams;
    loadedData?: ExtendedLoadedData | ResponseSuccessControls | null;
    defaults?: StringParams;
    dependentSelectors?: boolean;
}) => {
    if (!params) {
        return {};
    }

    if (loadedData && loadedData.usedParams && dependentSelectors) {
        return pick(params, Object.keys(loadedData.usedParams));
    }

    return dependentSelectors || !defaults ? params : pick(params, Object.keys(defaults));
};
