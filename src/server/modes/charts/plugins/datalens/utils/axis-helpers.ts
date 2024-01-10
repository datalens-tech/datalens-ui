import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {
    ServerField,
    ServerPlaceholder,
    ServerPlaceholderSettings,
} from '../../../../../../shared';
import {isDateField} from '../../../../../../shared';

import {getOriginalTitleOrTitle} from './misc-helpers';

export interface IgnoreProps {
    title: boolean;
}

export function getAxisTitle(placeholderSettings: ServerPlaceholderSettings, field?: ServerField) {
    switch (placeholderSettings.title) {
        case 'auto': {
            if (field) {
                return getOriginalTitleOrTitle(field);
            }

            return undefined;
        }
        case 'manual': {
            return placeholderSettings.titleValue;
        }
        case 'off': {
            return null;
        }
        default: {
            return undefined;
        }
    }
}

export function isGridEnabled(placeholderSettings?: ServerPlaceholderSettings) {
    return placeholderSettings?.grid !== 'off';
}

export function getTickPixelInterval(placeholderSettings: ServerPlaceholderSettings) {
    if (placeholderSettings.grid === 'on' && placeholderSettings.gridStep === 'manual') {
        return placeholderSettings.gridStepValue;
    }

    return undefined;
}

// eslint-disable-next-line complexity
export const applyPlaceholderSettingsToAxis = (
    placeholder: ServerPlaceholder | undefined,
    axis: Highcharts.AxisOptions,
    ignore: IgnoreProps,
) => {
    if (placeholder && placeholder.settings) {
        // Setting 0-max for y1
        // min-max is already there by default!
        // Including support for the old autoscale flag === false
        if (
            placeholder.settings.autoscale === false ||
            (placeholder.settings.scale === 'auto' && placeholder.settings.scaleValue === '0-max')
        ) {
            axis.min = 0;
        } else if (placeholder.settings.scale === 'manual') {
            axis.endOnTick = false;
            axis.min = Number((placeholder.settings.scaleValue as [string, string])[0]);
            axis.max = Number((placeholder.settings.scaleValue as [string, string])[1]);
        }

        const axisTitle = getAxisTitle(placeholder.settings, placeholder.items[0]);
        if (!ignore.title && typeof axisTitle !== 'undefined') {
            axis.title = {text: axisTitle};
        }

        if (isDateField(placeholder.items[0])) {
            axis.type = 'datetime';
        } else {
            axis.type = placeholder.settings?.type === 'logarithmic' ? 'logarithmic' : 'linear';
        }

        if (!isGridEnabled(placeholder.settings)) {
            axis.gridLineWidth = 0;
            axis.minorGridLineWidth = 0;
        }

        const tickPixelInterval = getTickPixelInterval(placeholder.settings);
        if (tickPixelInterval) {
            axis.tickPixelInterval = tickPixelInterval;
        }

        // We put the logarithmic type for the y axis
        // The linear type is there and so by default
        if (placeholder.settings.hideLabels === 'yes') {
            axis.labels = {
                ...(axis.labels || {}),
                enabled: false,
            };
        } else if (placeholder.settings.hideLabels === 'no') {
            axis.labels = {
                ...(axis.labels || {}),
                enabled: true,
            };
        }

        // We put the logarithmic type for the y axis
        // The linear type is there and so by default
        if (placeholder.settings.labelsView === 'horizontal') {
            axis.labels = {
                ...(axis.labels || {}),
                rotation: 0,
            };
        } else if (placeholder.settings.labelsView === 'vertical') {
            axis.labels = {
                ...(axis.labels || {}),
                rotation: 90,
                x: -3,
            };
        } else if (placeholder.settings.labelsView === 'angle') {
            axis.labels = {
                ...(axis.labels || {}),
                rotation: 45,
                y: 20,
                x: -3,
            };
        }
    }
};
