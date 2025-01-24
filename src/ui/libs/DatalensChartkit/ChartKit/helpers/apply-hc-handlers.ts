import {sanitizeUrl} from '@braintree/sanitize-url';
import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {pickActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import {wrap} from 'highcharts';
import get from 'lodash/get';
import has from 'lodash/has';
import merge from 'lodash/merge';
import set from 'lodash/set';

import type {GoToEventHandler, GraphWidgetEventScope} from '../../../../../shared';
import type {GraphWidget} from '../../types';
import type {ChartKitAdapterProps} from '../types';

import {
    handleChartLoadingForActionParams,
    handleSeriesClickForActionParams,
} from './action-params-handlers';
import type {ShapedAction} from './types';
import {extractHcTypeFromData} from './utils';

export const fixPieTotals = (args: {data: GraphWidget}) => {
    const {data} = args;
    const pathToSeriesEvents = 'libraryConfig.plotOptions.series.events';

    if (!has(data, pathToSeriesEvents)) {
        set(data, pathToSeriesEvents, {});
    }

    wrap(get(data, pathToSeriesEvents), 'afterRender', function (this: Highcharts.Series) {
        // @ts-ignore
        delete this.total;
    });
};

export const applyTreemapLabelFormatter = (args: {data: GraphWidget}) => {
    const {data} = args;
    const pathToFormatter = 'libraryConfig.plotOptions.treemap.dataLabels.formatter';

    if (!has(data, pathToFormatter)) {
        set(data, pathToFormatter, function (this: any) {
            const name = this.point.name;
            if (Array.isArray(name)) {
                return name.join('<br />');
            }

            return name;
        });
    }
};

export const applySetActionParamsEvents = (args: {
    action: ShapedAction;
    data: GraphWidget;
    onChange?: ChartKitAdapterProps['onChange'];
}) => {
    const {action, data, onChange} = args;
    const clickScope: GraphWidgetEventScope = get(action, 'scope', 'point');
    const chartType = extractHcTypeFromData(data);
    const pathToChartEvents = 'libraryConfig.chart.events';
    const pathToSeriesEvents = 'libraryConfig.plotOptions.series.events';
    const pathToSeriesStates = 'libraryConfig.plotOptions.series.states';
    const pathToScatterMarkerStates = 'libraryConfig.plotOptions.scatter.marker.states';

    if (!has(data, pathToChartEvents)) {
        set(data, pathToChartEvents, {});
    }

    if (!has(data, pathToSeriesEvents)) {
        set(data, pathToSeriesEvents, {});
    }

    if (!has(data, pathToSeriesStates)) {
        set(data, pathToSeriesStates, {});
    }

    if (chartType === 'scatter' && !has(data, pathToScatterMarkerStates)) {
        set(data, pathToScatterMarkerStates, {});
    }

    const actionParams = pickActionParamsFromParams(get(data, 'unresolvedParams', {}));

    wrap(
        get(data, pathToChartEvents),
        'load',
        function (
            this: Highcharts.Chart,
            proceed: Highcharts.ChartLoadCallbackFunction,
            event: Event,
        ) {
            handleChartLoadingForActionParams({series: this.series, clickScope, actionParams});
            proceed?.apply(this, [event]);
        },
    );

    wrap(
        get(data, pathToSeriesEvents),
        'click',
        function (
            this: Highcharts.Series,
            proceed: Highcharts.SeriesClickCallbackFunction,
            event: Highcharts.SeriesClickEventObject,
        ) {
            handleSeriesClickForActionParams({
                chart: this.chart,
                clickScope,
                event,
                onChange,
                actionParams,
                point: event.point,
            });
            proceed?.apply(this, [event]);
        },
    );

    wrap(
        get(data, pathToChartEvents),
        'click',
        function (
            this: Highcharts.Chart,
            proceed: Highcharts.ChartClickCallbackFunction,
            event: Highcharts.PointerEventObject,
        ) {
            const point = this.hoverPoint;
            if (point) {
                handleSeriesClickForActionParams({
                    chart: this,
                    clickScope,
                    event,
                    onChange,
                    actionParams,
                    point,
                });
            }

            proceed?.apply(this, [event]);
        },
    );

    merge(get(data, pathToSeriesStates), {
        select: {
            // https://www.highcharts.com/forum/viewtopic.php?t=39268
            color: undefined,
            borderColor: undefined,
        },
    });

    if (chartType === 'scatter') {
        merge(get(data, pathToScatterMarkerStates), {
            select: {
                lineWidth: 0,
                radius: 7,
                fillColor: null,
            },
        });
    }
};

function handleSeriesClickForGoTo(args: {
    point?: Highcharts.Point;
    target?: GoToEventHandler['target'];
}) {
    const {point, target = 'blank'} = args;
    const pointUrl = get(point, 'options.custom.url');

    if (!pointUrl) {
        return;
    }

    try {
        const url = sanitizeUrl(pointUrl);
        window.open(url, target === '_self' ? '_self' : '_blank');
    } catch (e) {
        console.error(e);
    }
}

export const applyGoToEvents = (args: {data: GraphWidget; target?: GoToEventHandler['target']}) => {
    const {data, target} = args;
    const pathToSeriesEvents = 'libraryConfig.plotOptions.series.events';

    if (!has(data, pathToSeriesEvents)) {
        set(data, pathToSeriesEvents, {});
    }

    wrap(
        get(data, pathToSeriesEvents),
        'click',
        function (
            this: Highcharts.Series,
            proceed: Highcharts.SeriesClickCallbackFunction,
            event: Highcharts.SeriesClickEventObject,
        ) {
            handleSeriesClickForGoTo({point: event.point, target});
            proceed?.apply(this, [event]);
        },
    );
};
