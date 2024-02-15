import {DashTabItemControlData} from 'shared';

export const getControlWidth = (
    placementMode: DashTabItemControlData['placementMode'],
    width: DashTabItemControlData['width'],
) => {
    if (placementMode === 'auto') {
        return '';
    }

    return `${width}${placementMode}`;
};

export const clearLoaderTimer = (timer?: NodeJS.Timeout) => {
    if (timer) {
        clearTimeout(timer);
    }
};

export const cancelCurrentRequests = (cancelSource: any) => {
    if (cancelSource) {
        cancelSource.cancel('DASHKIT_CONTROL_CANCEL_CURRENT_REQUESTS');
    }
};
