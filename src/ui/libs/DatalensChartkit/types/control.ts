import type {StringParams} from '../../../../shared';

export interface ControlBase {
    // type: 'select' | 'textarea' | 'input' | 'checkbox' | 'datepicker' | 'range-datepicker' | 'button';
    type: string;
    param: string;
    width: number | string;
    hidden: boolean;
    label: string;
    updateOnChange: boolean;
    updateControlsOnChange: boolean;
    postUpdateOnChange: boolean;
    operation?: string;
}

interface ControlSelect extends ControlBase {
    type: 'select';
    labelInside: boolean;
    innerLabel: string;
    multiselect: boolean;
    searchable: boolean;
    content: {title: string; value: string}[];
    required?: boolean;
    placeholder?: string;
    hasValidationError?: boolean;
}

interface ControlTextarea extends ControlBase {
    type: 'textarea';
    placeholder: string;
}

interface ControlInput extends ControlBase {
    type: 'input';
    placeholder: string;
    labelInside: boolean;
    innerLabel: string;
    required?: boolean;
    hasValidationError?: boolean;
}

interface ControlCheckbox extends ControlBase {
    type: 'checkbox';
}

interface ControlDatepicker extends ControlBase {
    type: 'datepicker';
    minDate: string | null;
    maxDate: string | null;
    required?: boolean;
    hasValidationError?: boolean;
}

export interface ControlRangeDatepicker extends ControlBase {
    type: 'range-datepicker';
    paramFrom: string;
    paramTo: string;
    minDate: string | null;
    maxDate: string | null;
    required?: boolean;
    hasValidationError?: boolean;
}

interface ControlButton extends ControlBase {
    type: 'button';
    onClick?: {
        action: 'setParams' | 'setInitialParams';
        args: StringParams;
    };
}

interface ControlLineBreak {
    type: 'line-break';
}

export type ActiveControl =
    | ControlSelect
    | ControlTextarea
    | ControlInput
    | ControlCheckbox
    | ControlDatepicker
    | ControlRangeDatepicker
    | ControlButton;

export type Control = ActiveControl | ControlLineBreak;

export type ValidatedControl =
    | ControlSelect
    | ControlInput
    | ControlDatepicker
    | ControlRangeDatepicker;
