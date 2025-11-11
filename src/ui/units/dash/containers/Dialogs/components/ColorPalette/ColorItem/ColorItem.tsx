import React from 'react';

import {type RealTheme, ThemeProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CustomPaletteBgColors, LIKE_CHART_COLOR_TOKEN} from 'shared';

import './ColorItem.scss';

const b = block('dl-color-item');

export const ColorItem = React.forwardRef(function ColorItemWithRef(
    {
        color,
        theme,
        size,
        withExternalBorder,
        qa,
        className,
    }: {
        color: string;
        theme?: RealTheme;
        size?: 'max';
        withExternalBorder?: boolean;
        qa?: string;
        className?: string;
    },
    ref: React.ForwardedRef<HTMLSpanElement>,
) {
    const isTransparent = color === CustomPaletteBgColors.NONE;

    const backgroundColor =
        color === CustomPaletteBgColors.LIKE_CHART ? LIKE_CHART_COLOR_TOKEN : color;

    const itemContent = (
        <span
            ref={ref}
            style={{backgroundColor: isTransparent ? '' : backgroundColor}}
            className={b('bg-item', {
                transparent: isTransparent,
            })}
            data-qa={qa}
        ></span>
    );
    const mods = {
        size,
        withExternalBorder,
    };

    return theme ? (
        <ThemeProvider theme={theme} scoped rootClassName={b(mods, className)}>
            {itemContent}
        </ThemeProvider>
    ) : (
        <div className={b(mods, className)}>{itemContent}</div>
    );
});
