import React from 'react';

import {dateTimeParse} from '@gravity-ui/date-utils';
import {useMobile} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {
    DatepickerControlSize,
    SimpleDatepicker,
    SimpleDatepickerOutput,
    SimpleDatepickerProps,
} from '../../../SimpleDatepicker';
import {OUTPUT_FORMAT} from '../../constants';
import {Action, State} from '../../store';
import {getDateStringWithoutOffset, getFlippedDates, isNeededToFlipDates} from '../../utils';

const i18n = I18n.keyset('components.common.RangeDatepicker');
const b = block('dl-range-datepicker');

interface PickersProps extends Omit<SimpleDatepickerProps, 'date' | 'onUpdate'> {
    dispatch: React.Dispatch<Action>;
    errors: State['errors'];
    from?: string;
    to?: string;
}

export const Pickers: React.FC<PickersProps> = (props) => {
    const {
        errors,
        from,
        to,
        min,
        max,
        dateFormat,
        timeFormat,
        datePlaceholder,
        timeZone,
        allowNullableValues,
        withTime,
        hasClear,
        dispatch,
    } = props;
    const toPickerRef = React.useRef<HTMLDivElement>(null);
    const mobile = useMobile();
    const size: DatepickerControlSize = mobile ? 'xl' : 'm';

    const selectFrom = React.useCallback(
        (opt: SimpleDatepickerOutput) => {
            const date = getDateStringWithoutOffset(opt.date);

            // unify dates for correct comparison
            const localFrom = dateTimeParse(date, {timeZone})?.format(OUTPUT_FORMAT);
            const localTo = dateTimeParse(to, {timeZone})?.format(OUTPUT_FORMAT);

            const nextErrors = errors.filter(
                (error) => !['from', 'incomplete-range'].includes(error),
            );

            let action: Action = {
                type: 'SET_FROM',
                payload: {
                    selectedFrom: date ? date : undefined,
                    errors: nextErrors,
                },
            };

            if (
                date &&
                to &&
                !nextErrors.includes('to') &&
                isNeededToFlipDates(localFrom, localTo)
            ) {
                const {nextFrom, nextTo} = getFlippedDates({
                    from: date,
                    to,
                    timeZone,
                    changed: 'from',
                });

                action = {
                    type: 'SET_FROM_TO',
                    payload: {
                        selectedFrom: nextFrom,
                        selectedTo: nextTo,
                        errors: action.payload.errors,
                    },
                };
            }

            if (date && !to) {
                toPickerRef.current?.focus();
            }

            dispatch(action);
        },
        [timeZone, errors, to, dispatch],
    );

    const selectTo = React.useCallback(
        (opt: SimpleDatepickerOutput) => {
            const date = getDateStringWithoutOffset(opt.date);

            // unify dates for correct comparison
            const localFrom = dateTimeParse(from, {timeZone})?.format(OUTPUT_FORMAT);
            const localTo = dateTimeParse(date, {timeZone})?.format(OUTPUT_FORMAT);

            const nextErrors = errors.filter(
                (error) => !['to', 'incomplete-range'].includes(error),
            );

            let action: Action = {
                type: 'SET_TO',
                payload: {
                    selectedTo: date ? date : undefined,
                    errors: nextErrors,
                    // !mobile - because it feels pretty unpleasant when this action works on a mobile device
                    // we need to keep an eye on this place and collect feedback from users
                    // @see DATAUI-1113
                    // callOnUpdate: Boolean(date && from && !to && !mobile),
                },
            };

            if (
                date &&
                from &&
                !nextErrors.includes('from') &&
                isNeededToFlipDates(localFrom, localTo)
            ) {
                const {nextFrom, nextTo} = getFlippedDates({
                    from,
                    to: date,
                    timeZone,
                    changed: 'to',
                });

                action = {
                    type: 'SET_FROM_TO',
                    payload: {
                        selectedFrom: nextFrom,
                        selectedTo: nextTo,
                        errors: action.payload.errors,
                    },
                };
            }

            dispatch(action);
        },
        [timeZone, errors, from, dispatch],
    );

    const onSelectFromError = React.useCallback<NonNullable<SimpleDatepickerProps['onError']>>(
        (data) => {
            dispatch({
                type: 'SET_FROM',
                payload: {
                    selectedFrom: data?.date,
                    errors: errors.includes('from') ? undefined : errors.concat('from'),
                },
            });
        },
        [errors, dispatch],
    );

    const onSelectToError = React.useCallback<NonNullable<SimpleDatepickerProps['onError']>>(
        (data) => {
            dispatch({
                type: 'SET_TO',
                payload: {
                    selectedTo: data?.date,
                    errors: errors.includes('to') ? undefined : errors.concat('to'),
                },
            });
        },
        [errors, dispatch],
    );

    return (
        <div className={b('pickers', {mobile})}>
            <SimpleDatepicker
                size={size}
                date={from}
                min={min}
                max={max}
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                wrapClassName={b('picker-wrap')}
                popupClassName={b('picker-popup')}
                controlClassName={b('picker')}
                label={i18n('from')}
                datePlaceholder={datePlaceholder}
                timeZone={timeZone}
                allowNullableValues={allowNullableValues}
                withTime={withTime}
                hasClear={hasClear}
                allowRelative={true}
                onUpdate={selectFrom}
                onError={onSelectFromError}
            />
            <SimpleDatepicker
                size={size}
                controlRef={toPickerRef}
                date={to}
                min={min}
                max={max}
                dateFormat={dateFormat}
                timeFormat={timeFormat}
                wrapClassName={b('picker-wrap')}
                popupClassName={b('picker-popup')}
                controlClassName={b('picker')}
                label={i18n('to')}
                datePlaceholder={datePlaceholder}
                timeZone={timeZone}
                allowNullableValues={allowNullableValues}
                withTime={withTime}
                hasClear={hasClear}
                allowRelative={true}
                setEndOfDayByDateClick={true}
                onUpdate={selectTo}
                onError={onSelectToError}
            />
        </div>
    );
};
