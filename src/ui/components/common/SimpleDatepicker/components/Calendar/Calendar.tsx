import React from 'react';

import block from 'bem-cn-lite';

import {Content} from './Content';
import {CalendarProps} from './types';

const b = block('yc-simple-datepicker');

export const Calendar: React.FC<CalendarProps> = (props) => {
    const {
        calendar: {animation},
        prevCalendar,
    } = props;

    return (
        <div className={b('calendar-container')}>
            {animation && prevCalendar && <Content {...props} calendar={prevCalendar} />}
            <Content {...props} shown={true} />
        </div>
    );
};
