import type {ControlShared} from '../types';

export const buildUI = ({shared}: {shared: ControlShared}) => {
    return [shared.uiControl];
};
