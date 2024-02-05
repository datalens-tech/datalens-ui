import {DashTabItemControlData, StringParams} from 'shared';
import {CLICK_ACTION_TYPE} from 'ui/libs/DatalensChartkit/ChartKit/components/Widget/components/constants';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {ActiveControl} from 'ui/libs/DatalensChartkit/types';

export const getChangedParams = ({
    initialParams,
    actualParams,
    param,
    value,
    data,
}: {
    actualParams: StringParams;
    initialParams: ChartInitialParams;
    param?: string;
    value?: string | string[];
    data: ActiveControl;
}) => {
    let newParams = {...actualParams};
    let callChangeByClick = false;

    if (data.type === 'button' && data?.onClick?.action === CLICK_ACTION_TYPE.SET_PARAMS) {
        callChangeByClick = true;
    } else if (
        data.type === 'button' &&
        data?.onClick?.action === CLICK_ACTION_TYPE.SET_INITIAL_PARAMS
    ) {
        newParams = initialParams?.params;
        callChangeByClick = true;
    } else if (param && value !== undefined) {
        newParams[param] = value;
    }

    return {newParams, callChangeByClick};
};

export const getControlWidth = (
    placementMode: DashTabItemControlData['placementMode'],
    width: DashTabItemControlData['width'],
) => {
    if (placementMode === 'auto') {
        return undefined;
    }

    return `${width}${placementMode}`;
};
