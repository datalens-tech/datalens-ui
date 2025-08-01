import {COMMON_PALETTE_ID, WizardVisualizationId} from '../../../../constants';
import type {
    V12ChartsConfig,
    V13ChartsConfig,
    V13CommonSharedExtraSettings,
} from '../../../../types';
import {ChartsConfigVersion} from '../../../../types';

const OLD_DEFAULT_PALETTE_ID = 'default-palette';

// replace 'default-palette' (old default20) with classic20 palette
const migratePaletteSettings = (config: V12ChartsConfig) => {
    // types cast
    // {metricFontSize?: string; metricFontColor?: string; metricFontColorPalette?: string;} =>
    // MetricFontSettings
    const migratedExtraSettings = {...config.extraSettings} as V13CommonSharedExtraSettings;
    if (config.visualization?.id === WizardVisualizationId.Metric && config.extraSettings) {
        if (migratedExtraSettings.metricFontColorPalette === OLD_DEFAULT_PALETTE_ID) {
            migratedExtraSettings.metricFontColorPalette = COMMON_PALETTE_ID.CLASSIC_20;
        }

        return {...config, extraSettings: migratedExtraSettings};
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
            ...config,
            visualization: {...config.visualization, placeholders: migratedPlaceholders},
            extraSettings: migratedExtraSettings,
        };

        // tables also has colorsConfig but only for gradients and we don't touch them.
        // indicators also has colorsConfig but it is not used
    } else if (config.colorsConfig && config.colorsConfig.palette === OLD_DEFAULT_PALETTE_ID) {
        return {
            ...config,
            colorsConfig: {...config.colorsConfig, palette: COMMON_PALETTE_ID.CLASSIC_20},
            extraSettings: migratedExtraSettings,
        };
    }

    return {...config, extraSettings: migratedExtraSettings};
};

export const mapV12ConfigToV13 = (config: V12ChartsConfig): V13ChartsConfig => {
    const migratedConfig = migratePaletteSettings(config);

    return {
        ...migratedConfig,
        version: ChartsConfigVersion.V13,
    };
};
