import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _range from 'lodash/range';
import _repeat from 'lodash/repeat';
import {DateTime} from 'luxon';
import PropTypes from 'prop-types';

import {MONTHS, WEEKDAYS} from '../constants';

import './Month.scss';

const i18n = I18n.keyset('components.common.Datepicker');

const b = block('dl-datepicker-month');
const CELLS = {
    DAY: 'day',
    TITLE: 'title',
};

const isDatesEqual = (d1, d2) => {
    if (!d1 || !d2) {
        return false;
    }

    return d1.hasSame(d2, 'day') && d1.hasSame(d2, 'month') && d1.hasSame(d2, 'year');
};

export class Month extends React.Component {
    static propTypes = {
        month: PropTypes.number.isRequired,
        year: PropTypes.number.isRequired,
        from: PropTypes.object,
        to: PropTypes.object,
        min: PropTypes.object,
        max: PropTypes.object,
        selectedInterval: PropTypes.object,
        hovered: PropTypes.object,
        zone: PropTypes.string,
        isDefaultFrom: PropTypes.bool,
        isNeedScroll: PropTypes.bool,
        onDateClick: PropTypes.func,
        onRangeDateClick: PropTypes.func,
    };

    scrollRef = React.createRef();

    firstMonthDate = DateTime.fromObject({
        year: this.props.year,
        month: this.props.month,
        day: 1,
        zone: this.props.zone,
    });

    todayDateTime = DateTime.fromObject({zone: this.props.zone});

    titleCells =
        this.firstMonthDate.weekday < WEEKDAYS.THURSDAY
            ? WEEKDAYS.SUNDAY
            : this.firstMonthDate.weekday - 1;

    isMonthIncludeToday =
        this.todayDateTime >= this.firstMonthDate &&
        this.todayDateTime <= this.firstMonthDate.endOf('month');

    getOnDateClick = ({start, end}) => {
        const {onDateClick, onRangeDateClick} = this.props;

        if (onRangeDateClick) {
            return () => onRangeDateClick({start, end});
        }

        return () => onDateClick({dateTime: start});
    };

    renderTitleCell = ({titleCell, month, year}) => {
        const {min, max} = this.props;

        const startMonth = this.firstMonthDate;
        const endMonth = this.firstMonthDate.set({day: startMonth.daysInMonth});
        const disabled = (min && endMonth < min) || (max && startMonth > max);
        let title = titleCell === 0 ? i18n(`month_long_${month}`) : null;

        if (title && [MONTHS.DECEMBER, MONTHS.JANUARY].includes(month)) {
            title += ` ${year}`;
        }

        return (
            <div key={`title-${titleCell}-${month}-${year}`} className={b(CELLS.TITLE, {disabled})}>
                {title}
            </div>
        );
    };

    renderEmptyCell = ({emptyCell, month, year}) => {
        return <div key={`empty-${emptyCell}-${month}-${year}`} />;
    };

    // eslint-disable-next-line complexity
    getMods = ({currentDateTime, mergedIntervals, flags}) => {
        const {min, max, selectedInterval, hovered, isDefaultFrom, onRangeDateClick} = this.props;

        let isToday = false;
        let isSelected = false;

        if (this.isMonthIncludeToday && !flags.hasToday) {
            isToday = isDatesEqual(currentDateTime, this.todayDateTime);

            if (isToday) {
                flags.hasToday = true;
            }
        }

        if (hovered && onRangeDateClick) {
            isSelected =
                selectedInterval.contains(currentDateTime) || hovered.contains(currentDateTime);
        } else if (hovered) {
            isSelected = mergedIntervals
                ? mergedIntervals.contains(currentDateTime)
                : hovered.contains(currentDateTime);
        } else {
            isSelected = selectedInterval.contains(currentDateTime) && !isDefaultFrom;
        }

        const disabled = (min && currentDateTime < min) || (max && currentDateTime > max);
        const isMonday = currentDateTime.weekday === WEEKDAYS.MONDAY;
        const isSunday = currentDateTime.weekday === WEEKDAYS.SUNDAY;
        const isFirsDay = currentDateTime.day === 1;
        const isLastDay = currentDateTime.day === currentDateTime.daysInMonth;

        const mods = {
            disabled,
            weekend: currentDateTime.weekday >= WEEKDAYS.SATURDAY,
            today: isToday,
            selected: isSelected,
            'left-edge': isMonday || isFirsDay,
            'right-edge': isSunday || isLastDay,
        };

        return mods;
    };

    renderDayCell = ({day, month, year, mergedIntervals}) => {
        const {hovered, onRangeDateClick} = this.props;
        const flags = {
            hasToday: false,
        };

        const currentDateTime = this.firstMonthDate.set({day});
        const mods = this.getMods({currentDateTime, mergedIntervals, flags});

        let start = currentDateTime;
        let end;

        if (hovered && onRangeDateClick) {
            [start, end] = [hovered.start, hovered.end];
        }

        return (
            <div
                key={`${day}-${month}-${year}`}
                className={b(CELLS.DAY, mods)}
                // eslint-disable-next-line react/no-unknown-property
                date={currentDateTime.toISODate()}
                {...(!mods.disabled && {onClick: this.getOnDateClick({start, end})})}
            >
                {day}
            </div>
        );
    };

    renderMonth = () => {
        const {month, year, selectedInterval, hovered, onRangeDateClick} = this.props;
        const emptyCells =
            this.titleCells === WEEKDAYS.SUNDAY ? this.firstMonthDate.weekday - 1 : 0;

        const mergedIntervals =
            !onRangeDateClick && selectedInterval && hovered && selectedInterval.union(hovered);

        return _range(this.titleCells)
            .map((titleCell) => this.renderTitleCell({titleCell, month, year}))
            .concat(
                _range(emptyCells).map((emptyCell) =>
                    this.renderEmptyCell({emptyCell, month, year}),
                ),
            )
            .concat(
                _range(1, this.firstMonthDate.daysInMonth + 1).map((day) =>
                    this.renderDayCell({day, month, year, mergedIntervals}),
                ),
            );
    };

    render() {
        const {isNeedScroll} = this.props;

        return (
            <div
                {...(isNeedScroll && {ref: this.scrollRef})}
                style={{
                    gridTemplateAreas: `"${_repeat('title ', this.titleCells)}"`,
                }}
                className={b()}
                // eslint-disable-next-line react/no-unknown-property
                year={this.firstMonthDate.year}
                // eslint-disable-next-line react/no-unknown-property
                month={this.firstMonthDate.month}
            >
                {this.renderMonth()}
            </div>
        );
    }
}
