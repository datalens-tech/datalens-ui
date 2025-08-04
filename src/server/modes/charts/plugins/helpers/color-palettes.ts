import type {Palette, ServerChartsConfig} from '../../../../../shared';
import {
    isEntryId,
    isSystemGradientPaletteId,
    isSystemPaletteId,
    isVisualizationWithLayers,
} from '../../../../../shared';
import type {SourceRequest} from '../datalens/url/build-sources/types';

type GetColorPalettesRequestArgs = {
    config: ServerChartsConfig;
    palettes: Record<string, Palette>;
};

function isCustomColorPaletteId(value: string, systemPalettes: Record<string, Palette>) {
    const isSystem = isSystemGradientPaletteId(value) || isSystemPaletteId(value, systemPalettes);
    return !isSystem && isEntryId(value);
}

export function getColorPalettesRequests(args: GetColorPalettesRequestArgs) {
    const {config, palettes} = args;
    const visualization = config.visualization;
    const result: Record<string, SourceRequest> = {};

    const colorPalettes = new Set<string>();
    if (isVisualizationWithLayers(visualization)) {
        visualization.layers.forEach((layer) => {
            const colorConfig = layer.commonPlaceholders.colorsConfig;
            colorPalettes.add(colorConfig?.palette || colorConfig?.gradientPalette || '');
        });
    } else {
        const colorPaletteId =
            config.colorsConfig?.palette ||
            config.colorsConfig?.gradientPalette ||
            config.extraSettings?.metricFontColorPalette ||
            '';
        colorPalettes.add(colorPaletteId);
    }

    colorPalettes.forEach((colorPaletteId) => {
        if (isCustomColorPaletteId(colorPaletteId, palettes)) {
            result[`colorPalettes_${colorPaletteId}`] = {
                method: 'GET',
                url: `/_us_color_palettes/${colorPaletteId}`,
                hideInInspector: true,
            };
        }
    });

    visualization.placeholders?.forEach((placeholder) => {
        placeholder.items.forEach((item) => {
            const {backgroundSettings, barsSettings} = item;

            if (backgroundSettings && backgroundSettings.enabled) {
                const gradientPaletteId =
                    backgroundSettings.settings?.gradientState?.gradientPalette;

                if (gradientPaletteId && isCustomColorPaletteId(gradientPaletteId, palettes)) {
                    result[`colorPalettes_${gradientPaletteId}`] = {
                        method: 'GET',
                        url: `/_us_color_palettes/${gradientPaletteId}`,
                        hideInInspector: true,
                    };
                }

                const regularPaletteId = backgroundSettings.settings?.paletteState?.palette;

                if (regularPaletteId && isCustomColorPaletteId(regularPaletteId, palettes)) {
                    result[`colorPalettes_${regularPaletteId}`] = {
                        method: 'GET',
                        url: `/_us_color_palettes/${regularPaletteId}`,
                        hideInInspector: true,
                    };
                }
            }

            if (barsSettings && barsSettings.enabled) {
                const gradientPaletteId = barsSettings.colorSettings.settings?.palette;

                if (gradientPaletteId && isCustomColorPaletteId(gradientPaletteId, palettes)) {
                    result[`colorPalettes_${gradientPaletteId}`] = {
                        method: 'GET',
                        url: `/_us_color_palettes/${gradientPaletteId}`,
                        hideInInspector: true,
                    };
                }
            }
        });
    });

    return result;
}

export function extractColorPalettesFromData(data: {[key: string]: any}) {
    const palettes: Record<string, any> = {};
    const loadedData: Record<string, any> = {};

    Object.keys(data).forEach((key) => {
        if (key.includes('colorPalettes_')) {
            const paletteId = key.replace('colorPalettes_', '');

            palettes[paletteId] = data[key][0];
        } else {
            loadedData[key] = data[key];
        }
    });

    return {colorPalettes: palettes, loadedData};
}
