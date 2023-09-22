import React from 'react';

import {
    DatepickerControlSize,
    SimpleDatepickerOutput,
    SimpleDatepickerProps,
} from '../SimpleDatepicker';

export interface RangeDatepickerProps {
    onUpdate: (output: RangeDatepickerOutput) => void;
    onError?: () => void;
    onOpenChange?: (open: boolean) => void;
    size?: DatepickerControlSize;
    from?: string;
    to?: string;
    min?: string;
    max?: string;
    dateFormat?: string;
    timeFormat?: SimpleDatepickerProps['timeFormat'];
    datePlaceholder?: string;
    placeholder?: string;
    timeZone?: string;
    wrapClassName?: string;
    controlClassName?: string;
    popupClassName?: string;
    allowNullableValues?: boolean;
    alwaysShowAsAbsolute?: boolean;
    withTime?: boolean;
    withPresets?: boolean;
    presetTabs?: RangeDatepickerPresetTab[];
    withZonesList?: boolean;
    withApplyButton?: boolean;
    hasClear?: boolean;
    hasCalendarIcon?: boolean;
    disabled?: boolean;
    customControl?: React.ReactNode;
    label?: string;
    getRangeTitle?: (output: RangeDatepickerOutput) => string | undefined;
}

export type RangeDatepickerOutput = {
    from: SimpleDatepickerOutput;
    to: SimpleDatepickerOutput;
};

export type Preset = {
    from: string;
    to: string;
    title: string;
};

export type RangeDatepickerPresetTab = {
    id: string;
    title: string;
    presets: Preset[];
};
