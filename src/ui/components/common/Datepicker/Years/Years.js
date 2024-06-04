import React from 'react';

import block from 'bem-cn-lite';
import {DateTime, Interval} from 'luxon';
import PropTypes from 'prop-types';

import './Years.scss';

const b = block('dl-datepicker-years');
const COLUMNS = {
    LEFT: 1,
    RIGHT: 4,
};

export class Years extends React.PureComponent {
    static propTypes = {
        years: PropTypes.array.isRequired,
        from: PropTypes.object,
        to: PropTypes.object,
        min: PropTypes.object,
        max: PropTypes.object,
        middle: PropTypes.object,
        selectedInterval: PropTypes.object,
        hovered: PropTypes.object,
        zone: PropTypes.string,
        onRangeDateClick: PropTypes.func,
    };

    scrollRef = React.createRef();

    todayDateTime = DateTime.fromObject({zone: this.props.zone});

    getOnRangeDateClick = ({start, end}) => {
        return () => this.props.onRangeDateClick({start, end});
    };

    renderYears() {
        const {from, to, min, max, middle, zone, years, selectedInterval, hovered} = this.props;

        let currentColumn = 0;

        return years.map((year) => {
            currentColumn += 1;

            if (currentColumn > COLUMNS.RIGHT) {
                currentColumn = COLUMNS.LEFT;
            }

            const startYear = DateTime.fromObject({
                year,
                month: 1,
                day: 1,
                zone: zone,
            });
            const endYear = startYear.endOf('year');

            const disabled = (min && endYear < min) || (max && startYear > max);
            const yearInterval = Interval.fromDateTimes(startYear, endYear);
            const isContainsFrom = from && yearInterval.contains(from);
            const isContainsTo = to && yearInterval.end >= to;
            const isSelected = Boolean(
                selectedInterval && selectedInterval.intersection(yearInterval),
            );
            const isHovered = Boolean(hovered && hovered.intersection(yearInterval));
            const isContainsHoverStart = isHovered && yearInterval.contains(hovered.start);
            const isContainsHoverEnd = isHovered && yearInterval.end >= hovered.end;
            const isNeedScroll = middle.year === year;

            const mods = {
                disabled,
                selected: isSelected || isHovered,
                today: yearInterval.contains(this.todayDateTime),
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
                    {...(isNeedScroll && {ref: this.scrollRef})}
                    key={year}
                    className={b('year', mods)}
                    // eslint-disable-next-line react/no-unknown-property
                    range={`${startYear.toISODate()}/${endYear.toISODate()}`}
                    onClick={this.getOnRangeDateClick({
                        start: startYear,
                        end: endYear,
                    })}
                >
                    {year}
                </div>
            );
        });
    }

    render() {
        return <div className={b()}>{this.renderYears()}</div>;
    }
}
