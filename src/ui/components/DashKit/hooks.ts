import React from 'react';

import type {BackgroundSettings} from 'shared';
import {CustomPaletteBgColors} from 'ui/constants/widgets';

type ClassModAvailableValues = 'with-default-color' | 'with-color' | '';

const EMPTY_STYLES = {};

export function usePreparedWrapSettings(background?: BackgroundSettings) {
    const color = background?.color;
    const hasBgColor =
        background?.enabled !== false && color && color !== CustomPaletteBgColors.NONE;

    const wrapperClassMod: ClassModAvailableValues =
        (hasBgColor &&
            (color === CustomPaletteBgColors.LIKE_CHART ? 'with-default-color' : 'with-color')) ||
        '';

    const style: React.CSSProperties = React.useMemo(() => {
        return hasBgColor
            ? {
                  backgroundColor: color === CustomPaletteBgColors.LIKE_CHART ? undefined : color,
              }
            : EMPTY_STYLES;
    }, [color, hasBgColor]);

    return {
        classMod: wrapperClassMod,
        style,
    };
}
