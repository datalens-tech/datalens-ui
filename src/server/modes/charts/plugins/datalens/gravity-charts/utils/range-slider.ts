import type {
    ChartAxisRangeSlider,
    ChartSeriesRangeSliderOptions,
} from '@gravity-ui/chartkit/gravity-charts';

import {
    NavigatorLinesMode,
    NavigatorModes,
    getIsNavigatorAvailable,
    getNavigatorMode,
} from '../../../../../../../shared';
import type {ServerCommonSharedExtraSettings, ServerPlaceholder} from '../../../../../../../shared';

export function getRangeSliderConfig(args: {
    extraSettings?: ServerCommonSharedExtraSettings;
    visualization: {id: string; placeholders: ServerPlaceholder[]};
}): ChartAxisRangeSlider | undefined {
    const {extraSettings, visualization} = args;
    const navigatorMode = getNavigatorMode(extraSettings);
    const isNavigatorEnabled =
        navigatorMode === NavigatorModes.Show && getIsNavigatorAvailable(visualization);

    if (!isNavigatorEnabled) {
        return undefined;
    }

    let defaultRange: ChartAxisRangeSlider['defaultRange'] | undefined;

    if (extraSettings?.navigatorSettings?.periodSettings) {
        const {period, value} = extraSettings?.navigatorSettings?.periodSettings || {};
        const preparedValue = Number(value);

        if (!Number.isNaN(preparedValue)) {
            defaultRange = {
                size: {[period]: preparedValue},
            };
        }
    }

    return {
        defaultRange,
        enabled: true,
        height: 30,
    };
}

export function getSeriesRangeSliderConfig(args: {
    seriesName: string;
    extraSettings?: ServerCommonSharedExtraSettings;
}): ChartSeriesRangeSliderOptions | undefined {
    const {extraSettings, seriesName} = args;
    const linesMode = extraSettings?.navigatorSettings?.linesMode;
    let visible: boolean;

    if (linesMode === NavigatorLinesMode.Selected) {
        const selectedLines = extraSettings?.navigatorSettings?.selectedLines || [];
        visible = selectedLines.includes(seriesName);
    } else {
        visible = true;
    }

    return {visible};
}
