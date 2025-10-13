import {isEmpty} from 'lodash';

import type {
    ColorPalette,
    Palette,
    ServerChartsConfig,
    ServerColorsConfig,
    ServerField,
} from '../../../../../shared';
import {
    getFieldUISettings,
    isEntryId,
    isSystemGradientPaletteId,
    isSystemPaletteId,
    isVisualizationWithLayers,
} from '../../../../../shared';
import {selectServerPalette} from '../../../../constants';
import type {SourceRequest} from '../datalens/url/types';

type GetColorPalettesRequestArgs = {
    config: ServerChartsConfig;
    palettes: Record<string, Palette>;
};

function isCustomColorPaletteId(value: string, systemPalettes: Record<string, Palette>) {
    const isSystem = isSystemGradientPaletteId(value) || isSystemPaletteId(value, systemPalettes);
    return !isSystem && isEntryId(value);
}

export function addColorPaletteRequest({
    colorPaletteId,
    palettes,
    result,
}: {
    colorPaletteId: string;
    palettes: Record<string, Palette>;
    result: Record<string, unknown>;
}) {
    if (isCustomColorPaletteId(colorPaletteId, palettes)) {
        // eslint-disable-next-line no-param-reassign
        result[`colorPalettes_${colorPaletteId}`] = {
            method: 'GET',
            url: `/_us_color_palettes/${colorPaletteId}`,
            hideInInspector: true,
        };
    }
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

    colorPalettes.forEach((colorPaletteId) =>
        addColorPaletteRequest({colorPaletteId, palettes, result}),
    );

    visualization.placeholders?.forEach((placeholder) => {
        placeholder.items.forEach((item) => {
            const {backgroundSettings, barsSettings} = item;

            if (backgroundSettings && backgroundSettings.enabled) {
                const gradientPaletteId =
                    backgroundSettings.settings?.gradientState?.gradientPalette;

                if (gradientPaletteId) {
                    addColorPaletteRequest({colorPaletteId: gradientPaletteId, palettes, result});
                }

                const regularPaletteId = backgroundSettings.settings?.paletteState?.palette;
                if (regularPaletteId) {
                    addColorPaletteRequest({colorPaletteId: regularPaletteId, palettes, result});
                }
            }

            if (barsSettings && barsSettings.enabled) {
                const gradientPaletteId = barsSettings.colorSettings.settings?.palette;

                if (gradientPaletteId) {
                    addColorPaletteRequest({colorPaletteId: gradientPaletteId, palettes, result});
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

export function getColorsSettings({
    defaultColorPaletteId,
    colorsConfig,
    field,
    customColorPalettes,
    availablePalettes,
}: {
    defaultColorPaletteId: string;
    colorsConfig: ServerColorsConfig | undefined;
    field: ServerField | undefined;
    customColorPalettes: Record<string, ColorPalette>;
    availablePalettes: Record<string, Palette>;
}) {
    let mountedColors: Record<string, string> = {};
    let colors: string[] = [];

    if (
        colorsConfig?.mountedColors &&
        (field?.guid === colorsConfig.fieldGuid || colorsConfig.coloredByMeasure)
    ) {
        mountedColors = colorsConfig.mountedColors ?? {};
    } else if (field) {
        const fieldSettings = getFieldUISettings({field});
        mountedColors = fieldSettings?.colors ?? {};
        colors = selectServerPalette({
            palette: fieldSettings?.palette,
            availablePalettes,
            customColorPalettes,
            defaultColorPaletteId,
        });
    }

    if (isEmpty(colors)) {
        colors = selectServerPalette({
            palette: colorsConfig?.palette,
            availablePalettes,
            customColorPalettes,
            defaultColorPaletteId,
        });
    }

    return {mountedColors, colors};
}
