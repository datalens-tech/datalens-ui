import React, {Component} from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {debounce} from 'lodash';
import type {DebouncedFunc} from 'lodash';
import type {SliderProps, SliderRef} from 'rc-slider';
import Slider from 'rc-slider';
import type {MarkObj} from 'rc-slider/lib/Marks';

import {LEFT_INFO_POINT_STYLE, RIGHT_INFO_POINT_STYLE} from './constants';
import type {RangeInputPickerDefaultProps, RangeInputPickerProps} from './types';
import {
    getClosestValue,
    getInfoPoints,
    getParsedValue,
    getTextValue,
    prepareAvailableValues,
    prepareValue,
} from './utils';

import './RangeInputPicker.scss';

const b = block('dl-range-input-picker');

interface RangeInputPickerState {
    prevProps: RangeInputPickerProps;
    textValue: string;
    currentValue: number;
    min: number;
    max: number;
    values?: number[];
    focused: boolean;
}

export class RangeInputPicker extends Component<RangeInputPickerProps, RangeInputPickerState> {
    static defaultProps: RangeInputPickerDefaultProps = {
        size: 'm',
        placeholder: '',
        value: 0,
        minValue: 0,
        maxValue: 100,
        debounceDelay: 200,
        disabled: false,
        readOnly: false,
        autoFocus: false,
        infoPointsCount: 2,
        step: 1,
    };

    static getDisplayTextValue(props: RangeInputPickerProps, value?: number): string {
        const {displayFormat, format} = props;
        const formatFunc = displayFormat || format || String;

        return formatFunc(value);
    }

    static getPreparedState(props: RangeInputPickerProps, currentState?: RangeInputPickerState) {
        const {availableValues, value, minValue = 0, maxValue = 100} = props;
        const {focused = false, textValue = ''} = currentState || {};
        const values = prepareAvailableValues(availableValues);
        const min = values ? values[0] : minValue;
        const max = values ? values[values.length - 1] : maxValue;
        const actualValue = prepareValue({value, min, max});

        return {
            prevProps: props,
            textValue: focused ? textValue : RangeInputPicker.getDisplayTextValue(props, value),
            currentValue: actualValue,
            min,
            max,
            values,
            focused,
        };
    }

    static getDerivedStateFromProps(
        nextProps: RangeInputPickerProps,
        state: RangeInputPickerState,
    ) {
        if (nextProps === state.prevProps) {
            return null;
        }

        return RangeInputPicker.getPreparedState(nextProps, state);
    }

    private wrapperRef = React.createRef<HTMLDivElement>();
    private sliderRef = React.createRef<SliderRef>();
    private textInputInnerRef = React.createRef<HTMLInputElement>();
    private debouncedCallOnUpdate: DebouncedFunc<() => void>;
    private debouncedHandleOnAfterUpdate: DebouncedFunc<() => void>;

    constructor(props: RangeInputPickerProps) {
        super(props);

        this.debouncedCallOnUpdate = debounce(this.callOnUpdate, props.debounceDelay);
        this.debouncedHandleOnAfterUpdate = debounce(this.handleOnAfterUpdate, props.debounceDelay);
        this.state = RangeInputPicker.getPreparedState(props);
    }

    componentDidMount() {
        const {onOutsideClick} = this.props;

        if (onOutsideClick) {
            document.addEventListener('touchstart', this.handleOutsideClick);
            document.addEventListener('mousedown', this.handleOutsideClick);
        }
    }

    componentWillUnmount() {
        this.debouncedCallOnUpdate.cancel();
        this.debouncedHandleOnAfterUpdate.cancel();

        document.removeEventListener('touchstart', this.handleOutsideClick);
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }

