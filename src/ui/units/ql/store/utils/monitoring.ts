import moment from 'moment';

import {
    MonitoringPreset,
    MonitoringPresetV1,
    MonitoringPresetV2,
    QLParam,
    QLQuery,
} from '../../../../../shared';
import {getAvailableQlVisualizations, getDefaultQlVisualization} from '../../utils/visualization';

export const prepareMonitoringPresetV2 = (preset: MonitoringPresetV2) => {
    // Link to the chart from which the current chart was created (for Monitoring)
    let redirectUrl: string | undefined;

    const initialQueries: QLQuery[] = [];
    const initialParams: QLParam[] = [];
    let visualization = getDefaultQlVisualization();

    if (Array.isArray(preset?.data?.widget?.queries?.targets)) {
        preset.data.widget.queries.targets.forEach((target) => {
            initialQueries.push({
                value: target.query,
                params: [],
            });
        });
    }

    if (preset?.data?.redirectUrl) {
        redirectUrl = preset.data.redirectUrl;
    }

    if (preset?.data?.widget?.visualizationSettings) {
        const mVisualizationId = preset.data.widget.visualizationSettings.type;

        let visualizationId = 'line';

        // eslint-disable-next-line max-depth
        switch (mVisualizationId) {
            case 'auto':
                visualizationId = 'area';
                break;

            case 'area':
                visualizationId = 'area';
                break;

            case 'line':
                visualizationId = 'line';
                break;

            case 'column':
                visualizationId = 'column';
                break;

            default:
                visualizationId = 'area';
        }

        const availableVisualizations = getAvailableQlVisualizations();
        visualization =
            availableVisualizations.find((someVisualization) => {
                return someVisualization.id === visualizationId;
            }) || getDefaultQlVisualization();

        // eslint-disable-next-line max-depth
        if (preset?.data?.params) {
            // eslint-disable-next-line max-depth
            if (typeof preset.data.params.from === 'number') {
                initialParams.push({
                    name: 'from',
                    type: 'datetime',
                    defaultValue: moment(preset.data.params.from).toISOString(),
                });
            } else if (typeof preset.data.params.from === 'string') {
                initialParams.push({
                    name: 'from',
                    type: 'datetime',
                    defaultValue: preset.data.params.from,
                });
            }

            // eslint-disable-next-line max-depth
            if (typeof preset.data.params.to === 'number') {
                initialParams.push({
                    name: 'to',
                    type: 'datetime',
                    defaultValue: moment(preset.data.params.to).toISOString(),
                });
            } else if (typeof preset.data.params.to === 'string') {
                initialParams.push({
                    name: 'to',
                    type: 'datetime',
                    defaultValue: preset.data.params.to,
                });
            }
        }
    }

    return {initialParams, initialQueries, redirectUrl, visualization};
};

export const prepareMonitoringPresetV1 = (preset: MonitoringPresetV1) => {
    // Link to the chart from which the current chart was created (for Monitoring)
    let redirectUrl: string | undefined;

    const initialQueries: QLQuery[] = [];
    const initialParams: QLParam[] = [];
    let visualization = getDefaultQlVisualization();

    if (preset?.data?.chart) {
        preset.data.chart.targets.forEach((target) => {
            initialQueries.push({
                value: target.query,
                params: [
                    {
                        name: 'project_id',
                        type: 'string',
                        defaultValue: target.scopeId,
                    },
                ],
            });
        });
    }

    if (preset?.data?.redirectUrl) {
        redirectUrl = preset.data.redirectUrl;
    }

    if (preset?.data?.chart?.settings) {
        const mVisualizationId = preset.data.chart.settings['chart.type'];

        let visualizationId = 'line';

        // eslint-disable-next-line max-depth
        switch (mVisualizationId) {
            case 'auto':
                visualizationId = 'area';
                break;

            case 'area':
                visualizationId = 'area';
                break;

            case 'line':
                visualizationId = 'line';
                break;

            case 'column':
                visualizationId = 'column';
                break;

            default:
                visualizationId = 'area';
        }

        const availableVisualizations = getAvailableQlVisualizations();
        visualization =
            availableVisualizations.find((someVisualization) => {
                return someVisualization.id === visualizationId;
            }) || getDefaultQlVisualization();

        // eslint-disable-next-line max-depth
        if (preset?.data?.params) {
            // eslint-disable-next-line max-depth
            if (typeof preset.data.params.from === 'number') {
                initialParams.push({
                    name: 'from',
                    type: 'datetime',
                    defaultValue: moment(preset.data.params.from).toISOString(),
                });
            } else if (typeof preset.data.params.from === 'string') {
                initialParams.push({
                    name: 'from',
                    type: 'datetime',
                    defaultValue: preset.data.params.from,
                });
            }

            // eslint-disable-next-line max-depth
            if (typeof preset.data.params.to === 'number') {
                initialParams.push({
                    name: 'to',
                    type: 'datetime',
                    defaultValue: moment(preset.data.params.to).toISOString(),
                });
            } else if (typeof preset.data.params.to === 'string') {
                initialParams.push({
                    name: 'to',
                    type: 'datetime',
                    defaultValue: preset.data.params.to,
                });
            }
        }
    }

    return {initialParams, initialQueries, redirectUrl, visualization};
};

export const prepareMonitoringPreset = (preset: MonitoringPreset) => {
    switch (preset.data.v) {
        case 'v2':
            return prepareMonitoringPresetV2(preset as MonitoringPresetV2);

        default:
            return prepareMonitoringPresetV1(preset as MonitoringPresetV1);
    }
};
