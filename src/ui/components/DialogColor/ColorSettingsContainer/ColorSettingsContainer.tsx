import React from 'react';

import {ColorMode, ColorPalette, ColorsConfig} from 'shared';

import {GradientView} from '../GradientView/GradientView';
import {PaletteView} from '../PaletteView/PaletteView';

type Props = {
    colorsConfig: ColorsConfig;
    colorPalettes: ColorPalette[];
    loading?: boolean;
    values?: string[];
    onChange: (config: Partial<ColorsConfig>) => void;
};

export const ColorSettingsContainer = (props: Props) => {
    const {colorsConfig, colorPalettes, loading, values, onChange} = props;

    const handleChangePaletteColors = (args: {
        palette: string;
        mountedColors: ColorsConfig['mountedColors'];
    }) => {
        const {palette, mountedColors} = args;
        onChange({palette, mountedColors});
    };

    if (colorsConfig.colorMode === ColorMode.GRADIENT) {
        return (
            <GradientView
                colorConfig={colorsConfig}
                onChange={onChange}
                usePolygonBorders={false}
                validationStatus={{}}
            />
        );
    }

    return (
        <PaletteView
            palette={colorsConfig.palette}
            colorPalettes={colorPalettes}
            mountedColors={colorsConfig.mountedColors || {}}
            onChange={handleChangePaletteColors}
            loading={loading}
            values={values || []}
        />
    );
};
