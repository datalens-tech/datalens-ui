import React from 'react';

import {DateTime} from '@gravity-ui/date-utils';
import {Button, Icon, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DATE_INPUT_NAME, KeyCode, TIME_INPUT_NAME} from '../../constants';
import {Action, InputValueType} from '../../store';
import {DatepickerControlSize, SimpleDatepickerOutput, SimpleDatepickerProps} from '../../types';
import {getFormattedDate, getValueForNativeInput} from '../../utils';

import {Actions} from './Actions';
import {Input} from './Input';

import relativeModeIcon from '../../../../../assets/icons/relative-mode.svg';

const b = block('yc-simple-datepicker');

interface ControlProps {
    dispatch: React.Dispatch<Action>;
    size: DatepickerControlSize;
    errors: InputValueType[];
    valueType: SimpleDatepickerOutput['type'];
    className?: string;
    errorMessage?: string;
    date?: string;
    time?: string;
    dateFormat?: string;
    timeFormat?: SimpleDatepickerProps['timeFormat'];
    datePlaceholder?: string;
    timePlaceholder?: string;
    label?: string;
    min?: DateTime;
    max?: DateTime;
    active?: boolean;
    withTime?: boolean;
    hasClear?: boolean;
    showValueTypeButton?: boolean;
    disabled?: boolean;
}

