import type {ChartType, TooltipOptions, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {ServerVisualization} from '../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../shared/modules/config/ql';
import type {QlConfig} from '../../../../../shared/types/config/ql';

const applyPlaceholderSettingsToYAxis = ({
    visualization,
    placeholderIndex,
}: {
    visualization: ServerVisualization;
    placeholderIndex: number;
}) => {
    const stacking =
        visualization.id === 'area' ||
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

export default ({shared}: {shared: QlConfig}) => {
    const config = mapQlConfigToLatestVersion(shared);

    const type = (config.visualization.highchartsId || config.visualization.id) as ChartType;

    const percent =
        config.visualization.id === 'area100p' || config.visualization.id === 'column100p';

    const tracking = (config.visualization.highchartsId ||
        config.visualization.id) as TooltipOptions['tracking'];

    const title =
        config.extraSettings?.titleMode === 'show' && config.extraSettings.title
            ? {text: config.extraSettings.title}
            : undefined;

    const visualization = config.visualization as ServerVisualization;

    const {scale: yScale} = applyPlaceholderSettingsToYAxis({visualization, placeholderIndex: 1});
    const {scale: yRightScale} = applyPlaceholderSettingsToYAxis({
        visualization,
        placeholderIndex: 2,
    });

    const isLegendEnabled = Boolean(
        config.colors?.length && config.extraSettings?.legendMode !== 'hide',
    );

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
            sum: true,
            tracking,
        },
    };

    return widgetData;
};
