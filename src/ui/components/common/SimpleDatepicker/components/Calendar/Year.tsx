import React from 'react';

import block from 'bem-cn-lite';

import {MonthItem, getDataForYearCalendar} from '../../utils';

import {YearProps} from './types';

const b = block('yc-simple-datepicker');

export const Year: React.FC<YearProps> = ({
    year,
    timeZone,
    selectedDate,
    minDate,
    maxDate,
    dispatch,
}) => {
    const data = React.useMemo(
        () => getDataForYearCalendar({year, timeZone, selectedDate, minDate, maxDate}),
        [year, timeZone, selectedDate, minDate, maxDate],
    );

    const getOnMonthClick = React.useCallback(
        (nextMonth: number) => {
            return (e: React.SyntheticEvent<HTMLDivElement>) => {
                e.stopPropagation();

                dispatch({
                    type: 'SET_CALENDAR',
                    payload: {month: nextMonth, mode: 'month', animation: 'zoom-in'},
                });
            };
        },
        [dispatch],
    );

    const renderMonth = React.useCallback(
        (item: MonthItem) => (
            <div
                key={`${item.month}-${item.year}`}
                className={b('calendar-item', {
                    current: item.current,
                    selected: item.selected,
                    disabled: item.disabled,
                })}
                onClick={getOnMonthClick(item.month)}
            >
                {item.title}
            </div>
        ),
        [getOnMonthClick],
    );

    return <div className={b('calendar')}>{data.map(renderMonth)}</div>;
};
