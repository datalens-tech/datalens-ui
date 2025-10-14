import {COMMON_PALETTE_ID, QlVisualizationId} from '../../../../constants';
import type {QlConfigV4} from '../../../../types/config/ql/v4';
import type {QlConfigV5} from '../../../../types/config/ql/v5';
import {QlConfigVersions} from '../../../../types/ql/versions';

const OLD_DEFAULT_PALETTE_ID = 'default-palette';

// replace 'default-palette' (old default20) with classic20 palette
export const mapV4ConfigToV5 = (config: QlConfigV4): QlConfigV5 => {
    const migratedConfig = {...config, version: QlConfigVersions.V5} as QlConfigV5;

    if (
        config.visualization?.id === QlVisualizationId.Metric &&
        config.extraSettings &&
        config.extraSettings.metricFontColorPalette === OLD_DEFAULT_PALETTE_ID
    ) {
        return {
            ...migratedConfig,
            extraSettings: {
                ...config.extraSettings,
                metricFontColorPalette: COMMON_PALETTE_ID.CLASSIC_20,
            },
        };
    } else if (
        config.visualization?.id === QlVisualizationId.FlatTable &&
        config.visualization.placeholders
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
