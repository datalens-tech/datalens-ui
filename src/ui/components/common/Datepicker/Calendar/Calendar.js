import React from 'react';

import block from 'bem-cn-lite';
import _range from 'lodash/range';
import _throttle from 'lodash/throttle';
import {DateTime, Interval} from 'luxon';
import PropTypes from 'prop-types';

import {Month} from '../Month/Month';
import {Months} from '../Months/Months';
import {Quarters} from '../Quarters/Quarters';
import {YearSwitcher} from '../YearSwitcher/YearSwitcher';
import {Years} from '../Years/Years';
import {TABS} from '../constants';
import {checkBrowser} from '../utils';

import './Calendar.scss';

const b = block('yc-datepicker-calendar');
const MONTH_NARGIN_BOTTOM = 5;
const MIN_YEAR = 1000;
const MAX_YEAR = 3000;
const THRESHOLD = {
    [TABS.DAY]: 150,
    [TABS.WEEK]: 150,
    [TABS.MONTH]: 150,
    [TABS.QUARTER]: 100,
    [TABS.YEAR]: 50,
};
const SHIFT = {
    [TABS.DAY]: 4,
    [TABS.WEEK]: 4,
    [TABS.MONTH]: 48,
    [TABS.QUARTER]: 344,
    [TABS.YEAR]: 1008,
};

const getWarningMessage = ({from, min, max}) => {
    const date = min ? min : max;
    const dateType = min ? 'min' : 'max';
    const adverb = min ? 'less' : 'more';

    return `'from' date (${from.toString()}) is ${adverb} than '${dateType}' date (${date.toString()})`;
};

const getMiddleDate = ({zone, from, min, max}) => {
    let middle = from ? from : DateTime.fromObject({zone});
    let warningMessage;

    if (from) {
        if (max && from > max) {
            middle = max;
            warningMessage = getWarningMessage({from, max});
        } else if (min && from < min) {
            middle = min;
            warningMessage = getWarningMessage({from, min});
        }
    } else if (max) {
        middle = max;
    } else if (min) {
        middle = min;
    }

    if (warningMessage) {
        console.warn(warningMessage);
    }

    return middle;
};

const getInterval = ({zone, activeTab, from, min, max, init}) => {
    const middle = getMiddleDate({zone, from, min, max, init});
    const start = middle.plus({month: -SHIFT[activeTab]});
    const end = middle.plus({month: SHIFT[activeTab]});

    return {
        middle,
        interval: Interval.fromDateTimes(start, end),
    };
};

const getOffsetTop = (calendarNode) => {
    let offset = 0;

    if (!calendarNode) {
        return offset;
    }

    let sib = calendarNode.previousSibling;

    while (sib) {
        offset += sib.clientHeight;
        sib = sib.previousSibling;
    }

    return offset;
};

const getSwitcherDate = ({zone, nodes, currentScrollTop}) => {
    let switcherDate = null;

    nodes.forEach((node) => {
        const year = node.getAttribute('year');
        const month = node.getAttribute('month');

        if (!year || !month) {
            return;
        }

        if (
            currentScrollTop >= node.offsetTop - node.clientHeight &&
            currentScrollTop < node.offsetTop
        ) {
            switcherDate = DateTime.fromObject({
                zone,
                year: Number(year),
                month: Number(month),
            });
        }
    });

    return switcherDate;
};

export class Calendar extends React.Component {
    static propTypes = {
        zone: PropTypes.string,
        activeTab: PropTypes.string,
        from: PropTypes.object,
        to: PropTypes.object,
        min: PropTypes.object,
        max: PropTypes.object,
        pick: PropTypes.number,
        range: PropTypes.bool,
        scrollCalendar: PropTypes.bool,
        onDateClick: PropTypes.func,
        onRangeDateClick: PropTypes.func,
    };

    static getDerivedStateFromProps(props, state) {
        const changedState = {
            prevProps: props,
        };

        if (
            props.activeTab !== state.prevProps.activeTab ||
            (props.from !== state.prevProps.from &&
                props.scrollCalendar &&
                !state.interval.contains(props.from)) ||
            props.max !== state.prevProps.max ||
            props.min !== state.prevProps.min
        ) {
            const {interval, middle} = getInterval({
                zone: props.zone,
                activeTab: props.activeTab,
                from: props.from,
                min: props.min,
                max: props.max,
            });

            changedState.interval = interval;
            changedState.middle = middle;
            changedState.switcherDate = null;
        }

        if (props.from !== state.prevProps.from) {
            changedState.switcherDate = null;
        }

        return changedState;
    }

