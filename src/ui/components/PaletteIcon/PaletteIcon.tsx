import React from 'react';

import {Icon} from '@gravity-ui/uikit';

import {selectGradientIcon} from '../..';
import type {IconId} from '../../../shared';
import {registry} from '../../registry';

export const enum PaletteType {
    ColorPalette = 'color-palette',
    GradientPalette = 'gradient-palette',
}

type PaletteIconProps = {
    paletteId: string;
    paletteType: PaletteType;
    className?: string;
};

export const PaletteIcon: React.FC<PaletteIconProps> = (props: PaletteIconProps) => {
    const {paletteId, paletteType, className} = props;

    const icon = React.useMemo(() => {
        const {getIconDataById} = registry.common.functions.getAll();

        const selectIconFunction =
            paletteType === PaletteType.ColorPalette ? getIconDataById : selectGradientIcon;

        return selectIconFunction(paletteId as IconId);
    }, [paletteType, paletteId]);

    if (icon) {
        return <Icon data={icon} className={className} />;
    }

    return null;
};
