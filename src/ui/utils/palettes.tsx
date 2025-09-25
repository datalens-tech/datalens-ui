import React from 'react';

import {Text, spacing} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import type {ColorPalette, InternalPaletteId, Palette} from 'shared';

export const getDefaultPaletteLabel = (defaultColorPalette: ColorPalette | Palette) => {
    let defaultPaletteName: string;
    if ('displayName' in defaultColorPalette) {
        defaultPaletteName = defaultColorPalette.displayName;
    } else {
        defaultPaletteName = i18n(
            'wizard.palette',
            `label_${defaultColorPalette.id as InternalPaletteId}`,
        );
    }

    return (
        <React.Fragment>
            {i18n('wizard', `label_default`)}
            <Text color="secondary" className={spacing({ml: 1})}>
                {defaultPaletteName}
            </Text>
        </React.Fragment>
    );
};
