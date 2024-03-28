import React from 'react';

import block from 'bem-cn-lite';

import {Month} from './Month';
import {Year} from './Year';
import {Years} from './Years';
import {CalendarProps} from './types';

const b = block('dl-simple-datepicker');

export const Content: React.FC<CalendarProps & {shown?: boolean}> = (props) => {
    const {
        selectedDate,
        minDate,
        maxDate,
        calendar: {mode, month, year, animation},
        timeZone,
        shown,
        dispatch,
        onDateClick,
    } = props;
    const [content, setContent] = React.useState<React.ReactNode>(null);

    React.useEffect(() => {
        let nextContent: React.ReactNode = null;

        switch (mode) {
            case 'month':
                nextContent = (
                    <Month
                        month={month}
                        year={year}
                        timeZone={timeZone}
                        selectedDate={selectedDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        onDateClick={onDateClick}
                    />
                );
                break;
            case 'year':
                nextContent = (
                    <Year
                        year={year}
                        timeZone={timeZone}
                        selectedDate={selectedDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        dispatch={dispatch}
                    />
                );
                break;
            case 'years':
                nextContent = (
                    <Years
                        year={year}
                        timeZone={timeZone}
                        selectedDate={selectedDate}
                        minDate={minDate}
                        maxDate={maxDate}
                        dispatch={dispatch}
                    />
                );
        }

        setContent(nextContent);
    }, [mode, month, year, selectedDate, minDate, maxDate, timeZone, dispatch, onDateClick]);

    const onAnimationEnd = React.useCallback(() => {
        dispatch({type: 'SET_CALENDAR', payload: {animation: undefined}});
    }, [dispatch]);

    return (
        <div
            className={b('calendar-animated', {
                ...(animation && {[animation]: true, animating: true}),
            })}
            onAnimationEnd={shown ? onAnimationEnd : undefined}
        >
            {content}
        </div>
    );
};