export const Control = React.forwardRef<HTMLDivElement, ControlProps>((props, ref) => {
    const {
        size,
        date,
        time,
        valueType,
        className,
        dateFormat,
        timeFormat,
        datePlaceholder,
        timePlaceholder,
        label,
        active,
        errors,
        errorMessage,
        min,
        max,
        withTime,
        hasClear,
        showValueTypeButton,
        disabled,
        dispatch,
    } = props;
    const mobile = useMobile();
    const dateInputRef = React.useRef<HTMLInputElement>(null);
    const nativeDateInputRef = React.useRef<HTMLInputElement>(null);
    const timeInputRef = React.useRef<HTMLInputElement>(null);
    const dateNative = mobile
        ? getValueForNativeInput({date, format: dateFormat, type: 'date'})
        : undefined;
    const timeNative = mobile
        ? getValueForNativeInput({
              date: `${date} ${time}`,
              format: `${dateFormat} ${timeFormat}`,
              type: 'time',
          })
        : undefined;
    const relative = valueType === 'relative';
    const showClear = Boolean(withTime ? date || time : date) && hasClear && !disabled;
    const minDate = mobile ? getFormattedDate(min) : undefined;
    const maxDate = mobile ? getFormattedDate(max) : undefined;
    const mods = {
        size,
        active,
        mobile,
        disabled,
        invalid: Boolean(errors?.length),
        'with-label': Boolean(label),
        'with-time': withTime,
    };

    const getDateInputRef = React.useCallback(() => {
        return mobile && !relative ? nativeDateInputRef : dateInputRef;
    }, [mobile, relative, dateInputRef, nativeDateInputRef]);

    React.useEffect(() => {
        if (!active && !mobile) {
            dateInputRef.current?.blur();
            timeInputRef.current?.blur();
        }
    }, [active, mobile, getDateInputRef]);

    const clearPossibleErrors = React.useCallback(() => {
        if (errors?.length) {
            dispatch({type: 'SET_ERRORS', payload: {errors: []}});
        }
    }, [errors, dispatch]);

    const onInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
        (e) => {
            const isDateInput = e.target.name === DATE_INPUT_NAME;
            let inputValue = e.target.value;

            // In native date inputs, the date is returned in the format 'yyyy-mm-dd',
            // therefore, cast it to a user format.
            // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/date#value
            if (mobile && isDateInput && !relative) {
                inputValue = getFormattedDate(inputValue, dateFormat);
            }

            // Native inputs call onChange on every change, so
            // do not dispatch the 'SET_UPDATE' event in cases when only the time input is filled.
            if (mobile && !relative && (date || isDateInput)) {
                dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
            }

            dispatch({
                type: 'SET_INPUTS',
                payload: {
                    entries: [[e.target.name, inputValue]],
                },
            });

            clearPossibleErrors();
        },
        [date, dateFormat, relative, mobile, dispatch, clearPossibleErrors],
    );

    const onInputFocus = React.useCallback(() => {
        dispatch({type: 'SET_ACTIVE', payload: {active: true}});
    }, [dispatch]);

    const onInputKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === KeyCode.Enter) {
                dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
            }
        },
        [dispatch],
    );

    const onInputBlur = React.useCallback(() => {
        dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
    }, [dispatch]);

    const clear = React.useCallback(() => {
        dispatch({
            type: 'SET_INPUTS',
            payload: {
                entries: [
                    [DATE_INPUT_NAME, ''],
                    [TIME_INPUT_NAME, ''],
                ],
            },
        });

        if (active && (relative || !mobile)) {
            dateInputRef.current?.focus();
        } else if (!active) {
            dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
        }

        clearPossibleErrors();
    }, [active, mobile, relative, dispatch, clearPossibleErrors]);

    const onActionsClick = () => getDateInputRef().current?.focus();

    const onValueTypeButtonClick = React.useCallback(() => {
        const nextValueType = valueType === 'absolute' ? 'relative' : 'absolute';

        dispatch({
            type: 'SET_VALUE_TYPE',
            payload: {
                valueType: nextValueType,
            },
        });

        if (nextValueType === 'relative') {
            dateInputRef.current?.focus();
        }
    }, [valueType, dispatch]);

    return (
        <React.Fragment>
            <div ref={ref} className={b('control', mods, className)}>
                {label && (
                    <span title={label} className={b('control-label')}>
                        {label}
                    </span>
                )}
                <Input
                    ref={dateInputRef}
                    size={size}
                    name={DATE_INPUT_NAME}
                    type={'date'}
                    placeholder={datePlaceholder}
                    value={date}
                    active={active}
                    relative={relative}
                    disabled={disabled}
                    invalid={errors.includes('date')}
                    native={false}
                    onChange={onInputChange}
                    onFocus={onInputFocus}
                    onKeyDown={onInputKeyDown}
                >
                    {mobile && (
                        <Input
                            ref={nativeDateInputRef}
                            name={DATE_INPUT_NAME}
                            type={'date'}
                            value={dateNative}
                            min={minDate}
                            max={maxDate}
                            active={active}
                            disabled={disabled || relative}
                            native={true}
                            onChange={onInputChange}
                            onFocus={onInputFocus}
                        />
                    )}
                </Input>
                {withTime && valueType === 'absolute' && (
                    <Input
                        ref={timeInputRef}
                        size={size}
                        name={TIME_INPUT_NAME}
                        type={'time'}
                        placeholder={timePlaceholder}
                        value={time}
                        active={active}
                        disabled={disabled}
                        invalid={errors.includes('time')}
                        onChange={onInputChange}
                        onKeyDown={onInputKeyDown}
                        onBlur={onInputBlur}
                    >
                        {mobile && (
                            <Input
                                name={TIME_INPUT_NAME}
                                type={'time'}
                                value={timeNative}
                                min={minDate}
                                max={maxDate}
                                active={active}
                                disabled={disabled || relative}
                                native={true}
                                onChange={onInputChange}
                                onBlur={onInputBlur}
                            />
                        )}
                    </Input>
                )}
                <Actions
                    errorMessage={errorMessage}
                    showClear={showClear}
                    clear={clear}
                    dispatch={dispatch}
                    onClick={showClear ? undefined : onActionsClick}
                />
            </div>
            {showValueTypeButton && !disabled && (
                <Button
                    className={b('value-type-button')}
                    size={size}
                    view={valueType === 'relative' ? undefined : 'outlined'}
                    selected={valueType === 'relative'}
                    onClick={onValueTypeButtonClick}
                >
                    <Icon data={relativeModeIcon} />
                </Button>
            )}
        </React.Fragment>
    );
});

Control.displayName = 'Control';