    render() {
        const {placeholder, autoFocus, disabled, readOnly, size, pattern, className} = this.props;
        const {currentValue, textValue, min, max, values} = this.state;

        let rangeInfoItems;
        let rcSliderInfoItems;

        if (!values || !values.length) {
            rangeInfoItems = this.renderRangeInfoItems();
        } else {
            rcSliderInfoItems = this.renderInfoItems();
        }

        return (
            <div
                ref={this.wrapperRef}
                className={b({size}, className)}
                tabIndex={0}
                onKeyDown={this.handleKeyDown}
                onMouseDown={this.handleWrapperClick}
            >
                <TextInput
                    controlRef={this.textInputInnerRef}
                    placeholder={placeholder}
                    size={size}
                    disabled={disabled}
                    onUpdate={this.handleInputUpdate}
                    onFocus={this.handleInputFocus}
                    onBlur={this.handleInputBlur}
                    value={textValue}
                    autoFocus={autoFocus}
                    controlProps={{readOnly, pattern}}
                />

                <Slider
                    ref={this.sliderRef}
                    tabIndex={0}
                    min={min}
                    max={max}
                    value={currentValue}
                    disabled={disabled}
                    onChange={this.handleSliderChange}
                    step={this.step}
                    marks={rcSliderInfoItems}
                    onAfterChange={this.debouncedHandleOnAfterUpdate}
                />

                {rangeInfoItems && (
                    <div className={b('range-info-items-list')}>{rangeInfoItems}</div>
                )}
            </div>
        );
    }

    private get patternRegex(): RegExp | null {
        const {pattern} = this.props;

        if (!pattern) {
            return null;
        }

        return new RegExp(`^(?:${pattern})$`);
    }

    private get step(): number | undefined {
        const {step} = this.props;
        const {values} = this.state;

        return !values || !values.length ? step : undefined;
    }

    private callOnUpdate = () => {
        const {onUpdate} = this.props;
        const {currentValue} = this.state;

        if (onUpdate) {
            onUpdate(currentValue);
        }
    };

    private prepareChange = (textValue: string): number => {
        const {parse} = this.props;
        const {values, min, max, currentValue} = this.state;
        let value = getParsedValue(textValue, parse);

        if (isNaN(value)) {
            value = currentValue;
        }

        let actualValue = prepareValue({value, min, max});

        if (values && values.length) {
            actualValue = getClosestValue(actualValue, values);
        }

        return actualValue;
    };

    private handleOnAfterUpdate = () => {
        const {onAfterUpdate} = this.props;
        const {currentValue} = this.state;

        if (onAfterUpdate) {
            onAfterUpdate(currentValue);
        }
    };

    private handleInputBlur = (event: React.FocusEvent<HTMLSpanElement>) => {
        event.preventDefault();

        const {onBlur} = this.props;
        const {textValue} = this.state;

        const actualValue = this.prepareChange(textValue);

        this.setState(
            {
                focused: false,
                currentValue: actualValue,
                textValue: RangeInputPicker.getDisplayTextValue(this.props, actualValue),
            },
            () => {
                if (onBlur) {
                    onBlur(actualValue);
                }
            },
        );
    };

    private handleInputFocus = () => {
        const {format, onFocus} = this.props;
        const {currentValue} = this.state;

        this.setState(
            {
                textValue: getTextValue(currentValue, format),
            },
            () => {
                if (onFocus) {
                    onFocus(currentValue);
                }
            },
        );
    };

    private handleInputUpdate = (newValue: string) => {
        if (this.patternRegex && !this.patternRegex.test(newValue)) {
            return;
        }

        const actualValue = this.prepareChange(newValue);

        this.setState(
            {
                currentValue: actualValue,
                textValue: newValue,
            },
            this.debouncedCallOnUpdate,
        );
    };

