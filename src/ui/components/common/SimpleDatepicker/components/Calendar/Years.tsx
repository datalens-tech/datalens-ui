import React from 'react';

import block from 'bem-cn-lite';

import {CalendarItem, getDataForYearsCalendar} from '../../utils';

import {YearsProps} from './types';

const b = block('dl-simple-datepicker');

export const Years: React.FC<YearsProps> = ({year, selectedDate, minDate, maxDate, dispatch}) => {
    const data = React.useMemo(
        () => getDataForYearsCalendar({year, selectedDate, minDate, maxDate}),
        [year, selectedDate, minDate, maxDate],
    );

    const getOnYearClick = React.useCallback(
        (nextYear: number) => {
            return (e: React.SyntheticEvent<HTMLDivElement>) => {
                e.stopPropagation();

                dispatch({
                    type: 'SET_CALENDAR',
                    payload: {year: nextYear, mode: 'year', animation: 'zoom-in'},
                });
            };
        },
        [dispatch],
    );

    const renderYear = React.useCallback(
        (item: CalendarItem) => (
            <div
                key={`${item.year}`}
                className={b('calendar-item', {
                    current: item.current,
                    selected: item.selected,
                    disabled: item.disabled,
                })}
                onClick={getOnYearClick(item.year)}
            >
                {item.year}
            </div>
        ),
        [getOnYearClick],
    );

    return <div className={b('calendar')}>{data.map(renderYear)}</div>;
};
