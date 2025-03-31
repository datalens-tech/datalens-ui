import type {IChartEditor} from '../../../../../../shared';
import {mapQlConfigToLatestVersion} from '../../../../../../shared/modules/config/ql';
import type {QlConfig} from '../../../../../../shared/types/config/ql';

// eslint-disable-next-line complexity
export default ({shared, ChartEditor}: {shared: QlConfig; ChartEditor: IChartEditor}) => {
    const config = mapQlConfigToLatestVersion(shared, {i18n: ChartEditor.getTranslation});

    const xAxis: Highcharts.Options['xAxis'] = {
        endOnTick: false,
    };
    const yAxis: Highcharts.Options['yAxis'] = {};

    const chart: Highcharts.ChartOptions = {
        type: config.visualization.highchartsId || config.visualization.id,
        zoomType: 'x',
    };

    const plotOptions: Highcharts.PlotOptions = {};

    const visualizationId = config.visualization.id;

    // We apply settings that are unique for each type of visualization
    switch (visualizationId) {
        case 'line':
            chart.zoomType = 'xy';

            break;

        case 'area':
            plotOptions.area = {
                stacking: 'normal',
            };

            break;

        case 'area100p':
            plotOptions.area = {
                stacking: 'percent',
            };

            break;

        case 'column':
        case 'column100p':
        case 'bar':
        case 'bar100p':
            chart.zoomType = 'xy';

            plotOptions.column = {
                dataGrouping: {
                    enabled: false,
                },
                maxPointWidth: 50,
            };

            plotOptions.bar = {};

            // In Highcharts typings, null is not allowed, but it is allowed by the dock
            // https://github.com/highcharts/highcharts/issues/14710
            // @ts-ignore
            plotOptions.bar.pointWidth = null;

            switch (visualizationId) {
                case 'column':
                    plotOptions.column.stacking = 'normal';
                    break;

                case 'bar':
                    plotOptions.bar.stacking = 'normal';
                    break;

                case 'column100p':
                    plotOptions.column.stacking = 'percent';
                    break;

                case 'bar100p':
                    plotOptions.bar.stacking = 'percent';
                    break;
            }
            break;

        case 'pie':
        case 'pie3d':
            plotOptions.pie = {
                dataLabels: {
                    enabled: true,
                },
            };
            break;
        case 'donut':
            plotOptions.pie = {
                dataLabels: {
                    enabled: true,
                },
                innerSize: '50%',
            };
    }

    const result: Highcharts.Options = {
        chart,
        xAxis,
        yAxis,
        plotOptions,
        time: {
            useUTC: true,
        },
    };

    return result;
};
