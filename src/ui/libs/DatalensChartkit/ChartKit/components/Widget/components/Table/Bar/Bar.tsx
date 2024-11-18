import React from 'react';

import block from 'bem-cn-lite';

import type {BarProps} from './types';
import {getStyles, isPropsValid} from './utils';

import './Bar.scss';

const b = block('chartkit-table-bar');
const DEFAULT_BG_COLOR = 'var(--g-color-base-neutral-medium)';

export const Bar = (props: BarProps) => {
    const {
        value,
        formattedValue,
        min,
        max,
        offset,
        align,
        barHeight,
        color = DEFAULT_BG_COLOR,
        showLabel = true,
        showBar = true,
        showSeparator = true,
    } = props;
    const isValid = isPropsValid(props);
    const {barStyle, separatorStyle} = getStyles({
        value,
        min,
        max,
        align,
        color,
        barHeight,
        offset,
        isValid,
        showBar,
        showSeparator,
    });

    const displayedValue = typeof formattedValue === 'string' ? formattedValue : value;

    return (
        <div className={b()}>
            <div className={b('block')} style={barStyle}>
                {Boolean(separatorStyle) && (
                    <span className={b('separator')} style={separatorStyle} />
                )}
            </div>
            {/* Cast is using to avoid artifacts in case of using user`s input like {showLabel: 0} */}
            {Boolean(showLabel && isValid) && displayedValue}
        </div>
    );
};
