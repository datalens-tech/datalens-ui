import type {WrappedHTML} from '../..';
import type {CommonPlaceholders} from '../config/wizard';

export type CommonPlaceholdersKeys = keyof CommonPlaceholders;

export type CommonPlaceholdersKeysWithoutConfigs = Exclude<
    CommonPlaceholdersKeys,
    'colorsConfig' | 'geopointsConfig' | 'shapesConfig' | 'tooltipConfig'
>;

export const MarkupItemTypes = {
    Bold: 'bold',
    Br: 'br',
    Color: 'color',
    Concat: 'concat',
    Italics: 'italics',
    Size: 'size',
    Text: 'text',
    Url: 'url',
    UserInfo: 'user_info',
    Image: 'img',
    Tooltip: 'tooltip',
} as const;

export type MarkupItemType = (typeof MarkupItemTypes)[keyof typeof MarkupItemTypes];

export interface MarkupItem {
    type: MarkupItemType;
    url?: string;
    children?: (MarkupItem | string)[];
    content?: string | MarkupItem;
    color?: string;
    size?: string | number;
    user_info?: 'name' | 'email';
    className?: string;
    src?: string;
    alt?: string;
    width?: number;
    height?: number;
    placement?: string;
    tooltip?: MarkupItem;
}

export type HighchartsSeriesCustomObject = {
    segmentTitle?: string | WrappedHTML;
};

export const enum AxisMode {
    Discrete = 'discrete',
    Continuous = 'continuous',
}

export const enum AxisLabelFormatMode {
    Auto = 'auto',
    ByField = 'by-field',
    Manual = 'manual',
}

export const enum AxisNullsMode {
    Ignore = 'ignore',
    Connect = 'connect',
    AsZero = 'as-0',
    UsePrevious = 'use-previous',
}

export const AxisAutoScaleModes = {
    // historically, auto mode was called min-max, so it is written that way in the config
    // todo: add renaming to the wizard config migration, when needs to add a new version
    Auto: 'min-max',
    MinMax: 'data-min-max',
    ZeroMax: '0-max',
} as const;

export type AxisAutoScaleMode = (typeof AxisAutoScaleModes)[keyof typeof AxisAutoScaleModes];
