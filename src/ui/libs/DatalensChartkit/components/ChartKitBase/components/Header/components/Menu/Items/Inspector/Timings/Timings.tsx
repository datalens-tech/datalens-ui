import React from 'react';

import {HelpMark} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ChartkitMenuDialogsQA} from 'shared';
import {formatDuration} from 'shared/modules/format-units/formatUnit';

import type {ChartsStats} from '../../../../../../../../../../../../shared/types/charts';
import {DL} from '../../../../../../../../../../../constants/common';

import './Timings.scss';

const BASELINE = {
    CONFIG_RESOLVING: {
        WARNING: {
            limit: 500,
            message: () => '',
        },
        DANGER: {
            limit: 1000,
            message: () => '',
        },
    },
    DATA_FETCHING: {
        WARNING: {
            limit: 5000,
            message: () => i18n('chartkit.menu.inspector', 'label_data-fetching-warning'),
        },
        DANGER: {
            limit: 10000,
            message: () => i18n('chartkit.menu.inspector', 'label_data-fetching-danger'),
        },
    },
    JS_EXECUTION: {
        WARNING: {
            limit: 1000,
            message: () => i18n('chartkit.menu.inspector', 'label_js-execution-warning'),
        },
        DANGER: {
            limit: 5000,
            message: () => i18n('chartkit.menu.inspector', 'label_js-execution-danger'),
        },
    },
    WIDGET_RENDERING: {
        WARNING: {
            limit: 1000,
            message: () => '',
        },
        DANGER: {
            limit: 5000,
            message: () => '',
        },
    },
    // TODO:
    // 50 series / 10000 points = 0.005 / 500000 - not ok
    // 50 s / 1500 p = 0.033 / 75000 - not ok
    // 25 s / 10000 p = 0.0025 / 250000 - not ok
    // 25 s / 1500 p = 0.0167 / 37500 - ok
    // 1 s / 10000 p = 0.0001 / 10000 - ok
    // 1 s / 1500 p = 0.0006 / 1500 - ok
    // with a small series, there may be large points
    // with a large series, there should be small points
    SERIES_POINTS: {
        GRAPH: {
            WARNING: {
                limit: 50000,
                message: () => '',
            },
            DANGER: {
                limit: 100000,
                message: '',
            },
        },
        TIMESERIES: {
            WARNING: {
                limit: 500000,
                message: () => '',
            },
            DANGER: {
                limit: 1000000,
                message: '',
            },
        },
    },
    COLUMNS_ROWS: {
        WARNING: {
            limit: 1000,
            message: () => '',
        },
        DANGER: {
            limit: 10000,
            message: () => '',
        },
    },
};

const b = block('chartkit-inspector-timings');

function renderTiming(value: number | null | undefined) {
    return typeof value === 'number' ? (
        <span data-qa={ChartkitMenuDialogsQA.chartMenuInspectorNotEmpty}>
            {formatDuration(value, {precision: 'auto', lang: DL.USER_LANG})}
        </span>
    ) : (
        <span>&mdash;</span>
    );
}

function renderNumber(value: number | null | undefined) {
    return typeof value === 'number' ? value : <span>&mdash;</span>;
}

const Timings: React.FC<
    Pick<
        ChartsStats,
        | 'type'
        | 'configResolving'
        | 'dataFetching'
        | 'jsExecution'
        | 'widgetRendering'
        | 'yandexMapAPIWaiting'
        | 'seriesCount'
        | 'pointsCount'
        | 'columnsCount'
        | 'rowsCount'
    > & {
        inspectorLabelApiWaitingText?: string;
        inspectorLabelApiWaitingHintText?: string;
    }