    constructor(props) {
        super(props);

        const {zone, activeTab, from, min, max} = this.props;

        this.containerRef = React.createRef();
        this.contentRef = React.createRef();
        const {interval, middle} = getInterval({zone, activeTab, from, min, max});

        this.state = {
            interval,
            middle,
            prevProps: this.props,
            hovered: undefined,
            switcherDate: middle,
            switcherOffset: 0,
        };
    }

    componentDidMount() {
        const browser = checkBrowser();
        this.isNeedScrollOffsetHandling = browser === 'Safari' || browser === 'Firefox';
        this.containerRef.current.addEventListener('scroll', _throttle(this.onScroll, 5));
        this.scrollTo();
        this.setState({
            switcherOffset: getOffsetTop(this.containerRef.current),
        });
    }

    componentDidUpdate(prevProps) {
        if (
            this.state.switcherClicked ||
            prevProps.activeTab !== this.props.activeTab ||
            (prevProps.from !== this.props.from && this.props.scrollCalendar) ||
            prevProps.max !== this.props.max ||
            prevProps.min !== this.props.min
        ) {
            this.scrollTo();
        }

        const switcherOffset = getOffsetTop(this.containerRef.current);

        if (
            (switcherOffset || switcherOffset === 0) &&
            switcherOffset !== this.state.switcherOffset
        ) {
            this.setState({switcherOffset});
        }
    }

    componentWillUnmount() {
        this.containerRef.current.removeEventListener('scroll', this.onScroll);
    }

    onScroll = (e) => {
        const container = this.containerRef.current;

        if (!container) {
            return;
        }

        const {clientHeight, scrollHeight, scrollTop} = e.target;
        const {zone, activeTab} = this.props;
        const {interval} = this.state;

        const changedState = {};
        const threshold = THRESHOLD[activeTab];

        let switcherDate = null;
        let diff;
        let scrollToTop;

        if (activeTab === TABS.DAY || activeTab === TABS.WEEK) {
            switcherDate = getSwitcherDate({
                zone,
                nodes: Array.from(e.target.children),
                currentScrollTop: scrollTop,
            });
        }

        if (scrollTop < threshold && interval.start.year >= MIN_YEAR) {
            scrollToTop = true;
            container.scrollTop = threshold;

            const start = interval.start.plus({month: -SHIFT[activeTab]});
            const end = interval.end.plus({month: -SHIFT[activeTab]});

            changedState.interval = Interval.fromDateTimes(start, end);
            changedState.switcherDate = null;
            diff = changedState.interval.difference(this.state.interval);
        }

        if (scrollTop + clientHeight > scrollHeight - threshold && interval.end.year <= MAX_YEAR) {
            container.scrollTop = scrollHeight - threshold - clientHeight;

            const start = interval.start.plus({month: SHIFT[activeTab]});
            const end = interval.end.plus({month: SHIFT[activeTab]});

            changedState.interval = Interval.fromDateTimes(start, end);
            changedState.switcherDate = null;
            diff = changedState.interval.difference(this.state.interval);
        }

        if (
            !this.state.switcherDate ||
            (switcherDate &&
                this.state.switcherDate &&
                switcherDate.year !== this.state.switcherDate.year)
        ) {
            changedState.switcherDate = switcherDate;
        }

        if (Object.keys(changedState).length) {
            this.setState(changedState, () => {
                if (changedState.interval && this.isNeedScrollOffsetHandling) {
                    switch (activeTab) {
                        case TABS.DAY:
                        case TABS.WEEK: {
                            const nodes = [];
                            let browserOffset = 0;

                            Array.from(container.children).forEach((node) => {
                                const year = node.getAttribute('year');
                                const month = node.getAttribute('month');
                                const dateTime = DateTime.fromObject({
                                    zone,
                                    year: Number(year),
                                    month: Number(month),
                                });

                                if (
                                    diff[0].start.startOf('month') <= dateTime &&
                                    diff[0].end >= dateTime
                                ) {
                                    nodes.push(node);
                                    browserOffset += node.offsetHeight + MONTH_NARGIN_BOTTOM;
                                }
                            });

                            if (scrollToTop) {
                                this.containerRef.current.scrollTop = browserOffset;
                            } else {
                                this.containerRef.current.scrollTop =
                                    this.containerRef.current.scrollHeight -
                                    clientHeight -
                                    browserOffset;
                            }

                            break;
                        }
                        case TABS.MONTH: {
                            if (scrollToTop) {
                                this.containerRef.current.scrollTop = 317 * 3 - 34;
                            } else {
                                this.containerRef.current.scrollTop = scrollHeight - 317 * 3 - 198;
                            }

                            break;
                        }
                        case TABS.QUARTER: {
                            if (scrollToTop) {
                                this.containerRef.current.scrollTop =
                                    this.containerRef.current.scrollHeight / 2 + 74;
                            } else {
                                this.containerRef.current.scrollTop =
                                    this.containerRef.current.scrollHeight / 2 - 312;
                            }

                            break;
                        }
                        case TABS.YEAR: {
                            if (scrollToTop) {
                                this.containerRef.current.scrollTop =
                                    this.containerRef.current.scrollHeight / 2 + 50;
                            } else {
                                this.containerRef.current.scrollTop =
                                    this.containerRef.current.scrollHeight / 2 - 284;
                            }
                        }
                    }
                }
            });
        }
    };

