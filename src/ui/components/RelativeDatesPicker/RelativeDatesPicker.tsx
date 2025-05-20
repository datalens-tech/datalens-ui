import React from 'react';

import {DatePicker} from '@gravity-ui/date-components';
import type {DatePickerProps} from '@gravity-ui/date-components';
import {dateTimeUtc} from '@gravity-ui/date-utils';
import {TriangleExclamationFill} from '@gravity-ui/icons';
import {Checkbox, HelpMark, Icon, RadioGroup, Select, TextInput} from '@gravity-ui/uikit';
import type {RadioGroupProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {RelativeDatepickerQa, getParsedRelativeDate} from 'shared';
import type {FilterValue} from 'shared';
import {SCALES} from 'shared/constants/datepicker/relative-datepicker';
import {getDefaultDateFormat} from 'ui/utils';

import {
    CONTROLS,
    DATE_TYPES,
    INTERVAL_PREFIX,
    RANGE_PARTS,
    SCALE_DAY,
    SIGNS,
    TOOLTIP_DELAY_CLOSING,
} from './constants';
import type {Props, State} from './types';
import {
    computeRelativeDate,
    createISODateTimeFromRelative,
    cretateSelectItems,
    getDatesFromValue,
    getFieldKey,
    getPresetList,
    getQaAttribute,
    getResolvedDatesData,
    isDateTimeInvalid,
} from './utils';

import './RelativeDatesPicker.scss';

const b = block('dl-relative-dates-picker');
const i18n = I18n.keyset('component.relative-dates-picker.view');
const MIN_VALID_DATE = dateTimeUtc().add(-100, 'year');
const MAX_VALID_DATE = dateTimeUtc().add(100, 'year');
const signs = cretateSelectItems(Object.values(SIGNS), 'label_sign');

class RelativeDatesPicker extends React.Component<Props, State> {
    static defaultProps: Partial<Props> = {
        range: true,
        withTime: false,
    };

    static getDerivedStateFromProps(props: Props, state: State) {
        const {range} = props;
        const {amountStart, amountEnd, scaleStart, scaleEnd, signStart, signEnd} = state;

        const changedState: Partial<State> = {
            invalidRelativeStart: !amountStart,
            invalidRelativeEnd: !amountEnd,
            invalidRange: false,
            hasPresetSelectChange: false,
        };

        if (amountStart) {
            const relativeStart = computeRelativeDate({
                sign: signStart,
                amount: amountStart,
                scale: scaleStart,
            });
            const resolvedRelativeStart = createISODateTimeFromRelative(
                relativeStart,
                RANGE_PARTS.START,
            );

            changedState.relativeStart = relativeStart;
            changedState.invalidRelativeStart = isDateTimeInvalid({
                dateTime: resolvedRelativeStart,
                min: MIN_VALID_DATE,
                max: MAX_VALID_DATE,
            });
        }

        if (amountEnd) {
            const relativeEnd = computeRelativeDate({
                sign: signEnd,
                amount: amountEnd,
                scale: scaleEnd,
            });
            const resolvedRelativeEnd = createISODateTimeFromRelative(relativeEnd, RANGE_PARTS.END);

            changedState.relativeEnd = relativeEnd;
            changedState.invalidRelativeEnd = isDateTimeInvalid({
                dateTime: resolvedRelativeEnd,
                min: MIN_VALID_DATE,
                max: MAX_VALID_DATE,
            });
        }

        // check whether the start - end interval is specified correctly
        if (range) {
            changedState.invalidRange = RelativeDatesPicker.isRangeInvalid(state, changedState);
        }

        // If there was no modifications from the selector-with-preset side,
        // check if the relative date settings match any of the available presets
        if (RelativeDatesPicker.isNeedToCheckPresetMatching(props, state)) {
            const preset = RelativeDatesPicker.checkPresetMatch(props, state);

            if (preset) {
                changedState.preset = preset;
            }
        }

        return changedState;
    }

    static isRangeInvalid(state: State, changes: Partial<State>) {
        const {start, end, absoluteStart, absoluteEnd} = state;
        const {relativeStart, relativeEnd, invalidRelativeStart, invalidRelativeEnd} = changes;

        let startDateTime;
        let endDateTime;

        if (!invalidRelativeStart) {
            if (start === DATE_TYPES.ABSOLUTE) {
                startDateTime = absoluteStart ? dateTimeUtc({input: absoluteStart}) : null;
            } else {
                startDateTime = createISODateTimeFromRelative(relativeStart, RANGE_PARTS.START);
            }
        }

        if (!invalidRelativeEnd) {
            if (end === DATE_TYPES.ABSOLUTE) {
                endDateTime = absoluteEnd ? dateTimeUtc({input: absoluteEnd}) : null;
            } else {
                endDateTime = createISODateTimeFromRelative(relativeEnd, RANGE_PARTS.END);
            }
        }

        if (!invalidRelativeStart && !invalidRelativeEnd && startDateTime && endDateTime) {
            return startDateTime > endDateTime;
        }

        return false;
    }

    static isNeedToCheckPresetMatching(props: Props, state: State) {
        const {range} = props;
        const {start, end, amountEnd, scaleStart, scaleEnd, hasPresetSelectChange} = state;
        const {RELATIVE} = DATE_TYPES;

        return range
            ? !hasPresetSelectChange &&
                  start === RELATIVE &&
                  end === RELATIVE &&
                  scaleStart === SCALE_DAY &&
                  scaleEnd === SCALE_DAY &&
                  ['0', '1'].includes(amountEnd)
            : !hasPresetSelectChange && start === RELATIVE && scaleStart === SCALE_DAY;
    }

    static checkPresetMatch(props: Props, state: State) {
        const {range} = props;
        const {presets, signStart, signEnd, amountStart, amountEnd, includeCurrentDay} = state;

        const startValue = `${amountStart === '0' ? SIGNS.MINUS : signStart}${amountStart}`;
        const endValue = `${amountEnd === '0' ? SIGNS.MINUS : signEnd}${amountEnd}`;

        let preset = null;

        if (range) {
            preset = presets.find(({start, end}) => {
                // for presets "Yesterday|Today" do not find a match with (start - 1|end - 1)
                if (['-0', '-1'].includes(start) && ['-0', '-1'].includes(end)) {
                    return start === startValue && end === endValue;
                }

                return includeCurrentDay
                    ? start === startValue && end === endValue
                    : startValue === String(Number(start) - 1) &&
                          endValue === String(Number(end) - 1);
            });
        } else {
            preset = presets.find(({start}) => {
                // for presets "Yesterday|Today" do not find a match with (start - 1)
                if (['-0', '-1'].includes(start)) {
                    return start === startValue;
                }

                return includeCurrentDay
                    ? startValue === start
                    : startValue === String(Number(start) - 1);
            });
        }

        return preset;
    }

    constructor(props: Props) {
        super(props);

        const {value, range} = this.props;
        const {ABSOLUTE, RELATIVE} = DATE_TYPES;
        const {MINUS} = SIGNS;

        const [fromDate, toDate] = getDatesFromValue(value);
        const parsedRelativeFrom = getParsedRelativeDate(fromDate || '');
        const parsedRelativeTo = getParsedRelativeDate(toDate || '');

        let amountStart = '1';
        let scaleStart = SCALE_DAY;
        let signStart = MINUS;
        let amountEnd = '0';
        let scaleEnd = SCALE_DAY;
        let signEnd = MINUS;

        if (parsedRelativeFrom) {
            [signStart, amountStart, scaleStart] = parsedRelativeFrom;
        }

        if (parsedRelativeTo) {
            [signEnd, amountEnd, scaleEnd] = parsedRelativeTo;
        }

        this.state = {
            [CONTROLS.START]: parsedRelativeFrom ? RELATIVE : ABSOLUTE,
            [CONTROLS.END]: parsedRelativeTo ? RELATIVE : ABSOLUTE,
            absoluteStart: parsedRelativeFrom ? null : fromDate,
            absoluteEnd: parsedRelativeTo ? null : toDate,
            amountStart,
            amountEnd,
            scaleStart,
            scaleEnd,
            signStart,
            signEnd,
            presets: getPresetList(range),
            preset: null,
            includeCurrentDay: true,
            invalidRelativeStart: false,
            invalidRelativeEnd: false,
            invalidRange: false,
            hasPresetSelectChange: false,
        };
    }

    componentDidUpdate(prevProps: Props) {
        const {range} = this.props;

        if (prevProps.range === range) {
            return;
        }

        const presets = getPresetList(range);
        const callback = range
            ? this.onChangeHandler
            : () => this.includeCurrentDayCheckboxHandler(true);

        let preset: State['preset'];

        if (this.state.preset) {
            preset = presets.find(({id}) => id === this.state.preset?.id);
        }

        this.setState({presets, ...(preset && {preset})}, callback);
    }

    render() {
        const {invalidRange} = this.state;
        const {range = true} = this.props;

        return (
            <div className={b()}>
                {this.renderPresets()}
                <div className={b('controls')}>
                    {this.renderControl(CONTROLS.START)}
                    {range && this.renderControl(CONTROLS.END)}
                </div>
                {invalidRange && (
                    <div className={b('error-label')}>
                        <Icon
                            data={TriangleExclamationFill}
                            className={b('error-label-icon')}
                            width="24"
                        />
                        <span>{i18n('label_invalid-range')}</span>
                    </div>
                )}
            </div>
        );
    }

    private getScales = (amount: string, scale: string) => {
        const {withTime} = this.props;
        const allScales = cretateSelectItems(Object.keys(SCALES), 'label_scale-', amount);

        if (withTime) {
            return allScales;
        }

        const scales = allScales.slice(0, 5);
        const hasScale = Boolean(scales.find(({value}) => value === scale));

        if (!hasScale) {
            const missingScale = allScales.find(({value}) => value === scale);

            if (missingScale) {
                scales.push(missingScale);
            }
        }

        return scales;
    };

    private getControlRadioBoxHandler = (
        handleControlType: (typeof CONTROLS)[keyof typeof CONTROLS],
    ): NonNullable<RadioGroupProps['onChange']> => {
        return (e) => {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {[handleControlType]: e.target.value} as unknown as Pick<
                State,
                keyof State
            >;
            this.setState(updates, () => {
                const {start, end, preset, includeCurrentDay} = this.state;

                if (!preset) {
                    this.onChangeHandler();

                    return;
                }

                this.setState(
                    {
                        ...getResolvedDatesData({
                            preset,
                            controls: {start, end},
                            includeCurrentDay,
                        }),
                    },
                    this.onChangeHandler,
                );
            });
        };
    };

    private getDatepickerHandler = (dateKey: keyof State): DatePickerProps['onUpdate'] => {
        return (value) => {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {
                [dateKey]: value?.toISOString(),
                preset: null,
            } as unknown as Pick<State, keyof State>;
            this.setState(updates, this.onChangeHandler);
        };
    };

    private getAmountInputHandler = (amountKey: keyof State) => {
        return (value: string) => {
            const {[amountKey]: currentValue} = this.state;
            // leave only the numbers
            let newValue = value.replace(/[^0-9]+/g, '');

            // process cases like "01", "05"
            if (newValue.match(/^0([0-9])/g)) {
                newValue = newValue.substring(0, newValue.length - 1);
            }

            if (newValue === currentValue) {
                return;
            }

            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {[amountKey]: newValue, preset: null} as unknown as Pick<
                State,
                keyof State
            >;
            this.setState(updates, this.onChangeHandler);
        };
    };

    private getAmountInputOnBlurHandler = (amountKey: keyof State) => {
        return () => {
            const {[amountKey]: amount} = this.state;

            if (amount) {
                return;
            }

            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {[amountKey]: '0'} as unknown as Pick<State, keyof State>;
            this.setState(updates, this.onChangeHandler);
        };
    };

    private getSignSelectHandler = (signKey: keyof State) => {
        return ([newSign]: string[]) => {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {[signKey]: newSign, preset: null} as unknown as Pick<
                State,
                keyof State
            >;
            this.setState(updates, this.onChangeHandler);
        };
    };

    private getScaleSelectHandler = (scaleKey: keyof State) => {
        return ([newScale]: string[]) => {
            // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/26635#issuecomment-486108542
            const updates = {[scaleKey]: newScale, preset: null} as unknown as Pick<
                State,
                keyof State
            >;
            this.setState(updates, this.onChangeHandler);
        };
    };

    private getResult = () => {
        const {range} = this.props;
        const {start, end, absoluteStart, absoluteEnd, relativeStart, relativeEnd} = this.state;

        const startDate = start === DATE_TYPES.ABSOLUTE ? absoluteStart : relativeStart;
        const endDate = end === DATE_TYPES.ABSOLUTE ? absoluteEnd : relativeEnd;

        if (range) {
            return `${INTERVAL_PREFIX}${startDate}_${endDate}`;
        }

        return startDate as string;
    };

    private presetSelectHandler = ([presetId]: string[]) => {
        const {start, end, presets, includeCurrentDay} = this.state;

        let state: Partial<State> = {
            preset: null,
            hasPresetSelectChange: true,
        };

        if (presetId) {
            const preset = presets.find(({id}) => id === presetId)!;
            state = {
                ...state,
                ...getResolvedDatesData({
                    preset,
                    controls: {start, end},
                    includeCurrentDay,
                }),
                preset,
            };
        }

        this.setState(state as unknown as Pick<State, keyof State>, this.onChangeHandler);
    };

    private disableCurrentDayCheckbox = () => {
        const {preset} = this.state;

        if (!preset) {
            return false;
        }

        return !preset.currentDaySetup;
    };

    private includeCurrentDayCheckboxHandler = (checkboxState: boolean) => {
        const {start, end, preset} = this.state;
        const includeCurrentDay =
            typeof checkboxState === 'boolean' ? checkboxState : !this.state.includeCurrentDay;

        let state = {includeCurrentDay};

        if (preset) {
            state = {
                ...state,
                ...getResolvedDatesData({
                    preset,
                    controls: {start, end},
                    includeCurrentDay,
                }),
            };
        }

        this.setState(state, this.onChangeHandler);
    };

    private isAbsoluteDateValid = (dateString?: unknown) => {
        if (typeof dateString !== 'string') {
            return false;
        }

        const {minDate, maxDate} = this.props;
        const dateTime = dateTimeUtc({input: dateString});
        const min = minDate ? dateTimeUtc({input: minDate}) : MIN_VALID_DATE;
        const max = minDate ? dateTimeUtc({input: maxDate}) : MAX_VALID_DATE;

        return !isDateTimeInvalid({dateTime, min, max});
    };

    private isStateValid = () => {
        const {range} = this.props;
        const {
            start,
            end,
            absoluteStart,
            absoluteEnd,
            invalidRelativeStart,
            invalidRelativeEnd,
            invalidRange,
        } = this.state;

        const isStartValid =
            start === DATE_TYPES.ABSOLUTE
                ? this.isAbsoluteDateValid(absoluteStart)
                : !invalidRelativeStart;
        const isEndValid =
            end === DATE_TYPES.ABSOLUTE
                ? this.isAbsoluteDateValid(absoluteEnd)
                : !invalidRelativeEnd;

        if (range) {
            return isStartValid && isEndValid && !invalidRange;
        }

        return isStartValid;
    };

    private onChangeHandler = () => {
        this.props.onChange(this.getResult(), {valid: this.isStateValid()});
    };

    private renderPresets = () => {
        const {range} = this.props;
        const {presets, preset, includeCurrentDay} = this.state;

        return (
            <div className={b('presets')}>
                <span className={b('presets-label')}>{i18n('label_preset')}</span>
                <div className={b('presets-select')}>
                    <Select
                        options={presets.map(({id, title}) => ({content: title, value: id}))}
                        value={preset ? [preset.id] : []}
                        onUpdate={this.presetSelectHandler}
                        placeholder="—"
                    />
                </div>
                {range && (
                    <Checkbox
                        content={i18n('label_include-current-day')}
                        checked={includeCurrentDay}
                        disabled={this.disableCurrentDayCheckbox()}
                        onUpdate={this.includeCurrentDayCheckboxHandler}
                    />
                )}
            </div>
        );
    };

    private renderControl = (controlType: (typeof CONTROLS)[keyof typeof CONTROLS]) => {
        const {minDate, maxDate, range, withTime} = this.props;
        const absoluteDateKey = getFieldKey('absolute', controlType);
        const relativeDateKey = getFieldKey('relative', controlType);
        const amountKey = getFieldKey('amount', controlType);
        const scaleKey = getFieldKey('scale', controlType);
        const signKey = getFieldKey('sign', controlType);
        const validityRelativeDateKey = getFieldKey('invalidRelative', controlType);

        const {
            [controlType]: section,
            [absoluteDateKey]: absoluteDate,
            [relativeDateKey]: relativeDate,
            [amountKey]: amount,
            [scaleKey]: scale,
            [signKey]: sign,
            [validityRelativeDateKey]: invalidRelativeDate,
        } = this.state;

        const isRelative = section === DATE_TYPES.RELATIVE;
        const rangePart = controlType === CONTROLS.START ? RANGE_PARTS.START : RANGE_PARTS.END;
        const resolvedRelativeDateTime = createISODateTimeFromRelative(
            relativeDate as FilterValue,
            rangePart,
        );
        const value = typeof absoluteDate === 'string' ? dateTimeUtc({input: absoluteDate}) : null;
        const minValue = minDate ? dateTimeUtc({input: minDate}) : MIN_VALID_DATE;
        const maxValue = minDate ? dateTimeUtc({input: maxDate}) : MAX_VALID_DATE;

        return (
            <div className={b('control')}>
                <div className={b('control-title')}>
                    {range
                        ? i18n(`label_${controlType}-control-title`)
                        : i18n('label_single-control-title')}
                </div>
                <RadioGroup
                    defaultValue={section}
                    onChange={this.getControlRadioBoxHandler(controlType)}
                    qa={`relative-radio-buttons-${controlType}`}
                >
                    <RadioGroup.Option value={DATE_TYPES.ABSOLUTE}>
                        <div className={b('radiobox-item')}>
                            <span className={b('radiobox-item-label')}>
                                {i18n('label_absolute-date')}
                            </span>
                        </div>
                        <div
                            className={b('absolute-calendar')}
                            data-qa={`datepicker-${controlType}`}
                        >
                            <DatePicker
                                value={value}
                                minValue={minValue}
                                maxValue={maxValue}
                                disabled={isRelative}
                                onUpdate={this.getDatepickerHandler(absoluteDateKey)}
                                format={getDefaultDateFormat({withTime})}
                                timeZone="utc"
                                placeholderValue={dateTimeUtc().startOf('day')}
                            />
                        </div>
                    </RadioGroup.Option>
                    <RadioGroup.Option value={DATE_TYPES.RELATIVE}>
                        {i18n('label_relative-date')}
                        <HelpMark
                            popoverProps={{
                                closeDelay: TOOLTIP_DELAY_CLOSING,
                                placement: ['right'],
                                content: <span>{i18n('label_tooltip-utc')}</span>,
                            }}
                            className={b('help-icon')}
                        />
                    </RadioGroup.Option>
                </RadioGroup>
                {isRelative && (
                    <div className={b('relative-calendar')}>
                        <div className={b('relative-calendar-row')}>
                            <div className={b('sign-select')}>
                                <Select
                                    options={signs}
                                    value={[sign as string]}
                                    onUpdate={this.getSignSelectHandler(signKey)}
                                />
                            </div>
                            <div
                                className={b('amount-input')}
                                data-qa={`amount-input-${controlType}`}
                            >
                                <TextInput
                                    className={b('amount-input-control')}
                                    pin="round-brick"
                                    value={amount as string}
                                    onBlur={this.getAmountInputOnBlurHandler(amountKey)}
                                    onUpdate={this.getAmountInputHandler(amountKey)}
                                />
                            </div>
                            <div className={b('scale-select')}>
                                <Select
                                    qa={getQaAttribute(
                                        {
                                            start: RelativeDatepickerQa.ScaleSelectStart,
                                            end: RelativeDatepickerQa.ScaleSelectEnd,
                                        },
                                        controlType,
                                    )}
                                    options={this.getScales(amount as string, scale as string)}
                                    value={[scale as string]}
                                    pin="clear-round"
                                    onUpdate={this.getScaleSelectHandler(scaleKey)}
                                />
                            </div>
                        </div>
                        <div className={b('relative-calendar-row')}>
                            <span
                                className={b('relative-calendar-date', {
                                    error: invalidRelativeDate as boolean,
                                })}
                            >
                                {invalidRelativeDate
                                    ? i18n('label_invalid-date')
                                    : `= ${resolvedRelativeDateTime.format(getDefaultDateFormat({withTime: true}))}`}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    };
}

export default RelativeDatesPicker;
