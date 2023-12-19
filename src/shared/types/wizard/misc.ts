import {CommonPlaceholders} from '../config/wizard';

export type CommonPlaceholdersKeys = keyof CommonPlaceholders;

export type CommonPlaceholdersKeysWithoutConfigs = Exclude<
    CommonPlaceholdersKeys,
    'colorsConfig' | 'geopointsConfig' | 'shapesConfig'
>;

export interface MarkupItem {
    type: 'bold' | 'concat' | 'italics' | 'url' | 'text';
    url?: string;
    children?: MarkupItem[];
    content?: string | MarkupItem;
}

export type HighchartsSeriesCustomObject = {
    segmentTitle?: string;
};

export const enum TableFieldDisplayMode {
    Auto = 'auto',
    Visible = 'visible',
    Hidden = 'hidden',
}

export const enum AxisMode {
    Discrete = 'discrete',
    Continuous = 'continuous',
}

export const enum AxisLabelFormatMode {
    Auto = 'auto',
    ByField = 'by-field',
}