> = ({
    type,
    configResolving,
    dataFetching,
    jsExecution,
    widgetRendering,
    yandexMapAPIWaiting,
    seriesCount,
    pointsCount,
    columnsCount,
    rowsCount,
    inspectorLabelApiWaitingText,
    inspectorLabelApiWaitingHintText,
}) => {
    const configResolvingWarning = Boolean(
        configResolving && configResolving > BASELINE.CONFIG_RESOLVING.WARNING.limit,
    );
    const configResolvingDanger = Boolean(
        configResolving && configResolving > BASELINE.CONFIG_RESOLVING.DANGER.limit,
    );

    const dataFetchingWarning = Boolean(
        dataFetching && dataFetching > BASELINE.DATA_FETCHING.WARNING.limit,
    );
    const dataFetchingDanger = Boolean(
        dataFetching && dataFetching > BASELINE.DATA_FETCHING.DANGER.limit,
    );

    const jsExecutionWarning = Boolean(
        jsExecution && BASELINE.JS_EXECUTION.WARNING.limit < jsExecution,
    );
    const jsExecutionDanger = Boolean(
        jsExecution && BASELINE.JS_EXECUTION.DANGER.limit < jsExecution,
    );

    const widgetRenderingWarning = Boolean(
        widgetRendering && BASELINE.WIDGET_RENDERING.WARNING.limit < widgetRendering,
    );
    const widgetRenderingDanger = Boolean(
        widgetRendering && BASELINE.WIDGET_RENDERING.DANGER.limit < widgetRendering,
    );

    const seriesPointsWarning = Boolean(
        seriesCount &&
            pointsCount &&
            (type === 'graph'
                ? Boolean(BASELINE.SERIES_POINTS.GRAPH.WARNING.limit < seriesCount * pointsCount)
                : Boolean(
                      BASELINE.SERIES_POINTS.TIMESERIES.WARNING.limit < seriesCount * pointsCount,
                  )),
    );

    const seriesPointsDanger = Boolean(
        seriesCount &&
            pointsCount &&
            (type === 'graph'
                ? Boolean(BASELINE.SERIES_POINTS.GRAPH.DANGER.limit < seriesCount * pointsCount)
                : Boolean(
                      BASELINE.SERIES_POINTS.TIMESERIES.DANGER.limit < seriesCount * pointsCount,
                  )),
    );

    const columnsRowsWarning = Boolean(
        columnsCount && rowsCount && BASELINE.COLUMNS_ROWS.WARNING.limit < columnsCount * rowsCount,
    );
    const columnsRowsDanger = Boolean(
        columnsCount && rowsCount && BASELINE.COLUMNS_ROWS.DANGER.limit < columnsCount * rowsCount,
    );

    return (
        <div className={b()}>
            <div
                className={b('metric', {
                    warning: configResolvingWarning,
                    danger: configResolvingDanger,
                })}
            >
                <div className={b('metric-value')}>{renderTiming(configResolving)}</div>
                <div className={b('metric-title')}>
                    {i18n('chartkit.menu.inspector', 'label_config-resolving')}
                </div>
            </div>
            <div
                className={b('metric', {warning: dataFetchingWarning, danger: dataFetchingDanger})}
            >
                <div className={b('metric-value')}>{renderTiming(dataFetching)}</div>
                <div className={b('metric-title')}>
                    {i18n('chartkit.menu.inspector', 'label_data-fetching')}
                    {dataFetchingWarning && !dataFetchingDanger && (
                        <HelpMark>{BASELINE.DATA_FETCHING.WARNING.message()}</HelpMark>
                    )}
                    {dataFetchingDanger && (
                        <HelpMark>{BASELINE.DATA_FETCHING.DANGER.message()}</HelpMark>
                    )}
                </div>
            </div>
            <div className={b('metric', {warning: jsExecutionWarning, danger: jsExecutionDanger})}>
                <div className={b('metric-value')}>{renderTiming(jsExecution)}</div>
                <div className={b('metric-title')}>
                    {i18n('chartkit.menu.inspector', 'label_js-execution')}
                    {jsExecutionWarning && !jsExecutionDanger && (
                        <HelpMark>{BASELINE.JS_EXECUTION.WARNING.message()}</HelpMark>
                    )}
                    {jsExecutionDanger && (
                        <HelpMark>{BASELINE.JS_EXECUTION.DANGER.message()}</HelpMark>
                    )}
                </div>
            </div>
            <div
                className={b('metric', {
                    warning: widgetRenderingWarning,
                    danger: widgetRenderingDanger,
                })}
            >
                <div
                    className={b('metric-value')}
                    data-qa={ChartkitMenuDialogsQA.chartMenuInspectorRenderTime}
                >
                    {renderTiming(widgetRendering)}
                </div>
                <div className={b('metric-title')}>
                    {i18n('chartkit.menu.inspector', 'label_widget-rendering')}
                </div>
            </div>
            {type === 'graph' ||
                (type === 'timeseries' && (
                    <div
                        className={b('metric', {
                            warning: seriesPointsWarning,
                            danger: seriesPointsDanger,
                        })}
                    >
                        <div className={b('metric-value')}>
                            {renderNumber(seriesCount)} / {renderNumber(pointsCount)}
                        </div>
                        <div className={b('metric-title')}>
                            {i18n('chartkit.menu.inspector', 'label_series')} /{' '}
                            {i18n('chartkit.menu.inspector', 'label_points')}
                        </div>
                    </div>
                ))}
            {type === 'table' && (
                <div
                    className={b('metric', {
                        warning: columnsRowsWarning,
                        danger: columnsRowsDanger,
                    })}
                >
                    <div className={b('metric-value')}>
                        {renderNumber(columnsCount)} / {renderNumber(rowsCount)}
                    </div>
                    <div className={b('metric-title')}>
                        {i18n('chartkit.menu.inspector', 'label_columns')} /{' '}
                        {i18n('chartkit.menu.inspector', 'label_rows')}
                    </div>
                </div>
            )}
            {type === 'ymap' && yandexMapAPIWaiting && (
                <div className={b('metric')}>
                    <div className={b('metric-value')}>{renderTiming(yandexMapAPIWaiting)}</div>
                    <div className={b('metric-title')}>
                        {inspectorLabelApiWaitingText ??
                            i18n('chartkit.menu.inspector', 'label_api-waiting')}
                        <HelpMark>
                            {inspectorLabelApiWaitingHintText ??
                                i18n('chartkit.menu.inspector', 'label_api-waiting-hint')}
                        </HelpMark>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Timings;
