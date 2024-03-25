import React from 'react';

import {guessUserTimeZone, isValid} from '@gravity-ui/date-utils';
import {useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DatepickerControlSize} from '../SimpleDatepicker';
import {getDefaultDateFormat} from '../SimpleDatepicker/utils';

import {RangeDatepickerPresetProvider} from './RangeDatepickerProvider';
import {Content, Control} from './components';
import {State, getInitialState, reducer} from './store';
import {RangeDatepickerProps} from './types';
import {useOnClickOutside} from './useOnClickOutside';
import {useOnFocusOutside} from './useOnFocusOutside';
import {
    findPreset,
    getDefaultPresetTabs,
    getOutputData,
    getStringifiedRange,
    isStringifiedRangesEqual,
} from './utils';

import './RangeDatepicker.scss';

const b = block('yc-range-datepicker');

export const RangeDatepicker: React.FC<RangeDatepickerProps> = (props) => {
    const {
        from,
        to,
        min,
        max,
        wrapClassName,
        controlClassName,
        popupClassName,
        placeholder,
        datePlaceholder,
        disabled,
        timeFormat = 'HH:mm',
        allowNullableValues = true,
        alwaysShowAsAbsolute = false,
        withTime = false,
        withPresets = true,
        presetTabs = getDefaultPresetTabs(withTime),
        withZonesList = false,
        withApplyButton = false,
        customControl,
        hasClear = true,
        hasCalendarIcon = true,
        label,
        getRangeTitle,
        onError,
        onUpdate,
        onOpenChange,
        timeZone = guessUserTimeZone(),
    } = props;
    const mobile = useMobile();
    // Default does not work for empty lines
    const size: DatepickerControlSize = props.size || 'm';
    const dateFormat = props.dateFormat || getDefaultDateFormat();
    const [
        {
            errors,
            selectedFrom,
            selectedTo,
            selectedTimeZone,
            lastOutputRange,
            active,
            callOnUpdate,
            clearHovered,
        },
        dispatch,
    ] = React.useReducer(reducer, getInitialState(from, to, timeZone));
    const controlRef = React.useRef<HTMLDivElement>(null);

    const hasIncompleteRange = React.useCallback(() => {
        return !allowNullableValues && (!selectedFrom || !selectedTo);
    }, [allowNullableValues, selectedFrom, selectedTo]);

    React.useEffect(() => {
        onOpenChange?.(active);
    }, [active, onOpenChange]);

    React.useEffect(() => {
        const nextErrors: State['errors'] = [];

        if (from && !isValid(from)) {
            nextErrors.push('from');
        }

        if (to && !isValid(to)) {
            nextErrors.push('to');
        }

        dispatch({
            type: 'SET_FROM_TO',
            payload: {selectedFrom: from, selectedTo: to, errors: nextErrors},
        });
    }, [from, to]);

    React.useEffect(() => {
        dispatch({type: 'SET_TIMEZONE', payload: {selectedTimeZone: timeZone}});
    }, [timeZone]);

    const close = React.useCallback(() => {
        dispatch({type: 'SET_ACTIVE', payload: {active: false}});
    }, []);

    const onInvalidInput = React.useCallback(() => {
        const nextOutputRange = getStringifiedRange({
            from: selectedFrom,
            to: selectedTo,
            timeZone: selectedTimeZone,
        });

        if (!isStringifiedRangesEqual(nextOutputRange, lastOutputRange)) {
            onError?.();

            dispatch({
                type: 'SET_LAST_OUTPUT_RANGE',
                payload: {lastOutputRange: nextOutputRange},
            });
        }
    }, [selectedFrom, selectedTo, selectedTimeZone, lastOutputRange, onError]);

    const output = React.useMemo(
        () =>
            getOutputData({
                from: selectedFrom,
                to: selectedTo,
                timeZone: selectedTimeZone,
            }),
        [selectedFrom, selectedTo, selectedTimeZone],
    );

    const onUpdateAttempt = React.useCallback(() => {
        if (errors.length) {
            onInvalidInput();
            close();

            return;
        }

        if (hasIncompleteRange()) {
            dispatch({
                type: 'SET_ERRORS',
                payload: {errors: errors.concat('incomplete-range')},
            });

            onInvalidInput();
            close();

            return;
        }
        const nextOutputRange = getStringifiedRange({
            from: output.from.date || '',
            to: output.to.date || '',
            timeZone: selectedTimeZone,
        });

        dispatch({
            type: 'SET_LAST_OUTPUT_RANGE',
            payload: {lastOutputRange: nextOutputRange},
        });

        onUpdate(output);

        close();
    }, [output, selectedTimeZone, errors, close, hasIncompleteRange, onInvalidInput, onUpdate]);

    React.useEffect(() => {
        if (!callOnUpdate) {
            return;
        }

        onUpdateAttempt();

        dispatch({type: 'SET_UPDATE', payload: {callOnUpdate: false}});
    }, [callOnUpdate, onUpdateAttempt]);

    const onFocusOutside = useOnFocusOutside(onUpdateAttempt, active && !mobile);

    const onClickOutside = useOnClickOutside(onUpdateAttempt, active && mobile);

    const onWrapFocus = React.useCallback(() => {
        if (!active && !clearHovered) {
            dispatch({type: 'SET_ACTIVE', payload: {active: true}});
        }

        onFocusOutside();
    }, [active, clearHovered, onFocusOutside]);

    const onWrapBlur = () => dispatch({type: 'SET_CLEAR_HOVERED', payload: {clearHovered: false}});

    const onWrapClick = React.useCallback(() => {
        if (!active) {
            dispatch({type: 'SET_ACTIVE', payload: {active: true}});
        }

        if (mobile) {
            onClickOutside();
        }
    }, [active, mobile, onClickOutside]);

    const presetProviderValue = React.useMemo(() => {
        const {selectedPreset, selectedPresetIndex, selectedTabIndex} = findPreset({
            presetTabs,
            from: selectedFrom,
            to: selectedTo,
        });

        return {
            presetTabs,
            withTime,
            selectedTabIndex,
            selectedPreset,
            selectedPresetIndex,
        };
    }, [withTime, presetTabs, selectedFrom, selectedTo]);

    const customRangeTitle = React.useMemo(() => getRangeTitle?.(output), [getRangeTitle, output]);

    return (
        <RangeDatepickerPresetProvider value={presetProviderValue}>
            <div
                ref={controlRef}
                className={b({mobile}, wrapClassName)}
                tabIndex={disabled ? -1 : 0}
                onFocus={mobile ? undefined : onWrapFocus}
                onBlur={mobile ? undefined : onWrapBlur}
                onClick={onWrapClick}
            >
                {customControl ? (
                    customControl
                ) : (
                    <Control
                        className={controlClassName}
                        size={size}
                        dateFormat={dateFormat}
                        errors={errors}
                        placeholder={placeholder}
                        from={selectedFrom}
                        to={selectedTo}
                        timeZone={selectedTimeZone}
                        timeFormat={timeFormat}
                        active={active}
                        label={label}
                        rangeTitle={customRangeTitle}
                        showAsAbsolute={alwaysShowAsAbsolute}
                        withTime={withTime}
                        hasClear={hasClear}
                        hasCalendarIcon={hasCalendarIcon}
                        disabled={disabled}
                        dispatch={dispatch}
                    />
                )}
                <Content
                    controlRef={controlRef}
                    errors={errors}
                    from={selectedFrom}
                    to={selectedTo}
                    min={min}
                    max={max}
                    dateFormat={dateFormat}
                    timeFormat={timeFormat}
                    timeZone={selectedTimeZone}
                    popupClassName={popupClassName}
                    datePlaceholder={datePlaceholder}
                    active={active}
                    withTime={withTime}
                    withPresets={withPresets}
                    withZonesList={withZonesList}
                    withApplyButton={withApplyButton}
                    allowNullableValues={allowNullableValues}
                    hasClear={hasClear}
                    dispatch={dispatch}
                    onUpdateAttempt={onUpdateAttempt}
                />
            </div>
        </RangeDatepickerPresetProvider>
    );
};
