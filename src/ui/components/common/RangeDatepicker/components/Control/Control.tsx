import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DatepickerControlSize} from '../../../SimpleDatepicker';
import {Action, State} from '../../store';
import {RangeDatepickerProps} from '../../types';
import {getErrorMessage} from '../../utils';

import {Actions} from './Actions';
import {Label} from './Label';

import calendarIcon from '../../../../../assets/icons/calendar-2.svg';

const b = block('yc-range-datepicker');

interface ControlProps {
    dispatch: React.Dispatch<Action>;
    size: DatepickerControlSize;
    dateFormat: string;
    errors: State['errors'];
    placeholder?: string;
    from?: string;
    to?: string;
    className?: string;
    timeZone?: string;
    timeFormat?: RangeDatepickerProps['timeFormat'];
    active?: boolean;
    showAsAbsolute?: boolean;
    withTime?: boolean;
    hasClear?: boolean;
    hasCalendarIcon?: boolean;
    disabled?: boolean;
    label?: string;
    rangeTitle?: string;
}

export const Control = React.forwardRef<HTMLDivElement, ControlProps>((props, ref) => {
    const {
        size,
        className,
        dateFormat,
        errors,
        placeholder,
        from,
        to,
        timeZone,
        timeFormat,
        active,
        showAsAbsolute,
        withTime,
        hasClear,
        hasCalendarIcon,
        disabled,
        label,
        rangeTitle,
        dispatch,
    } = props;
    const showClear = Boolean((from || to) && hasClear && !disabled);
    const mods = {
        size,
        active,
        disabled,
        invalid: Boolean(errors.length),
        'with-time': withTime,
    };

    return (
        <div ref={ref} className={b('control', mods, className)}>
            {hasCalendarIcon && <Icon className={b('control-calendar-icon')} data={calendarIcon} />}
            {label && (
                <span title={label} className={b('control-inner-label')}>
                    {label}
                </span>
            )}
            {!from && !to ? (
                <span className={b('control-placeholder')}>{placeholder}</span>
            ) : (
                <Label
                    dateFormat={dateFormat}
                    errors={errors}
                    from={from}
                    to={to}
                    rangeTitle={rangeTitle}
                    timeZone={timeZone}
                    timeFormat={timeFormat}
                    active={active}
                    showAsAbsolute={showAsAbsolute}
                    withTime={withTime}
                />
            )}
            <Actions
                errorMessage={getErrorMessage(errors)}
                showClear={showClear}
                dispatch={dispatch}
            />
        </div>
    );
});

Control.displayName = 'Control';
