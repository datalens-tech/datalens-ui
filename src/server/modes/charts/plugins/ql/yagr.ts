import type {ChartType, YagrWidgetData} from '@gravity-ui/chartkit/yagr';
import set from 'lodash/set';

import {LegendDisplayMode, PlaceholderId, QlVisualizationId} from '../../../../../shared';
import type {IChartEditor, QlConfig, ServerVisualization} from '../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';

const applyPlaceholderSettingsToYAxis = ({
    visualization,
    placeholderIndex,
    shared,
}: {
    visualization: ServerVisualization;
    placeholderIndex: number;
    shared: QlConfig;
}) => {
    const stacking =
        (visualization.id === 'area' && shared.extraSettings?.stacking !== 'off') ||
        visualization.id === 'area100p' ||
        visualization.id === 'column' ||
        visualization.id === 'column100p';

    const scale: any = {
        normalize: false,
        stacking,
        type: 'linear',
    };

    if (visualization.placeholders && visualization.placeholders[placeholderIndex]) {
        const yPlaceholder = visualization.placeholders[placeholderIndex];

        if (yPlaceholder.settings) {
            if (
                yPlaceholder.settings.autoscale === false ||
                (yPlaceholder.settings.scale === 'auto' &&
                    yPlaceholder.settings.scaleValue === '0-max')
            ) {
                scale.min = 0;
            } else if (yPlaceholder.settings.scale === 'manual') {
                scale.min = Number((yPlaceholder.settings.scaleValue as [string, string])[0]);
                scale.max = Number((yPlaceholder.settings.scaleValue as [string, string])[1]);
            }
        }
    }

    return {scale};
};

export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const config = mapQlConfigToLatestVersion(shared, {i18n: ChartEditor.getTranslation});

    const type = (config.visualization.highchartsId || config.visualization.id) as ChartType;

    const percent =
        config.visualization.id === 'area100p' || config.visualization.id === 'column100p';

    const visualizationId = config.visualization.highchartsId || config.visualization.id;

    const tracking = visualizationId === QlVisualizationId.Area ? 'area' : 'sticky';

    const title =
        config.extraSettings?.titleMode === 'show' && config.extraSettings.title
            ? {text: config.extraSettings.title}
            : undefined;

    const visualization = config.visualization as ServerVisualization;

    const {scale: yScale} = applyPlaceholderSettingsToYAxis({
        visualization,
        placeholderIndex: 1,
        shared,
    });
    const {scale: yRightScale} = applyPlaceholderSettingsToYAxis({
        visualization,
        placeholderIndex: 2,
        shared,
    });

    const isLegendEnabled = Boolean(
        config.colors?.length && config.extraSettings?.legendMode !== LegendDisplayMode.Hide,
    );

    const tooltipSum = config.extraSettings?.tooltipSum;
    const isTooltipSumEnabled = typeof tooltipSum === 'undefined' || tooltipSum === 'on';

    const widgetData: YagrWidgetData['libraryConfig'] = {
        title,
        axes: {
            x: {
                label: 'UTC',
                labelSize: 25,
            },
            y: {
                label: '',
                precision: 'auto',
                scale: 'y',
                side: 'left',
            },
        },
        chart: {
            appearance: {
                drawOrder: ['plotLines', 'series', 'axes'],
            },
            series: {
                type,
                interpolation: 'linear',
                ...(type === 'dots' && {pointsSize: 2}),
            },
            select: {
                zoom: false,
            },
            timeMultiplier: 0.001,
        },
        cursor: {
            snapToValues: false,
            x: {
                style: '1px solid #ffa0a0',
            },
            y: {
                visible: false,
            },
        },
        legend: {
            show: isLegendEnabled,
        },
        processing: {
            nullValues: {
                '-Infinity': '-Infinity',
                Infinity: 'Infinity',
            },
        },
        scales: {
            x: {},
            y: yScale,
            yRight: yRightScale,
        },
        tooltip: {
            boundClassName: '.app',
            show: true,
            hideNoData: false,
            maxLines: 15,
            percent,
            precision: 2,
            sum: isTooltipSumEnabled,
            tracking,
        },
    };

    if (config.extraSettings?.tooltip === 'hide') {
        set(widgetData, 'tooltip.show', false);
    }

    const xAxisSettings = visualization?.placeholders?.find(
        (p) => p.id === PlaceholderId.X,
    )?.settings;
    if (xAxisSettings?.axisVisibility === 'hide') {
        set(widgetData, 'axes.x.show', false);
    }

    const yAxisSettings = visualization?.placeholders?.find(
        (p) => p.id === PlaceholderId.Y,
    )?.settings;
    if (yAxisSettings?.axisVisibility === 'hide') {
        set(widgetData, 'axes.y.show', false);
    }

    return widgetData;
};
