import type {LineShapeSettings} from 'shared';
import {LINE_CAP, LINE_JOIN} from 'shared';

export const DEFAULT_COMMON_LINE_SETTINGS: LineShapeSettings = {
    lineWidth: 'auto',
    linecap: LINE_CAP.Butt,
    linejoin: LINE_JOIN.Miter,
};

export const DIALOG_LINE_SHAPES_TABS = {
    LineSettings: 'line-settings',
    CommonSettings: 'common-settings',
};
