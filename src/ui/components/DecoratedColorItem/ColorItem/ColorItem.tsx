import React from 'react';

import type {RealTheme} from '@gravity-ui/uikit';
import {ThemeProvider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CustomPaletteBgColors} from 'shared/constants/widgets';

import './ColorItem.scss';

const b = block('palette-color-item');

export const ColorItem = React.forwardRef(function ColorItemWithRef(
    {
        color,
        isSelected,
        classNameMod,
        theme,
        qa,
    }: {
        color: string;
        classNameMod?: string;
        isSelected?: boolean;
        isPreview?: boolean;
        theme?: RealTheme;
        qa?: string;
    },
    ref: React.ForwardedRef<HTMLSpanElement>,
) {
    const isTransparent = color === CustomPaletteBgColors.NONE;
    const isLikeChartBg = color === CustomPaletteBgColors.LIKE_CHART;
    const mod = classNameMod ? {[classNameMod]: Boolean(classNameMod)} : {};

    const itemContent = (
        <span
            ref={ref}
            style={{backgroundColor: isLikeChartBg || isTransparent ? '' : `${color}`}}
            className={b({
                transparent: isTransparent,
                selected: isSelected,
                'widget-bg': isLikeChartBg,
                ...mod,
            })}
            data-qa={qa}
        ></span>
    );

    return theme ? (
        <ThemeProvider theme={theme} scoped rootClassName={b('theme')}>
            {itemContent}
        </ThemeProvider>
    ) : (
        itemContent
    );
});
