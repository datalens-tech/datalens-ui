import React from 'react';

import block from 'bem-cn-lite';
import {isWrappedHTML} from 'shared/utils/ui-sandbox';

import {WrappedHTMLNode} from '../WrappedHTMLNode';

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

    let displayedValue: React.ReactNode;

    if (isWrappedHTML(formattedValue)) {
        displayedValue = <WrappedHTMLNode value={formattedValue} />;
    } else if (typeof formattedValue === 'string') {
        displayedValue = formattedValue;
    } else {
        displayedValue = value;
    }

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