    scrollTo = () => {
        const container = this.containerRef.current;
        const content = this.contentRef.current;

        if (!content) {
            return;
        }

        const nodeToScroll = content.scrollRef.current;

        if (!nodeToScroll) {
            return;
        }

        const offset = getOffsetTop(container);

        container.scrollTop = nodeToScroll.offsetTop - offset;
    };

    onSwitcherClick = (middleShift) => {
        const {zone, activeTab, from} = this.props;

        let switcherDate = null;

        if (this.state.switcherDate) {
            switcherDate = this.state.switcherDate;
        } else {
            switcherDate = from ? from : DateTime.fromObject({zone});
        }

        const middle = switcherDate.plus({month: middleShift});
        const start = middle.plus({month: -SHIFT[activeTab]});
        const end = middle.plus({month: SHIFT[activeTab]});

        this.setState(
            {
                interval: Interval.fromDateTimes(start, end),
                switcherDate: middle,
                switcherClicked: true,
            },
            () => this.setState({switcherClicked: false}),
        );
    };

    getMouseOverHandler() {
        const {zone, activeTab, range} = this.props;

        switch (activeTab) {
            case TABS.DAY: {
                return range ? this.onDayMouseOver : null;
            }
            case TABS.WEEK: {
                return this.onWeekMouseOver;
            }
            default: {
                return (e) => {
                    const {from, to, pick} = this.props;
                    const range = e.target.getAttribute('range');

                    if (!range || !from || !to || !pick) {
                        if (this.state.hovered && !pick) {
                            this.setState({hovered: undefined});
                        }

                        return;
                    }

                    const hovered = Interval.fromDateTimes(from, to).union(
                        Interval.fromISO(range, {zone}),
                    );

                    if (!this.state.hovered || !hovered.equals(this.state.hovered)) {
                        this.setState({hovered});
                    }
                };
            }
        }
    }

    onDayMouseOver = (e) => {
        const {from, to, zone} = this.props;
        const date = e.target.getAttribute('date');

        if (!date || !from || to) {
            if (this.state.hovered && to) {
                this.setState({hovered: undefined});
            }

            return;
        }

        const dateTime = DateTime.fromISO(date, {zone});
        let hovered;

        if (from < dateTime) {
            hovered = Interval.fromDateTimes(from, dateTime.endOf('day'));
        } else {
            hovered = Interval.fromDateTimes(dateTime, from.endOf('day'));
        }

        if (!this.state.hovered || !hovered.equals(this.state.hovered)) {
            this.setState({hovered});
        }
    };

    onWeekMouseOver = (e) => {
        const {zone} = this.props;
        const date = e.target.getAttribute('date');

        if (!date) {
            return;
        }

        const dateTime = DateTime.fromISO(date, {zone});
        const monday = dateTime.startOf('week');
        const sunday = dateTime.endOf('week');
        const hovered = Interval.fromDateTimes(monday, sunday);

        if (!this.state.hovered || !hovered.equals(this.state.hovered)) {
            this.setState({hovered});
        }
    };

    onMouseLeave = () => {
        if (this.state.hovered) {
            this.setState({hovered: undefined});
        }
    };

    renderDayContent() {
        const {zone, activeTab, to, min, max} = this.props;
        const {switcherDate, hovered} = this.state;

        const months = [];
        const from = this.props.from ? this.props.from : DateTime.fromObject({zone});
        const isDefaultFrom = !this.props.from;
        let interval = this.state.interval;
        let start = interval.start;
        const selectedInterval = to
            ? Interval.fromDateTimes(from.startOf('day'), to.endOf('day'))
            : Interval.fromDateTimes(from.startOf('day'), from.endOf('day'));

        while (start) {
            let isNeedScroll;

            if (switcherDate) {
                isNeedScroll =
                    switcherDate.month === start.month && switcherDate.year === start.year;
            } else if (isDefaultFrom && max) {
                isNeedScroll = max.month === start.month && max.year === start.year;
            } else {
                isNeedScroll = from.month === start.month && from.year === start.year;
            }

            months.push(
                <Month
                    {...(isNeedScroll && {ref: this.contentRef})}
                    key={`month-${start.month}-${start.year}`}
                    year={start.year}
                    month={start.month}
                    from={from}
                    to={to}
                    min={min && min.startOf('day')}
                    max={max}
                    zone={zone}
                    selectedInterval={selectedInterval}
                    hovered={hovered}
                    isDefaultFrom={isDefaultFrom}
                    isNeedScroll={isNeedScroll}
                    onDateClick={this.props.onDateClick}
                    onRangeDateClick={
                        activeTab === TABS.WEEK ? this.props.onRangeDateClick : undefined
                    }
                />,
            );

            interval = interval.set({start: start.plus({month: 1})});
            start = interval.start;
        }

        return months;
    }

