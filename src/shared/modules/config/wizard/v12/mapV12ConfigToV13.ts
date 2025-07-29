import isEmpty from 'lodash/isEmpty';

import {
    AUTO_PALETTE_ID,
    BarsColorType,
    COMMON_PALETTE_ID,
    WizardVisualizationId,
} from '../../../../constants';
import type {
    V12ChartsConfig,
    V13ChartsConfig,
    V13CommonSharedExtraSettings,
} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';

const OLD_DEFAULT_PALETTE_ID = 'default-palette';

const mutatePalettesSettings = (config: V12ChartsConfig) => {
    // add indexes for colors & replace 'default-palette' with 'default-20'
    if (config.visualization?.id === WizardVisualizationId.Metric) {
        const extraSettings = config.extraSettings as V13CommonSharedExtraSettings;
        if (extraSettings.metricFontColorPalette === OLD_DEFAULT_PALETTE_ID) {
            extraSettings.metricFontColorPalette = COMMON_PALETTE_ID.DEFAULT_20;
        }

        if (!extraSettings.metricFontColorIndex) {
            extraSettings.metricFontColorIndex = null;
        }
    } else if (
        config.visualization?.id === WizardVisualizationId.PivotTable ||
        config.visualization?.id === WizardVisualizationId.FlatTable
    ) {
        config.visualization.placeholders.forEach((placeholder) => {
            placeholder.items.forEach((item) => {
                if (item.backgroundSettings?.settings.paletteState.palette) {
                    item.backgroundSettings.settings.paletteState.palette =
                        item.backgroundSettings.settings.paletteState.palette ===
                        OLD_DEFAULT_PALETTE_ID
                            ? COMMON_PALETTE_ID.DEFAULT_20
                            : item.backgroundSettings.settings.paletteState.palette;
                }

                if (item.barsSettings?.colorSettings?.settings.palette) {
                    item.barsSettings.colorSettings.settings.palette =
                        item.barsSettings.colorSettings.settings.palette === OLD_DEFAULT_PALETTE_ID
                            ? COMMON_PALETTE_ID.DEFAULT_20
                            : item.barsSettings.colorSettings.settings.palette;
                }

                if (item.barsSettings?.colorSettings.colorType === BarsColorType.OneColor) {
                    item.barsSettings.colorSettings.settings.colorIndex = null;
                }

                if (item.barsSettings?.colorSettings.colorType === BarsColorType.TwoColor) {
                    item.barsSettings.colorSettings.settings.positiveColorIndex = null;
                    item.barsSettings.colorSettings.settings.negativeColorIndex = null;
                }
            });
        });
        // tables also has colorsConfig but only for gradients and we don't touch them.
        // indicators also has colorsConfig but it is not used
    } else if (config.colorsConfig) {
        if (config.colorsConfig.palette === OLD_DEFAULT_PALETTE_ID) {
            config.colorsConfig.palette = COMMON_PALETTE_ID.DEFAULT_20;
        }
        // for default empty state of colorsConfig we use new option that can be configured in the tenant settings
        if (isEmpty(config.colorsConfig)) {
            config.colorsConfig = config.colorsConfig = {palette: AUTO_PALETTE_ID};
        }
    }
};

export const mapV12ConfigToV13 = (config: V12ChartsConfig): V13ChartsConfig => {
    mutatePalettesSettings(config);

    return {
        ...config,
        version: ChartsConfigVersion.V13,
    };
};
