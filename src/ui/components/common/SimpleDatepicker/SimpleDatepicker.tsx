import React from 'react';

import {DateTime, dateTimeParse, guessUserTimeZone, isDateTime} from '@gravity-ui/date-utils';
import {Button, Popup, useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {Calendar, Control, Switcher} from './components';
import {
    DATE_INPUT_NAME,
    OUTPUT_FORMAT,
    POPUP_VERTICAL_OFFSET,
    TIME_INPUT_NAME,
    UTC_TIMEZONE,
} from './constants';
import {InputValueType, State, getInitialState, reducer} from './store';
import {
    DatepickerControlSize,
    FillInputs,
    GetOutputData,
    OnDateClick,
    SimpleDatepickerProps,
} from './types';
import {useOnFocusOutside} from './useOnFocusOutside';
import {usePreviousValue} from './usePreviousValue';
import {
    clampDate,
    getCalendarConfigFromDate,
    getDefaultDateFormat,
    getDefaultDatePlaceholder,
    getErrorMessage,
    getStringifiedDate,
    getTimePlaceholder,
    getUserInputErrors,
    isDatePropsValid,
    isStartsLikeRelative,
    isTimeInputValid,
    parseUserInput,
    replaceTimeZone,
} from './utils';

import './SimpleDatepicker.scss';

const i18n = I18n.keyset('components.common.SimpleDatepicker');

const b = block('dl-simple-datepicker');

export const SimpleDatepicker: React.FC<SimpleDatepickerProps> = (props) => {
    const {
        controlRef,
        date,
        min,
        max,
        label,
        datePlaceholder,
        wrapClassName,
        controlClassName,
        popupClassName,
        disabled,
        allowNullableValues = true,
        allowRelative = false,
        withTime = false,
        hasClear = true,
        setEndOfDayByDateClick = false,
        showApply = false,
        onUpdate,
        onError,
    } = props;
    const prevProps = usePreviousValue(props);
    const mobile = useMobile();
    // In native time inputs, the time is set only in the format 'HH:mm'.
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/time#chrome_and_opera
    const timeFormat: SimpleDatepickerProps['timeFormat'] =
        mobile || !props.timeFormat ? 'HH:mm' : props.timeFormat;
    // Default does not work for empty lines
    const size: DatepickerControlSize = props.size || 'm';
    const timeZone = props.timeZone || guessUserTimeZone();
    const dateFormat = props.dateFormat || getDefaultDateFormat();
    const [
        {
            errors,
            valueType,
            dateInput,
            timeInput,
            calendar,
            prevCalendar,
            lastOutput,
            active,
            touched,
            callOnUpdate,
            doRestoreInput,
        },
        dispatch,
    ] = React.useReducer(reducer, getInitialState(date, timeZone));
    const innerControlRef = React.useRef<HTMLDivElement>(null);
    const handledControlRef = controlRef || innerControlRef;
    const selectedDate = React.useMemo(
        () =>
            parseUserInput({
                dateInput,
                dateFormat,
                timeInput,
                timeFormat,
                timeZone,
                allowRelative,
                setEndOfDayByDateClick,
                withTime: dateInput.startsWith('now') ? false : withTime,
            }),
        [
            dateInput,
            dateFormat,
            timeInput,
            timeFormat,
            timeZone,
            withTime,
            allowRelative,
            setEndOfDayByDateClick,
        ],
    );
    const minDate = React.useMemo(
        () => dateTimeParse(min, {timeZone})?.startOf('day'),
        [min, timeZone],
    );
    const maxDate = React.useMemo(
        () => dateTimeParse(max, {timeZone})?.endOf('day'),
        [max, timeZone],
    );
    const errorMessage = React.useMemo(
        () => getErrorMessage({errors, dateFormat, timeFormat, relative: valueType === 'relative'}),
        [dateFormat, timeFormat, errors, valueType],
    );

    const fillInputs: FillInputs = React.useCallback(
        ({input, relative, setEndOfDay} = {}) => {
            const entries: [string, string][] = [];

            if (relative && typeof input === 'string') {
                entries.push([DATE_INPUT_NAME, input]);
            } else {
                let nextDate;
                if (isDateTime(input)) {
                    nextDate = input;
                } else if (input && typeof input === 'object') {
                    nextDate = dateTimeParse(input, {timeZone: UTC_TIMEZONE});
                    if (nextDate && timeZone && timeZone !== UTC_TIMEZONE) {
                        // set timezone to the parsed date from calendar.
                        nextDate = replaceTimeZone(nextDate, timeZone);
                    }
                } else {
                    nextDate = dateTimeParse(input, {timeZone});
                }

                if (nextDate) {
                    if (setEndOfDay) {
                        nextDate = nextDate.endOf('day');
                    }

                    entries.push(
                        [DATE_INPUT_NAME, nextDate.format(dateFormat)],
                        [TIME_INPUT_NAME, nextDate.format(timeFormat)],
                    );
                }
            }

            dispatch({
                type: 'SET_INPUTS',
                payload: {entries},
            });
        },
        [dateFormat, timeFormat, timeZone],
    );

    React.useEffect(() => {
        if (props === prevProps && !doRestoreInput) {
            return;
        }

        const nextErrors: InputValueType[] = [];
        const timeValid = isTimeInputValid({timeInput, dateFormat, timeFormat, withTime});
        const dateValid = isDatePropsValid({date, allowRelative});

        if (date && dateValid && timeValid) {
            fillInputs({input: date, relative: isStartsLikeRelative(date)});
        } else if (date) {
            if (!dateValid) {
                nextErrors.push('date');
            }

            if (!timeValid) {
                nextErrors.push('time');
            }

            dispatch({
                type: 'SET_INPUTS',
                payload: {
                    entries: [[DATE_INPUT_NAME, date]],
                },
            });
        } else {
            if (touched && !active && !allowNullableValues && !date) {
                nextErrors.push('date');
            }

            dispatch({
                type: 'SET_INPUTS',
                payload: {
                    entries: [
                        [DATE_INPUT_NAME, ''],
                        [TIME_INPUT_NAME, ''],
                    ],
                },
            });
        }

        dispatch({
            type: 'SET_LAST_OUTPUT',
            payload: {lastOutput: timeValid && dateValid ? date : ''},
        });

        dispatch({type: 'SET_ERRORS', payload: {errors: nextErrors}});
    }, [
        props,
        prevProps,
        date,
        dateFormat,
        timeFormat,
        withTime,
        allowRelative,
        allowNullableValues,
        active,
        touched,
        timeInput,
        fillInputs,
        doRestoreInput,
    ]);

    React.useEffect(() => {
        if (mobile || !selectedDate) {
            return;
        }

        const nextValueType: State['valueType'] = isStartsLikeRelative(dateInput)
            ? 'relative'
            : 'absolute';

        if (valueType !== nextValueType) {
            dispatch({
                type: 'SET_VALUE_TYPE',
                payload: {valueType: nextValueType},
            });
        }

        dispatch({
            type: 'SET_CALENDAR',
            payload: {...getCalendarConfigFromDate(selectedDate)},
        });
    }, [mobile, selectedDate, dateInput, valueType]);

    const getOutputData: GetOutputData = React.useCallback(
        ({resultDate, clamped}) => {
            const actualValueType: State['valueType'] = isStartsLikeRelative(dateInput)
                ? 'relative'
                : 'absolute';
            let dateValue: string | null = null;

            if (actualValueType === 'relative' && !clamped) {
                dateValue = dateInput ? dateInput : null;
            } else {
                dateValue = resultDate ? resultDate.format(OUTPUT_FORMAT) : null;
            }

            return {timeZone, date: dateValue, type: dateValue ? actualValueType : null};
        },
        [timeZone, dateInput],
    );

    const isUserInputValid = React.useCallback(
        (resultDate?: DateTime) => {
            const emptyInput = !dateInput && !timeInput;
            return (allowNullableValues && emptyInput) || Boolean(resultDate);
        },
        [dateInput, timeInput, allowNullableValues],
    );

    const onInvalidInput = React.useCallback(() => {
        const nextErrors = getUserInputErrors({
            dateInput,
            dateFormat,
            timeInput,
            timeFormat,
            withTime,
        });

        const nextOutput = `${dateInput}-${timeInput}`;

        if (nextOutput !== lastOutput) {
            onError?.({date: dateInput, time: timeInput});
        }

        dispatch({
            type: 'SET_ERRORS',
            payload: {errors: nextErrors, lastOutput: nextOutput},
        });
    }, [dateInput, dateFormat, timeInput, timeFormat, lastOutput, withTime, onError]);

    const close = React.useCallback(() => {
        dispatch({type: 'SET_ACTIVE', payload: {active: false}});
    }, []);

    const onChangeAttempt = React.useCallback(() => {
        let resultDate = selectedDate;
        let clamped = false;

        if (!isUserInputValid(resultDate)) {
            onInvalidInput();

            close();

            return;
        }

        ({resultDate, clamped} = clampDate({date: resultDate, minDate, maxDate}));

        if (resultDate && resultDate !== selectedDate) {
            fillInputs({input: resultDate});
        }

        const outputData = getOutputData({resultDate, clamped});

        if (outputData.type && outputData.type !== valueType) {
            dispatch({
                type: 'SET_VALUE_TYPE',
                payload: {valueType: outputData.type},
            });
        }

        const nextOutput = getStringifiedDate(outputData.date || '', timeZone);

        if (nextOutput !== lastOutput) {
            dispatch({
                type: 'SET_LAST_OUTPUT',
                payload: {lastOutput: nextOutput},
            });

            onUpdate(outputData);
        }

        close();
    }, [
        timeZone,
        valueType,
        selectedDate,
        minDate,
        maxDate,
        lastOutput,
        isUserInputValid,
        onInvalidInput,
        fillInputs,
        getOutputData,
        onUpdate,
        close,
    ]);

    React.useEffect(() => {
        if (!callOnUpdate) {
            return;
        }

        onChangeAttempt();

        dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: false}});
    }, [callOnUpdate, onChangeAttempt]);

    const onDateClick: OnDateClick = React.useCallback(
        (input) => {
            fillInputs({input, setEndOfDay: setEndOfDayByDateClick});
            dispatch({type: 'ON_DATE_CLICK'});

            if (!showApply) {
                dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
            }
        },
        [setEndOfDayByDateClick, fillInputs, showApply],
    );

    const onFocusOutside = useOnFocusOutside(onChangeAttempt, active && !mobile);

    const onWrapBlur = () => dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: false}});

    const onApplyClick = React.useCallback(() => {
        dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: true}});
    }, []);

    const onContainerKeyDown: React.KeyboardEventHandler<HTMLDivElement> = React.useCallback(
        (e) => {
            if (e.key === 'Escape' && showApply) {
                dispatch({type: 'SET_RESTORE_INPUT'});
            }
        },
        [showApply],
    );

    return (
        <div
            className={b(null, wrapClassName)}
            onFocus={mobile ? undefined : onFocusOutside}
            onBlur={mobile ? undefined : onWrapBlur}
            onKeyDown={onContainerKeyDown}
        >
            <Control
                ref={handledControlRef}
                className={controlClassName}
                size={size}
                errorMessage={errorMessage}
                valueType={valueType}
                date={dateInput}
                time={timeInput}
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                datePlaceholder={datePlaceholder || getDefaultDatePlaceholder()}
                timePlaceholder={getTimePlaceholder(timeFormat)}
                label={label}
                errors={errors}
                min={minDate}
                max={maxDate}
                active={active}
                withTime={withTime}
                hasClear={hasClear}
                showValueTypeButton={mobile && allowRelative}
                disabled={disabled}
                dispatch={dispatch}
            />
            {!mobile && (
                <Popup
                    contentClassName={b('popup', popupClassName)}
                    open={active && !disabled}
                    anchorRef={handledControlRef}
                    offset={[0, POPUP_VERTICAL_OFFSET]}
                    placement={['bottom-start', 'top-start']}
                    onClose={onChangeAttempt}
                >
                    <Switcher calendar={calendar} dispatch={dispatch} />
                    <Calendar
                        calendar={calendar}
                        prevCalendar={prevCalendar}
                        selectedDate={selectedDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        timeZone={timeZone}
                        dispatch={dispatch}
                        onDateClick={onDateClick}
                    />
                    {showApply && (
                        <div className={b('apply-btn')}>
                            <Button view="action" width="max" onClick={onApplyClick}>
                                {i18n('apply_button_text')}
                            </Button>
                        </div>
                    )}
                </Popup>
            )}
        </div>
    );
};
