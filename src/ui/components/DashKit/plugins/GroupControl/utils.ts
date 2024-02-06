import {DashTabItemControlData} from 'shared';

export const getControlWidth = (
    placementMode: DashTabItemControlData['placementMode'],
    width: DashTabItemControlData['width'],
) => {
    if (placementMode === 'auto') {
        return undefined;
    }

    return `${width}${placementMode}`;
};
