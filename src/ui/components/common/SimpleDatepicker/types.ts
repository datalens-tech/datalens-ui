import type {DateTime, DateTimeInput} from '@gravity-ui/date-utils';
import type {TextInputSize} from '@gravity-ui/uikit';

export type DatepickerControlSize = TextInputSize;

export interface SimpleDatepickerProps {
    onUpdate: (res: SimpleDatepickerOutput) => void;
    onError?: (res?: SimpleDatepickerErrorOutput) => void;
    size?: DatepickerControlSize;
    date?: string;
    min?: string;
    max?: string;
    label?: string;
    dateFormat?: string;
    timeFormat?: 'HH:mm' | 'HH:mm:ss';
    datePlaceholder?: string;
    timeZone?: string;
    wrapClassName?: string;
    controlClassName?: string;
    popupClassName?: string;
    allowNullableValues?: boolean;
    allowRelative?: boolean;
    withTime?: boolean;
    hasClear?: boolean;
    disabled?: boolean;
    setEndOfDayByDateClick?: boolean;
    controlRef?: React.RefObject<HTMLDivElement>;
    showApply?: boolean;
}

export type SimpleDatepickerOutput = {
    date: string | null;
    type: 'absolute' | 'relative' | null;
    timeZone?: string;
};

export type SimpleDatepickerErrorOutput = {
    date: string;
    time: string;
};

export type GetOutputData = (opt: {
    clamped: boolean;
    resultDate?: DateTime;
}) => SimpleDatepickerOutput;

export type FillInputs = (opt?: {
    input?: DateTime | DateTimeInput;
    relative?: boolean;
    setEndOfDay?: boolean;
}) => void;

export type OnDateClick = (input: DateTimeInput) => void;
