import {QLEntryDataShared} from '../../../../shared';

function _dispatchResize() {
    const customEvent = new CustomEvent('resize');
    customEvent.initEvent('resize');
    window.dispatchEvent(customEvent);
}

export const dispatchResize: (timeout?: number) => void = (timeout = 0) => {
    setTimeout(_dispatchResize, timeout);
};

export function getUniqueId(prefix = 'id') {
    return `${prefix}-${Date.now()}`;
}

export function prepareChartDataBeforeSave(chartData: QLEntryDataShared): QLEntryDataShared {
    return {
        ...chartData,
        params: chartData.params.map((param) => {
            return {
                type: param.type,
                name: param.name,
                defaultValue: param.defaultValue,
            };
        }),
    };
}
