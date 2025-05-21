import React from 'react';

import {MobileContext, Popup, Sheet, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DateTime} from 'luxon';
import PropTypes from 'prop-types';

import {FieldWrapper} from '../../FieldWrapper/FieldWrapper';

import {PopupContent} from './PopupContent/PopupContent';
import {AVAILABLE_POPUP_PLACEMENT, DISPLAY_FORMAT, OUTPUT_FORMAT, TABS} from './constants';
import {
    createDateTime,
    fillEmptyToDate,
    getHashedData,
    getListWithoutNullableValues,
    getPlaceholder,
    getSearchText,
    getZone,
    hasTimeUnitsInFormat,
    isValidDate,
    resolveDates,
} from './utils';

import './Datepicker.scss';

const i18n = I18n.keyset('components.common.Datepicker');
const b = block('dl-datepicker');
const dateType = PropTypes.oneOfType([PropTypes.string, PropTypes.number]);
const getModifier = (name) => b({[name]: true}).split(' ')[1];

export const datepickerDefaultProps = {
    format: DISPLAY_FORMAT.DATE,
    outputFormat: OUTPUT_FORMAT.DATETIME,
    range: true,
    allowNullableValues: false,
    showApply: false,
    hasClear: true,
    disabled: false,
    controlSize: 'm',
    fillPartialInterval: false,
};

export class Datepicker extends React.PureComponent {
    static propTypes = {
        onUpdate: PropTypes.func.isRequired,
        onError: PropTypes.func,
        from: dateType,
        to: dateType,
        min: dateType,
        max: dateType,
        format: PropTypes.string,
        emptyValueText: PropTypes.string,
        placeholder: PropTypes.string,
        timezoneOffset: PropTypes.number,
        outputFormat: PropTypes.oneOf([OUTPUT_FORMAT.DATE, OUTPUT_FORMAT.DATETIME]),
        scale: PropTypes.oneOf([TABS.DAY, TABS.WEEK, TABS.MONTH, TABS.QUARTER, TABS.YEAR]),
        controlWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        range: PropTypes.bool,
        allowNullableValues: PropTypes.bool,
        showApply: PropTypes.bool,
        hasClear: PropTypes.bool,
        disabled: PropTypes.bool,
        controlSize: PropTypes.oneOf(['s', 'm', 'l', 'xl']),
        className: PropTypes.string,
        popupClassName: PropTypes.string,
        required: PropTypes.bool,
        hasValidationError: PropTypes.bool,
        fillPartialInterval: PropTypes.bool,
        label: PropTypes.string,
    };

    static defaultProps = datepickerDefaultProps;

    static getDerivedStateFromProps(props, state) {
        const changedState = {};
        const zone = getZone(props.timezoneOffset);

        if (
            props.from !== state.prevProps.from ||
            props.to !== state.prevProps.to ||
            props.timezoneOffset !== state.prevProps.timezoneOffset
        ) {
            changedState.from = createDateTime({date: props.from, zone});
            changedState.to = createDateTime({date: props.to, zone});

            [changedState.from, changedState.to] = resolveDates({
                from: changedState.from,
                to: changedState.to,
            });

            changedState.searchText = getSearchText({
                from: changedState.from,
                to: changedState.to,
                format: props.format,
                emptyValueText: props.emptyValueText,
                range: props.range,
                required: props.required,
            });
            changedState.zone = zone;

            changedState.lastValidHash = getHashedData({
                from: changedState.from,
                to: changedState.to,
            });
        }

        if (props.min !== state.prevProps.min) {
            const min = createDateTime({date: props.min, zone});
            changedState.min = isValidDate(min) ? min : undefined;
        }

        if (props.max !== state.prevProps.max) {
            const max = createDateTime({date: props.max, zone});
            changedState.max = isValidDate(max) ? max : undefined;
        }

        if (props.disabled && !state.prevProps.disabled) {
            changedState.error = '';
        }

        changedState.prevProps = props;

        return changedState;
    }

    constructor(props) {
        super(props);

        const {format, timezoneOffset, emptyValueText, range, required} = this.props;

        const zone = getZone(timezoneOffset);
        let from = createDateTime({date: this.props.from, zone});
        let to = createDateTime({date: this.props.to, zone});
        const min = createDateTime({date: this.props.min, zone});
        const max = createDateTime({date: this.props.max, zone});
        [from, to] = resolveDates({from, to});
        const searchText = getSearchText({
            from,
            to,
            format,
            emptyValueText,
            range,
            required,
        });

        this.ControlNodeRef = React.createRef();
        this.state = {
            searchText,
            from,
            to,
            zone,
            min: isValidDate(min) ? min : undefined,
            max: isValidDate(max) ? max : undefined,
            lastValidHash: getHashedData({from, to}),
            prevProps: this.props,
            activeTab: 'day',
            pick: 0,
            error: '',
            active: false,
        };
    }

    static SCALE = TABS;

    static DISPLAY_FORMAT = DISPLAY_FORMAT;

    static OUTPUT_FORMAT = OUTPUT_FORMAT;

