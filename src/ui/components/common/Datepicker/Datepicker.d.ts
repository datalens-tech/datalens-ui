import {PureComponent} from 'react';

import type {TextInputSize} from '@gravity-ui/uikit';

export interface DatepickerOutputDates {
    from: string | null;
    to: string | null;
}

type DateType = string | number;

export interface DatepickerProps {
    onUpdate: (value: DatepickerOutputDates) => void;
    onError?: () => void;
    from?: DateType | null;
    to?: DateType | null;
    min?: DateType;
    max?: DateType;
    format?: string;
    outputFormat?: string;
    emptyValueText?: string;
    placeholder?: string;
    timezoneOffset?: number;
    scale?: 'day' | 'week' | 'month' | 'quarter' | 'year';
    controlWidth?: number | string;
    range?: boolean;
    allowNullableValues?: boolean;
    showApply?: boolean;
    hasClear?: boolean;
    disabled?: boolean;
    controlSize?: TextInputSize;
    className?: string;
    popupClassName?: string;
}

export const datepickerDefaultProps: Partial<DatepickerProps>;

export class Datepicker extends PureComponent<DatepickerProps> {}