    private handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter') {
            return;
        }

        const {format, onSubmit} = this.props;
        const {textValue} = this.state;
        const actualValue = this.prepareChange(textValue);

        this.setState(
            {
                currentValue: actualValue,
                textValue: getTextValue(actualValue, format),
                focused: false,
            },
            () => {
                if (this.textInputInnerRef.current) {
                    this.textInputInnerRef.current.blur();
                }

                if (onSubmit) {
                    onSubmit(actualValue);
                }
            },
        );
    };

    private handleSliderChange = (sliderValue: number | number[]) => {
        const {min, max, values} = this.state;
        const nextValue = Array.isArray(sliderValue) ? sliderValue[0] : sliderValue;
        const value = getClosestValue(prepareValue({min, max, value: nextValue}), values);

        this.setState(
            {
                currentValue: value,
                textValue: RangeInputPicker.getDisplayTextValue(this.props, value),
            },
            this.debouncedCallOnUpdate,
        );
    };

    private handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
        // @ts-ignore
        const slider = this.sliderRef.current && this.sliderRef.current.sliderRef;
        const isSliderContainsTarget = slider && slider.contains(event.target as Node);

        if (!isSliderContainsTarget) {
            this.setState({focused: true});
        }
    };

    private handleInfoPointClick = (value: number) => {
        return (event: React.MouseEvent<HTMLAnchorElement>) => {
            const {format, parse} = this.props;

            event.preventDefault();

            const val = getParsedValue(getTextValue(value, format), parse);

            this.setState(
                {
                    currentValue: val,
                    textValue: RangeInputPicker.getDisplayTextValue(this.props, val),
                },
                () => {
                    const {onUpdate, onAfterUpdate} = this.props;

                    if (onUpdate) {
                        onUpdate(val);
                    }

                    if (onAfterUpdate) {
                        onAfterUpdate(val);
                    }
                },
            );
        };
    };

    private handleOutsideClick = (event: Event) => {
        const {onOutsideClick} = this.props;
        const {currentValue, focused} = this.state;
        const wrapper = this.wrapperRef.current;

        if (!onOutsideClick || !wrapper) {
            return;
        }

        if (!wrapper.contains(event.target as Node) && focused) {
            this.setState(
                {
                    focused: false,
                },
                () => {
                    if (onOutsideClick) {
                        onOutsideClick(currentValue);
                    }
                },
            );
        }
    };

    private renderItem = (value: number): string =>
        RangeInputPicker.getDisplayTextValue(this.props, value);

    private renderRangeItem = (value: number): JSX.Element => (
        <span
            key={value}
            className={b('range-info-item')}
            onClick={this.handleInfoPointClick(value)}
        >
            {RangeInputPicker.getDisplayTextValue(this.props, value)}
        </span>
    );

    private renderRangeInfoItems = () => {
        const {infoPointsCount = 2, minValue = 0, maxValue = 100} = this.props;
        const {values} = this.state;

        if (infoPointsCount < 1) {
            return [];
        }

        let infoItems: number[] = [];

        if (infoPointsCount === 1) {
            infoItems.push(minValue);
        } else if (!values || !values.length) {
            const step = Math.abs(maxValue - minValue) / (infoPointsCount - 1);

            for (let i = 0; i < infoPointsCount; i++) {
                const point = Math.round((minValue + step * i) * 100) / 100;

                infoItems.push(point);
            }
        } else {
            infoItems = values;
        }

        const pointsCount = infoItems.length;
        const unit = 100 / (pointsCount - 1);
        const pointWidth = unit * 0.9;
        const pointsRange = maxValue - minValue;

        return infoItems.map((point, i) => {
            const style = {
                width: pointWidth + '%',
                marginLeft: -pointWidth / 2 + '%',
                left: ((point - minValue) / pointsRange) * 100 + '%',
            };

            if (i === 0) {
                Object.assign(style, LEFT_INFO_POINT_STYLE);
            } else if (i === infoItems.length - 1) {
                Object.assign(style, RIGHT_INFO_POINT_STYLE);
            }

            return (
                <span className={b('range-info-item-container')} style={style} key={point}>
                    {this.renderRangeItem(point)}
                </span>
            );
        });
    };

    private renderInfoItems = () => {
        const {infoPointsCount = 2} = this.props;
        const {values, min, max} = this.state;

        const points = getInfoPoints({infoPointsCount, min, max, values});

        const infoItems = points.reduce(
            (acc, point: number) => {
                acc[point] = {label: this.renderItem(point), style: {}};

                return acc;
            },
            {} as NonNullable<SliderProps['marks']>,
        );

        if (infoItems[min]) {
            (infoItems[min] as MarkObj).style = LEFT_INFO_POINT_STYLE;
        }

        if (infoItems[max]) {
            (infoItems[max] as MarkObj).style = RIGHT_INFO_POINT_STYLE;
        }

        return infoItems;
    };
}