    get placeholder() {
        const {format, range, placeholder} = this.props;

        if (placeholder) {
            return placeholder;
        }

        const placeholderPart = getPlaceholder(format);

        return `${placeholderPart}${range ? ` - ${placeholderPart}` : ''}`;
    }

    isInvalidState() {
        const {range, allowNullableValues} = this.props;
        const {invalidInput, from, to} = this.state;

        if (allowNullableValues) {
            return invalidInput;
        }

        if (range) {
            return !from || !to || invalidInput;
        }

        return !from || invalidInput;
    }

    getErrorText() {
        const {range, onError} = this.props;

        if (!this.isInvalidState() || onError) {
            return '';
        }

        return range ? i18n('error_dates_range') : i18n('error_date');
    }

    onSelectTab = (activeTab) => {
        this.setState({
            activeTab,
            pick: 0,
        });
    };

    onDateClick = ({dateTime}) => {
        const state = {
            pick: 0,
            error: '',
            invalidInput: false,
            scrollCalendar: false,
        };

        if ((this.state.from && this.state.to) || (this.state.from && !this.props.range)) {
            state.from = dateTime;
            state.to = undefined;
        } else if (!this.state.from && !this.state.to) {
            state.from = dateTime;
        } else {
            const isStartBeforeDateTime = this.state.from < dateTime;

            if (isStartBeforeDateTime) {
                state.from = this.state.from;
                state.to = dateTime;
            } else {
                state.from = dateTime;
                state.to = this.state.from;
            }
        }

        if (state.to) {
            state.to = state.to.endOf('day');
        }

        state.searchText = getSearchText({
            from: state.from,
            to: state.to,
            format: this.props.format,
            emptyValueText: this.props.emptyValueText,
            range: this.props.range,
            required: this.props.required,
        });

        this.setState(state, () => {
            const {range, showApply} = this.props;
            const {from, to} = this.state;

            if ((!showApply && range && from && to) || (!showApply && !range && from)) {
                this.onUpdate();
            }
        });
    };

    onRangeDateClick = ({start, end, isAllRangePicked, scrollCalendar}) => {
        const {range} = this.props;

        let pick = this.state.pick + 1;
        let from, to;

        switch (true) {
            case pick === 1 || isAllRangePicked || !range: {
                from = start;
                to = end;

                if (isAllRangePicked || !range) {
                    pick = 0;
                }

                break;
            }
            case pick === 2: {
                const dates = getListWithoutNullableValues(
                    start,
                    end,
                    this.state.from,
                    this.state.to,
                );
                from = DateTime.min(...dates);
                to = DateTime.max(...dates);
                pick = 0;
                break;
            }
        }

        if (to) {
            to = to.endOf('day');
        }

        const searchText = getSearchText({
            from,
            to,
            format: this.props.format,
            emptyValueText: this.props.emptyValueText,
            range: this.props.range,
            required: this.props.required,
        });

        this.setState(
            {
                searchText,
                pick,
                from,
                to,
                scrollCalendar,
                error: '',
                invalidInput: false,
            },
            () => {
                const {showApply} = this.props;
                const {from, to, pick} = this.state;

                if (!showApply && from && to && pick === 0) {
                    this.onUpdate();
                }
            },
        );
    };

    onInputUpdate = (searchText) => {
        const {format, range} = this.props;
        const {zone} = this.state;
        const dates = searchText.split(/\s-\s?/);

        let from;
        let to;
        let isFromValid = true;
        let isToValid = true;

        if (dates[0]) {
            from = DateTime.fromFormat(dates[0].trim(), format, {zone});
            isFromValid = isValidDate(from);
        }

        if (dates[1] && dates[1] !== this.props.emptyValueText) {
            to = DateTime.fromFormat(dates[1].trim(), format, {zone});
            isToValid = isValidDate(to);
        }

        if (range) {
            [from, to] = resolveDates({from, to});

            if (to && !hasTimeUnitsInFormat(format)) {
                to = to.endOf('day');
            }
        }

        if (!isFromValid || !isToValid) {
            this.setState({
                searchText,
                invalidInput: true,
            });

            return;
        }

        const resetPickCounter = !searchText || (range && !to);

        this.setState(
            {
                searchText,
                from,
                to: range ? to : undefined,
                error: '',
                invalidInput: false,
                ...(resetPickCounter ? {pick: 0} : {}),
            },
            () => {
                if (!from && !to) {
                    // focus to open popup when clear button is clicked
                    this.ControlNodeRef.current.focus();
                }
            },
        );
    };

    onInputKeyPress = (e) => {
        switch (e.key) {
            case 'Enter': {
                this.ControlNodeRef.current.blur();
                this.onUpdate();

                break;
            }
        }
    };

    onInputFocus = () => {
        if (!this.state.active) {
            this.setState({active: true});
        }
    };

