import {COMMON_PALETTE_ID, WizardVisualizationId} from '../../../../constants';
import type {
    V12ChartsConfig,
    V13ChartsConfig,
    V13CommonSharedExtraSettings,
} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';

const OLD_DEFAULT_PALETTE_ID = 'default-palette';

// replace 'default-palette' (old default20) with classic20 palette
export const mapV12ConfigToV13 = (config: V12ChartsConfig): V13ChartsConfig => {
    // there are differences only in the type of extraSettings
    const migratedConfig = {...config, version: ChartsConfigVersion.V13} as V13ChartsConfig;

    if (
        config.visualization?.id === WizardVisualizationId.Metric &&
        config.extraSettings &&
        config.extraSettings.metricFontColorPalette === OLD_DEFAULT_PALETTE_ID
    ) {
        const migratedExtraSettings = {
            ...config.extraSettings,
            metricFontColorPalette: COMMON_PALETTE_ID.CLASSIC_20,
        } as V13CommonSharedExtraSettings;

        return {
            ...migratedConfig,
            extraSettings: migratedExtraSettings,
        };
    } else if (
        config.visualization?.id === WizardVisualizationId.PivotTable ||
        config.visualization?.id === WizardVisualizationId.FlatTable
    ) {
        const migratedPlaceholders = config.visualization.placeholders.map((placeholder) => {
            const migratedItems = placeholder.items.map((item) => {
                const migratedItem = {...item};
                if (migratedItem.backgroundSettings?.settings.paletteState.palette) {
                    migratedItem.backgroundSettings.settings.paletteState.palette =
                        migratedItem.backgroundSettings.settings.paletteState.palette ===
                        OLD_DEFAULT_PALETTE_ID
                            ? COMMON_PALETTE_ID.CLASSIC_20
                            : migratedItem.backgroundSettings.settings.paletteState.palette;
                }

                if (migratedItem.barsSettings?.colorSettings?.settings.palette) {
                    migratedItem.barsSettings.colorSettings.settings.palette =
                        migratedItem.barsSettings.colorSettings.settings.palette ===
                        OLD_DEFAULT_PALETTE_ID
                            ? COMMON_PALETTE_ID.CLASSIC_20
                            : migratedItem.barsSettings.colorSettings.settings.palette;
                }

                return migratedItem;
            });

            return {...placeholder, items: migratedItems};
        });

        return {
            ...migratedConfig,
            visualization: {...config.visualization, placeholders: migratedPlaceholders},
        };

        // tables also has colorsConfig but only for gradients and we don't touch them.
        // indicators also has colorsConfig but it is not used
    } else if (config.colorsConfig && config.colorsConfig.palette === OLD_DEFAULT_PALETTE_ID) {
        return {
            ...migratedConfig,
            colorsConfig: {...config.colorsConfig, palette: COMMON_PALETTE_ID.CLASSIC_20},
        };
    }

    return migratedConfig;
};
