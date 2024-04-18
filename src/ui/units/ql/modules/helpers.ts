import type {QlConfig} from 'shared/types/config/ql';

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

export function prepareChartDataBeforeSave(chartData: QlConfig): QlConfig {
    return {
        ...chartData,
        params: chartData.params.map((param) => {
            return {
                type: param.type,
                name: param.name,
                label: param.label,
                defaultValue: param.defaultValue,
            };
        }),
    };
}
