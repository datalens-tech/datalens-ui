import type {CSSProperties} from 'react';

import type {StringParams} from '@gravity-ui/dashkit/helpers';
import {I18N} from 'i18n';
import pick from 'lodash/pick';
import {type DashTabItemControlData, ErrorCode} from 'shared';
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
    const datasetsField =
        errorInfo?.details && 'sources' in errorInfo.details && errorInfo.details.sources
            ? Object.keys(errorInfo.details.sources)[0]
            : null;

    if (!datasetsField) {
        return null;
    }

    const datasetInfo = errorInfo?.details?.sources?.[datasetsField];

    const isIncorrectEntryIdCode =
        datasetInfo?.code === ErrorCode.IncorrectEntryIdForEmbed ||
        datasetInfo?.body?.code === ErrorCode.IncorrectEntryIdForEmbed;

    if (errorInfo?.code === CHARTS_ERROR_CODE.DATA_FETCHING_ERROR && isIncorrectEntryIdCode) {
        return i18n('label_error-outdated-message');
    }

    return null;
};
