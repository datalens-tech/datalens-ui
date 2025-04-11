import type {DATASET_FIELD_TYPES, ServerFieldFormatting} from '../types';
import {NumberFormatType} from '../types';

import {WizardVisualizationId} from './visualization';

export const VISUALIZATIONS_WITH_NAVIGATOR = new Set([
    WizardVisualizationId.Line,
    WizardVisualizationId.Area,
    WizardVisualizationId.Area100p,
    WizardVisualizationId.Column,
]);

export enum NavigatorModes {
    Show = 'show',
    Hide = 'hide',
}

export type NavigatorPeriod = {
    type: DATASET_FIELD_TYPES;
    value: string;
    period: Period;
};

export type Period = 'month' | 'year' | 'day' | 'hour' | 'week' | 'quarter';

export enum NavigatorLinesMode {
    All = 'all',
    Selected = 'selected',
}

export enum PseudoFieldTitle {
    MeasureNames = 'Measure Names',
    MeasureValues = 'Measure Values',
}

export const DEFAULT_FORMATTING: ServerFieldFormatting = {
    format: NumberFormatType.Number,
    showRankDelimiter: true,
    prefix: '',
    postfix: '',
    unit: undefined,
    labelMode: 'absolute',
    precision: undefined,
};

export const DEFAULT_FLOAT_NUMBERS = 2;
export const DEFAULT_INTEGER_NUMBERS = 0;
export const MAX_SEGMENTS_NUMBER = 25;

export enum BarsColorType {
    Gradient = 'gradient',
    OneColor = 'one-color',
    TwoColor = 'two-color',
}

export enum BarsAlignValues {
    Left = 'left',
    Right = 'right',
    Default = 'default',
}

export const enum PlaceholderIndexes {
    xPlaceholder,
    yPlaceholder,
    y2Placeholder,
}

export enum SortDirection {
    ASC = 'ASC',
    DESC = 'DESC',
}

export const ZoomMode = {
    Auto: 'auto',
    Manual: 'manual',
} as const;

export type ZoomModes = (typeof ZoomMode)[keyof typeof ZoomMode];

export const MapCenterMode = {
    Auto: 'auto',
    Manual: 'manual',
} as const;

export type MapCenterModes = (typeof MapCenterMode)[keyof typeof MapCenterMode];
