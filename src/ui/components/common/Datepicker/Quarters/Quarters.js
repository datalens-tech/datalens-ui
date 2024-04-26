import React from 'react';

import block from 'bem-cn-lite';
import _range from 'lodash/range';
import {DateTime, Interval} from 'luxon';
import PropTypes from 'prop-types';

import {MONTHS} from '../constants';

import './Quarters.scss';

const b = block('dl-datepicker-quarters');
const CELLS_COUNT = 5;
const CELLS = {
    QUARTER: 'quarter',
    TITLE: 'title',
};
const COLUMNS = {
    LEFT: 1,
    RIGHT: 4,
};

export class Quarters extends React.PureComponent {
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

    getOnRangeDateClick = ({start, end}) => {
        return () => this.props.onRangeDateClick({start, end});
    };

    renderQuarter() {
        const {from, to, min, max, selectedInterval, hovered} = this.props;

        return (
            _range(0, CELLS_COUNT)
                // eslint-disable-next-line complexity
                .map((cell) => {
                    if (cell === 0) {
                        const startYear = this.dateTime;
                        let endYear = this.dateTime.set({month: MONTHS.DECEMBER});
                        endYear = endYear.set({day: endYear.daysInMonth});
                        const disabled = (min && endYear < min) || (max && startYear > max);

                        return (
                            <div
                                key={`title-${cell}-${this.dateTime.year}`}
                                className={b(CELLS.TITLE, {disabled})}
                            >
                                {this.dateTime.year}
                            </div>
                        );
                    }

                    const quarter = cell;
                    const startQuarter = this.dateTime.set({
                        day: 1,
                        month: quarter * 3 - 2,
                    });
                    const endQuarter = this.dateTime
                        .set({
                            day: 1,
                            month: quarter * 3,
                        })
                        .endOf('month');

                    const disabled = (min && endQuarter < min) || (max && startQuarter > max);
                    const quarterInterval = Interval.fromDateTimes(startQuarter, endQuarter);
                    const isContainsFrom = from && quarterInterval.contains(from);
                    const isContainsTo = to && quarterInterval.end >= to;
                    const isSelected = Boolean(
                        selectedInterval && selectedInterval.intersection(quarterInterval),
                    );
                    const isHovered = Boolean(hovered && hovered.intersection(quarterInterval));
                    const isContainsHoverStart =
                        isHovered && quarterInterval.contains(hovered.start);
                    const isContainsHoverEnd = isHovered && quarterInterval.end >= hovered.end;

                    const mods = {
                        disabled,
                        selected: isSelected || isHovered,
                        today: quarterInterval.contains(this.todayDateTime),
                    };

                    if (isHovered) {
                        mods['left-edge'] = cell === COLUMNS.LEFT || isContainsHoverStart;
                        mods['right-edge'] = cell === COLUMNS.RIGHT || isContainsHoverEnd;
                    } else {
                        mods['left-edge'] = cell === COLUMNS.LEFT || isContainsFrom;
                        mods['right-edge'] = cell === COLUMNS.RIGHT || isContainsTo;
                    }

                    return (
                        <div
                            key={`${cell}-${this.dateTime.year}`}
                            className={b(CELLS.QUARTER, mods)}
                            // eslint-disable-next-line react/no-unknown-property
                            range={`${startQuarter.toISODate()}/${endQuarter.toISODate()}`}
                            {...(!disabled && {
                                onClick: this.getOnRangeDateClick({
                                    start: startQuarter,
                                    end: endQuarter,
                                }),
                            })}
                        >
                            {`Q${quarter}`}
                        </div>
                    );
                })
        );
    }

    render() {
        const {isNeedScroll} = this.props;

        return (
            <div {...(isNeedScroll && {ref: this.scrollRef})} className={b()}>
                {this.renderQuarter()}
            </div>
        );
    }
}
