import React from 'react';

import {
    type BarGradientColorSettings,
    type ColorsConfig,
    type Field,
    type TableBarsSettings,
} from 'shared';

import {PaletteType} from '../../../../../../../../../components/PaletteIcon/PaletteIcon';
import {ButtonColorDialog} from '../../../ButtonColorDialog/ButtonColorDialog';

import './GradientColorControl.scss';

type GradientColorControlProps = {
    disabled: boolean;
    settings: BarGradientColorSettings['settings'];
    field: Field;
    onColorUpdate: (settings: Partial<TableBarsSettings['colorSettings']['settings']>) => void;
    qa?: string;
};

export const GradientColorControl: React.FC<GradientColorControlProps> = (
    props: GradientColorControlProps,
) => {
    const {settings, onColorUpdate, disabled, qa, field} = props;

    const handleDialogColorApply = (config: ColorsConfig) => {
        const updatedColorSettings: Partial<BarGradientColorSettings['settings']> = {
            gradientType: config.gradientMode,
            palette: config.gradientPalette,
            reversed: config.reversed,
        };

        if (config.thresholdsMode === 'manual') {
            updatedColorSettings.thresholds = {
                mode: 'manual',
                min: config.leftThreshold || '',
                mid: config.middleThreshold,
                max: config.rightThreshold || '',
            };
        } else {
            updatedColorSettings.thresholds = {
                mode: 'auto',
            };
        }

        onColorUpdate(updatedColorSettings);
    };

    const colorsConfig: ColorsConfig = React.useMemo(() => {
        return {
            gradientPalette: settings.palette,
            gradientMode: settings.gradientType,
            reversed: settings.reversed,
            thresholdsMode: settings.thresholds.mode,
            rightThreshold:
                settings.thresholds.mode === 'manual' ? settings.thresholds.max : undefined,
            leftThreshold:
                settings.thresholds.mode === 'manual' ? settings.thresholds.min : undefined,
            middleThreshold:
                settings.thresholds.mode === 'manual' ? settings.thresholds.mid : undefined,
        };
    }, [settings]);

    return (
        <ButtonColorDialog
            qa={qa}
            disabled={disabled}
            paletteType={PaletteType.GradientPalette}
            paletteId={settings.palette}
            colorsConfig={colorsConfig}
            onApplyDialogColor={handleDialogColorApply}
            field={field}
        />
    );
};
