import {i18n} from 'i18n';
import moment from 'moment';
import type {QLConfigQuery, QlConfigParam} from 'shared/types/config/ql';

import type {MonitoringPreset, MonitoringPresetV1, MonitoringPresetV2} from '../../../../../shared';
import {getAvailableQlVisualizations, getDefaultQlVisualization} from '../../utils/visualization';

export const prepareMonitoringPresetV2 = (preset: MonitoringPresetV2) => {
    // Link to the chart from which the current chart was created (for Monitoring)
    let redirectUrl: string | undefined;

    const initialQueries: QLConfigQuery[] = [];
    const initialParams: QlConfigParam[] = [];
    let visualization = getDefaultQlVisualization();

    if (preset.data.scopeId) {
        initialParams.push({
            name: 'project_id',
            type: 'string',
            defaultValue: preset.data.scopeId,
        });
    }

    if (Array.isArray(preset?.data?.widget?.queries?.targets)) {
        preset.data.widget.queries.targets.forEach((target, index) => {
            initialQueries.push({
                queryName: `${i18n('sql', 'label_query')} ${index + 1}`,
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

        switch (mVisualizationId) {
            case 'VISUALIZATION_TYPE_UNSPECIFIED':
                visualizationId = 'area';
                break;

            case 'VISUALIZATION_TYPE_LINE':
                visualizationId = 'line';
                break;

            case 'VISUALIZATION_TYPE_STACK':
                visualizationId = 'area';
                break;

            case 'VISUALIZATION_TYPE_COLUMN':
                visualizationId = 'column';
                break;

            case 'VISUALIZATION_TYPE_BARS':
                visualizationId = 'bar';
                break;

            case 'VISUALIZATION_TYPE_PIE':
                visualizationId = 'pie';
                break;

            case 'VISUALIZATION_TYPE_PIE3D':
                visualizationId = 'pie3d';
                break;

            default:
                visualizationId = 'area';
        }

        const availableVisualizations = getAvailableQlVisualizations();
        visualization =
            availableVisualizations.find((someVisualization) => {
                return someVisualization.id === visualizationId;
            }) || getDefaultQlVisualization();

        if (preset?.data?.params) {
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

    const initialQueries: QLConfigQuery[] = [];
    const initialParams: QlConfigParam[] = [];
    let visualization = getDefaultQlVisualization();

    if (preset?.data?.chart) {
        preset.data.chart.targets.forEach((target, index) => {
            initialQueries.push({
                queryName: `${i18n('sql', 'label_query')} ${index + 1}`,
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

        if (preset?.data?.params) {
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
