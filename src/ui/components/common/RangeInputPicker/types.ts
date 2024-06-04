import type {ReactElement} from 'react';

import type {IconProps, TextInputSize} from '@gravity-ui/uikit';
export interface RangeInputPickerDefaultProps {
    value?: number;
    minValue?: number;
    maxValue?: number;
    size?: TextInputSize;
    placeholder?: string;
    debounceDelay?: number;
    infoPointsCount?: number;
    step?: number;
    disabled?: boolean;
    readOnly?: boolean;
    autoFocus?: boolean;
}

export interface RangeInputPickerGeneralProps {
    onUpdate?: (value: number) => void;
    onAfterUpdate?: (value: number) => void;
    onOutsideClick?: (value: number) => void;
    displayFormat?: (value?: number) => string;
    format?: (value?: number) => string;
    parse?: (value: string) => number;
    onSubmit?: (value: number) => void;
    onBlur?: (value: number) => void;
    onFocus?: (value: number) => void;
    pattern?: string;
    iconLeft?: ReactElement<IconProps>;
    iconRight?: ReactElement<IconProps>;
    availableValues?: number[];
    className?: string;
}

export type RangeInputPickerProps = RangeInputPickerDefaultProps & RangeInputPickerGeneralProps;
