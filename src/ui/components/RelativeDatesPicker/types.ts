import type {FilterValue} from 'shared';

import type {DATE_TYPES} from './constants';

export type PresetItem = {
    currentDaySetup: boolean;
    end: string;
    id: string;
    start: string;
    title: string;
};

export type DatepickerOutput = {
    from: string | null;
    to: string | null;
};

export type Props = {
    value?: FilterValue;
    minDate?: string;
    maxDate?: string;
    datepickerScale?: string;
    range?: boolean;
    withTime?: boolean;
    onChange: (value: string, options: {valid: boolean}) => void;
};

type DateType = (typeof DATE_TYPES)[keyof typeof DATE_TYPES];

export type State = {
    start: DateType;
    end: DateType;
    absoluteStart: string | null;
    absoluteEnd: string | null;
    amountStart: string;
    amountEnd: string;
    scaleStart: string;
    scaleEnd: string;
    signStart: string;
    signEnd: string;
    presets: PresetItem[];
    includeCurrentDay: boolean;
    invalidRelativeStart: boolean;
    invalidRelativeEnd: boolean;
    invalidRange: boolean;
    hasPresetSelectChange: boolean;
    preset?: PresetItem | null;
    relativeStart?: string;
    relativeEnd?: string;
};