    onClose = () => {
        if (document.activeElement === this.ControlNodeRef.current) {
            return;
        }

        const {format, emptyValueText, range, required} = this.props;
        const {from, to, lastValidHash} = this.state;

        const currentHash = getHashedData({from, to});

        if (lastValidHash === currentHash) {
            const searchText = getSearchText({
                from,
                to,
                format,
                emptyValueText,
                range,
                required,
            });

            this.setState({searchText, active: false});
        } else {
            this.onUpdate();
        }
    };

    onUpdate = () => {
        const {allowNullableValues, onError, fillPartialInterval} = this.props;
        const {min, max} = this.state;

        if (this.isInvalidState()) {
            this.setState(
                {
                    error: this.getErrorText(),
                    active: false,
                },
                () => onError && onError(),
            );

            return;
        }

        let from = this.state.from;
        let to = this.state.to;

        if (min && from && from < min) {
            from = min;
        }

        if (min && to && from < min) {
            to = min;
        }

        if (max && from && from > max) {
            from = max;
        }

        if (max && to && to > max) {
            to = max;
        }

        [from, to] = resolveDates({from, to});

        if (fillPartialInterval && from && !to) {
            // 'to' will not be empty for correct work of the selector on the dashboard
            to = fillEmptyToDate(from);
        }

        const searchText = getSearchText({
            from,
            to,
            format: this.props.format,
            emptyValueText: this.props.emptyValueText,
            range: this.props.range,
            required: this.props.required,
        });

        this.ControlNodeRef.current.blur();

        const showSearchText = Boolean(allowNullableValues || (from && to));

        this.setState(
            {
                from,
                to,
                active: false,
                lastValidHash: getHashedData({from, to}),
                ...(showSearchText ? {searchText} : {}),
            },
            () => {
                const {range, outputFormat} = this.props;

                let outputFrom = null;
                let outputTo = null;

                if (from) {
                    outputFrom =
                        outputFormat === OUTPUT_FORMAT.DATE ? from.toISODate() : from.toISO();
                }

                if (range && to) {
                    outputTo = outputFormat === OUTPUT_FORMAT.DATE ? to.toISODate() : to.toISO();
                }

                this.props.onUpdate({
                    from: outputFrom,
                    to: outputTo,
                });
            },
        );
    };

    renderContent(mobile) {
        const {scale, range, showApply} = this.props;
        const {from, to, min, max, zone, activeTab, pick, scrollCalendar} = this.state;

        const mod = mobile ? getModifier('mobile') : getModifier('desktop');

        return (
            <PopupContent
                from={from}
                to={to}
                min={min}
                max={max}
                zone={zone}
                activeTab={scale || activeTab}
                mod={mod}
                pick={pick}
                range={range}
                scrollCalendar={scrollCalendar}
                showTabs={!scale}
                showApply={showApply}
                onDateClick={this.onDateClick}
                onRangeDateClick={this.onRangeDateClick}
                onSelectTab={this.onSelectTab}
                onSubmit={this.onUpdate}
            />
        );
    }

    render() {
        const {
            controlWidth,
            hasClear,
            disabled,
            controlSize,
            className,
            popupClassName,
            hasValidationError,
            label,
        } = this.props;
        const {searchText, active, error, from} = this.state;

        const hasPlaceholderError = hasValidationError && !from;

        return (
            <MobileContext.Consumer>
                {({mobile}) => (
                    <React.Fragment>
                        <div
                            className={b('control', className)}
                            {...(controlWidth
                                ? {
                                      style: {
                                          width: controlWidth,
                                      },
                                  }
                                : {})}
                        >
                            <FieldWrapper error={error}>
                                <TextInput
                                    value={searchText}
                                    size={controlSize}
                                    placeholder={this.placeholder}
                                    hasClear={hasClear && !mobile}
                                    disabled={disabled}
                                    onUpdate={this.onInputUpdate}
                                    onFocus={this.onInputFocus}
                                    onKeyDown={this.onInputKeyPress}
                                    controlRef={this.ControlNodeRef}
                                    error={hasValidationError}
                                    controlProps={{
                                        className: b('input', {error: hasPlaceholderError}),
                                    }}
                                    label={label}
                                />
                                {mobile && (
                                    <div
                                        className={b('control-veil')}
                                        onClick={this.onInputFocus}
                                    />
                                )}
                            </FieldWrapper>
                        </div>
                        {mobile ? (
                            <Sheet
                                id="datepicker"
                                visible={active && !disabled}
                                contentClassName={b('sheet')}
                                allowHideOnContentScroll={false}
                                onClose={this.onClose}
                            >
                                {this.renderContent(mobile)}
                            </Sheet>
                        ) : (
                            <Popup
                                contentClassName={b('popup', popupClassName)}
                                open={active && !disabled}
                                anchorElement={this.ControlNodeRef.current}
                                placement={AVAILABLE_POPUP_PLACEMENT}
                                onOpenChange={(open) => {
                                    if (!open) {
                                        this.onClose();
                                    }
                                }}
                            >
                                <div className={b('popup-content')}>
                                    {this.renderContent(mobile)}
                                </div>
                            </Popup>
                        )}
                    </React.Fragment>
                )}
            </MobileContext.Consumer>
        );
    }
}
