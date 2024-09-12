import type {CSSProperties} from 'react';

import type {StringParams} from '@gravity-ui/dashkit/helpers';
import {I18N} from 'i18n';
import pick from 'lodash/pick';
import type {DashTabItemControlData} from 'shared';
import {
    CHARTS_ERROR_CODE,
    type ResponseSuccessControls,
} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';

import type {SelectorError} from '../Control/types';

import type {ExtendedLoadedData, GroupControlLocalMeta} from './types';

const i18n = I18N.keyset('common.errors');

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

export const addItemToLocalQueue = (
    queue: GroupControlLocalMeta['queue'],
    widgetId: string,
    groupItemId: string,
    param?: string,
) => {
    const updatedQueue = queue.filter((queueItem) => queueItem.groupItemId !== groupItemId);

    updatedQueue.push({id: widgetId, groupItemId, param});

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

export const getErrorTitle = (errorInfo: SelectorError) => {
    const datasetsStatus =
        errorInfo?.details && 'sources' in errorInfo.details && errorInfo.details.sources
            ? Object.keys(errorInfo.details.sources)[0]
            : '';
    // TODO: use specific code instead of status
    if (
        errorInfo?.code === CHARTS_ERROR_CODE.DATA_FETCHING_ERROR &&
        datasetsStatus &&
        errorInfo?.details?.sources?.[datasetsStatus]?.status === 409
    ) {
        return i18n('label_error-outdated-message');
    }

    return '';
};
