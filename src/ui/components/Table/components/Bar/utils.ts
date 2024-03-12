/* eslint no-console: 0, complexity: 0 */

import {isNumber, isString, isUndefined, round} from 'lodash';

import type {
    BarProps,
    GetBarStyleArgs,
    GetMaxBarStyleArgs,
    GetMinBarStyleArgs,
    GetMinMaxBarStyleArgs,
    GetMinMaxWithOffsetArgs,
    GetSeparatorStyleArgs,
    GetStylesArgs,
} from './types';

const ROUND_PRESISION = 2;
const DEFAULT_OFFSET = 0;
const AVAILABLE_ALIGN_VALUES: BarProps['align'][] = ['left', 'right'];

export const getRangeValue = (min: number, max: number) => {
    return Math.abs(min) + Math.abs(max);
};

export const getRangeValuePart = (rangeValue: number, value: number) => {
    return round((Math.abs(value) * 100) / Math.abs(rangeValue), ROUND_PRESISION);
};

export const getMinMaxWithOffset = (args: GetMinMaxWithOffsetArgs) => {
    const {min, max, offset} = args;

    if (isUndefined(min) || isUndefined(max) || offset === 0) {
        return {min, max};
    }

    let resMin: number;
    let resMax: number;

    if (offset === DEFAULT_OFFSET) {
        resMin = min;
        resMax = max;
    } else if (offset > 0) {
        resMin = -(Math.abs(min) + offset);
        resMax = max - offset;
    } else {
        resMin = -(Math.abs(min) - Math.abs(offset));
        resMax = max + offset * -1;
    }

    return {min: resMin, max: resMax};
};

const getMinMaxBarStyle = (args: GetMinMaxBarStyleArgs): React.CSSProperties => {
    const {value, min, max, color} = args;

    const rangeValue = getRangeValue(min, max);
    const separatorPart = getRangeValuePart(rangeValue, min);
    const valuePart = getRangeValuePart(rangeValue, value);
    let background: string | undefined;

    if (value < 0) {
        const minColorStop = separatorPart - valuePart;
        background = `linear-gradient(to right, transparent 0% ${minColorStop}%, ${color} ${minColorStop}% ${separatorPart}%, transparent ${separatorPart}% 100%)`;
    } else {
        const valueColorStop = separatorPart + valuePart;
        background = `linear-gradient(to right, transparent 0% ${separatorPart}%, ${color} ${separatorPart}% ${valueColorStop}%, transparent ${valueColorStop}% 100%)`;
    }

    return {background};
};

const getMinBarStyle = (args: GetMinBarStyleArgs): React.CSSProperties => {
    const {value, min, color, align = 'right'} = args;
    const valuePart = getRangeValuePart(min, value);
    const valueColorStop = 100 - valuePart;
    const background = `linear-gradient(to ${align}, transparent 0% ${valueColorStop}%, ${color} ${valueColorStop}% 100%)`;

    return {background};
};

const getMaxBarStyle = (args: GetMaxBarStyleArgs): React.CSSProperties => {
    const {value, max, color, align = 'left'} = args;
    const valuePart = getRangeValuePart(max, value);
    const valueColorStop = 100 - valuePart;
    const background = `linear-gradient(to ${align}, transparent 0% ${valueColorStop}%, ${color} ${valueColorStop}% 100%)`;

    return {background};
};

export const getBarStyle = (args: GetBarStyleArgs): React.CSSProperties => {
    const {value, min, max, align, color} = args;

    if (typeof min === 'number' && typeof max === 'number') {
        return getMinMaxBarStyle({value, min, max, color});
    }

    if (typeof min === 'number') {
        return getMinBarStyle({value, min, align, color});
    }

    if (typeof max === 'number') {
        return getMaxBarStyle({value, max, align, color});
    }

    return {};
};

export const getSeparatorStyle = (args: GetSeparatorStyleArgs): React.CSSProperties | undefined => {
    const {min, max} = args;

    if (isUndefined(min) || isUndefined(max)) {
        return undefined;
    }

    const rangeValue = getRangeValue(min, max);
    const separatorPart = getRangeValuePart(rangeValue, min);

    return {left: `${separatorPart}%`};
};

export const getStyles = (
    args: GetStylesArgs,
): {barStyle?: React.CSSProperties; separatorStyle?: React.CSSProperties} => {
    const {
        value,
        min,
        max,
        align,
        color,
        barHeight,
        isValid,
        showBar,
        showSeparator,
        offset = DEFAULT_OFFSET,
    } = args;
    let barStyle: React.CSSProperties | undefined;
    let separatorStyle: React.CSSProperties | undefined;

    if (isValid && showBar) {
        barStyle = {
            height: barHeight,
            ...getBarStyle({
                value,
                align,
                color,
                ...getMinMaxWithOffset({min, max, offset}),
            }),
        };
    }

    if (isValid && showBar && showSeparator) {
        separatorStyle = getSeparatorStyle({...getMinMaxWithOffset({min, max, offset})});
    }

    return {barStyle, separatorStyle};
};

const logError = ({message, debug = true}: {message: string; debug?: boolean}) => {
    if (debug) {
        console.error(message);
    }
};

export const isPropsValid = (props: BarProps) => {
    const {value, align, debug, offset = DEFAULT_OFFSET} = props;
    let {min, max} = props;

    if (!isNumber(value)) {
        logError({
            debug,
            message: '"value" should be a number',
        });
        return false;
    }

    if (isUndefined(min) && isUndefined(max)) {
        logError({
            debug,
            message: 'You should specify at least one of "min" or "max" properties',
        });
        return false;
    }

    if (!isUndefined(min) && !isNumber(min)) {
        logError({
            debug,
            message: '"min" should be a valid number',
        });
        return false;
    }

    if (!isUndefined(max) && !isNumber(max)) {
        logError({
            debug,
            message: '"max" should be a valid number',
        });
        return false;
    }

    if (!isNumber(offset)) {
        logError({
            debug,
            message: '"offset" should be a valid number',
        });
        return false;
    }

    // min, max are already numbers (or undefined) in this part of code
    min = min as number;
    max = max as number;

    if (min > max || min === max) {
        logError({
            debug,
            message: '"min" should be less than "max"',
        });
        return false;
    }

    if (min > offset) {
        logError({
            debug,
            message: '"min" should be less or equal offset',
        });
        return false;
    }

    if (max < offset) {
        logError({
            debug,
            message: '"max" should be greater or equal offset',
        });
        return false;
    }

    if (!isUndefined(align) && !isString(align)) {
        logError({
            debug,
            message: '"align" should be a string',
        });
        return false;
    }

    if (!isUndefined(align) && !AVAILABLE_ALIGN_VALUES.includes(align)) {
        logError({
            debug,
            message: '"align" should have one of these values: "left", "right"',
        });
        return false;
    }

    if (isNumber(min) && isNumber(max) && isString(align)) {
        logError({
            debug,
            message: '"align" is ignored because "min" and "max" are specified',
        });
    }

    return true;
};