    renderMonthContent() {
        const {to, min, max, zone} = this.props;
        const {hovered, middle} = this.state;

        const years = [];
        const from = this.props.from ? this.props.from : DateTime.fromObject({zone});
        let interval = this.state.interval;
        let start = interval.start;
        const selectedInterval = from && to && Interval.fromDateTimes(from, to);

        while (start) {
            const isNeedScroll = middle.year === start.year;

            years.push(
                <Months
                    {...(isNeedScroll && {ref: this.contentRef})}
                    key={`year-${start.year}`}
                    year={start.year}
                    from={from}
                    to={to}
                    min={min}
                    max={max}
                    zone={zone}
                    selectedInterval={selectedInterval}
                    hovered={hovered}
                    isNeedScroll={isNeedScroll}
                    onRangeDateClick={this.props.onRangeDateClick}
                />,
            );

            interval = interval.set({start: start.plus({month: 12})});
            start = interval.start;
        }

        return years;
    }

    renderQuartersContent() {
        const {to, min, max, zone} = this.props;
        const {hovered, middle} = this.state;

        const years = [];
        const from = this.props.from ? this.props.from : DateTime.fromObject({zone});
        let interval = this.state.interval;
        let start = interval.start;
        const selectedInterval = from && to && Interval.fromDateTimes(from, to);

        while (start) {
            const isNeedScroll = middle.year === start.year;

            years.push(
                <Quarters
                    {...(isNeedScroll && {ref: this.contentRef})}
                    key={`quarter-year-${start.year}`}
                    year={start.year}
                    from={from}
                    to={to}
                    min={min}
                    max={max}
                    zone={zone}
                    selectedInterval={selectedInterval}
                    hovered={hovered}
                    isNeedScroll={isNeedScroll}
                    onRangeDateClick={this.props.onRangeDateClick}
                />,
            );

            interval = interval.set({start: start.plus({month: 12})});
            start = interval.start;
        }

        return years;
    }

    renderYearsContent() {
        const {to, min, max, zone} = this.props;
        const {hovered, middle} = this.state;

        const from = this.props.from ? this.props.from : DateTime.fromObject({zone});
        const isDefaultFrom = !this.props.from;
        const selectedInterval = from && to && Interval.fromDateTimes(from, to);
        const yearsCount = this.state.interval.length('years');
        const startYear = this.state.interval.start.year;

        return (
            <Years
                ref={this.contentRef}
                years={_range(startYear, startYear + yearsCount)}
                from={from}
                to={to}
                min={min}
                max={max}
                middle={middle}
                zone={zone}
                isDefaultFrom={isDefaultFrom}
                selectedInterval={selectedInterval}
                hovered={hovered}
                onRangeDateClick={this.props.onRangeDateClick}
            />
        );
    }

    // eslint-disable-next-line consistent-return
    renderContent() {
        const {activeTab} = this.props;

        switch (activeTab) {
            case TABS.DAY:
            case TABS.WEEK: {
                return this.renderDayContent();
            }
            case TABS.MONTH: {
                return this.renderMonthContent();
            }
            case TABS.QUARTER: {
                return this.renderQuartersContent();
            }
            case TABS.YEAR: {
                return this.renderYearsContent();
            }
        }
    }

    render() {
        const {activeTab} = this.props;
        const {switcherDate, switcherOffset} = this.state;

        return (
            <div
                ref={this.containerRef}
                className={b()}
                onMouseOver={this.getMouseOverHandler()}
                onMouseLeave={this.onMouseLeave}
            >
                <YearSwitcher
                    switcherDate={switcherDate}
                    offsetTop={switcherOffset}
                    onShiftMonths={this.onSwitcherClick}
                    visible={activeTab === TABS.DAY || activeTab === TABS.WEEK}
                />
                {this.renderContent()}
            </div>
        );
    }
}
