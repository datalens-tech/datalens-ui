import React from 'react';

import block from 'bem-cn-lite';

import {DayItem, getDataForMonthCalendar} from '../../utils';

import {MonthProps} from './types';

const b = block('yc-simple-datepicker');

export const Month: React.FC<MonthProps> = ({
    month,
    year,
    selectedDate,
    minDate,
    maxDate,
    timeZone,
    onDateClick,
}) => {
    const data = React.useMemo(
        () => getDataForMonthCalendar({month, year, timeZone, selectedDate, minDate, maxDate}),
        [month, year, timeZone, selectedDate, minDate, maxDate],
    );

    const getOnDayClick = (clickData: Parameters<typeof onDateClick>[0]) => {
        return () => onDateClick(clickData);
    };

    const renderDay = (item: DayItem) => (
        <div
            key={`${item.day}-${item.month}-${item.year}`}
            className={b('calendar-item', {
                current: item.current,
                selected: item.selected,
                disabled: item.disabled,
                weekend: item.weekend,
                'out-of-boundary': item.outOfBoundary,
            })}
            onClick={getOnDayClick({day: item.day, month: item.month, year: item.year})}
        >
            {item.day}
        </div>
    );

    return <div className={b('calendar', {month: true})}>{data.map(renderDay)}</div>;
};
