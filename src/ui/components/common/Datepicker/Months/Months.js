import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import _range from 'lodash/range';
import {DateTime, Interval} from 'luxon';
import PropTypes from 'prop-types';

import {MONTHS} from '../constants';

import './Months.scss';

const i18n = I18n.keyset('components.common.Datepicker');
const b = block('dl-datepicker-months');
const CELLS_COUNT = 17;
const EMPTY_CELLS = [5, 9, 13];
const CELLS = {
    MONTH: 'month',
    TITLE: 'title',
};
const COLUMNS = {
    LEFT: 1,
    RIGHT: 3,
};

export class Months extends React.PureComponent {
    static propTypes = {
        year: PropTypes.number.isRequired,
        from: PropTypes.object,
        to: PropTypes.object,
        min: PropTypes.object,
        max: PropTypes.object,
        selectedInterval: PropTypes.object,
        hovered: PropTypes.object,
        zone: PropTypes.string,
        isNeedScroll: PropTypes.bool,
        onRangeDateClick: PropTypes.func,
    };

    scrollRef = React.createRef();

    dateTime = DateTime.fromObject({
        year: this.props.year,
        month: 1,
        day: 1,
        zone: this.props.zone,
    });

    todayDateTime = DateTime.fromObject({zone: this.props.zone});

    getOnRangeDateClick = ({start, end, isAllRangePicked}) => {
        return () => this.props.onRangeDateClick({start, end, isAllRangePicked});
    };

    renderMonthes() {
        const {from, to, min, max, selectedInterval, hovered} = this.props;
        let currentMonth = 0;
        let currentColumn = 0;

        return (
            _range(1, CELLS_COUNT)
                // eslint-disable-next-line complexity
                .map((cell) => {
                    const isTitle = cell === 1;
                    const isEmpty = EMPTY_CELLS.includes(cell);

                    if (isTitle || isEmpty) {
                        const startYear = this.dateTime;
                        let endYear = this.dateTime.set({month: MONTHS.DECEMBER});
                        endYear = endYear.set({day: endYear.daysInMonth});
                        const disabled = (min && endYear < min) || (max && startYear > max);

                        return (
                            <div
                                key={`title-${cell}-${this.dateTime.year}`}
                                {...(isTitle && {className: b(CELLS.TITLE, {disabled})})}
                                {...(isTitle && {
                                    onClick: this.getOnRangeDateClick({
                                        start: this.dateTime,
                                        end: this.dateTime.set({month: 12, day: 31}),
                                        isAllRangePicked: true,
                                    }),
                                })}
                            >
                                {isTitle && this.dateTime.year}
                            </div>
                        );
                    }

                    currentMonth += 1;
                    currentColumn += 1;

                    if (currentColumn > COLUMNS.RIGHT) {
                        currentColumn = COLUMNS.LEFT;
                    }

                    const startMonth = this.dateTime.set({
                        day: 1,
                        month: currentMonth,
                    });
                    const endMonth = this.dateTime
                        .set({
                            day: startMonth.daysInMonth,
                            month: currentMonth,
                        })
                        .endOf('month');

                    const disabled = (min && endMonth < min) || (max && startMonth > max);
                    const monthInterval = Interval.fromDateTimes(startMonth, endMonth);
                    const isContainsFrom = from && monthInterval.contains(from);
                    const isContainsTo = to && monthInterval.end >= to;
                    const isSelected = Boolean(
                        selectedInterval && selectedInterval.intersection(monthInterval),
                    );
                    const isHovered = Boolean(hovered && hovered.intersection(monthInterval));
                    const isContainsHoverStart = isHovered && monthInterval.contains(hovered.start);
                    const isContainsHoverEnd = isHovered && monthInterval.end >= hovered.end;

                    const mods = {
                        disabled,
                        today: monthInterval.contains(this.todayDateTime),
                        selected: isSelected || isHovered,
                    };

                    if (isHovered) {
                        mods['left-edge'] = currentColumn === COLUMNS.LEFT || isContainsHoverStart;
                        mods['right-edge'] = currentColumn === COLUMNS.RIGHT || isContainsHoverEnd;
                    } else {
                        mods['left-edge'] = currentColumn === COLUMNS.LEFT || isContainsFrom;
                        mods['right-edge'] = currentColumn === COLUMNS.RIGHT || isContainsTo;
                    }

                    return (
                        <div
                            key={`${cell}-${this.dateTime.year}`}
                            className={b(CELLS.MONTH, mods)}
                            // eslint-disable-next-line react/no-unknown-property
                            range={`${startMonth.toISODate()}/${endMonth.toISODate()}`}
                            {...(!disabled && {
                                onClick: this.getOnRangeDateClick({
                                    start: startMonth,
                                    end: endMonth,
                                }),
                            })}
                        >
                            {i18n(`month_short_${currentMonth}`)}
                        </div>
                    );
                })
        );
    }

    render() {
        const {isNeedScroll} = this.props;

        return (
            <div {...(isNeedScroll && {ref: this.scrollRef})} className={b()}>
                {this.renderMonthes()}
            </div>
        );
    }
}
