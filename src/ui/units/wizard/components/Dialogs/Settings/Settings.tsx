import React from 'react';

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import {Dialog, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import _isEqual from 'lodash/isEqual';
import _pick from 'lodash/pick';
import {connect} from 'react-redux';
import {
    CommonSharedExtraSettings,
    Dataset,
    Feature,
    GraphShared,
    NavigatorLinesMode,
    NavigatorPeriod,
    NavigatorSettings,
    Period,
    PlaceholderId,
    PlaceholderSettings,
    QLChartType,
    Shared,
    WizardVisualizationId,
    getIsNavigatorAvailable,
    isDateField,
    isTreeField,
} from 'shared';
import {DatalensGlobalState, Utils} from 'ui';
import {getFirstFieldInPlaceholder} from 'ui/units/wizard/utils/placeholder';
import {WidgetData} from 'units/wizard/actions/widget';
import {selectHighchartsWidget, selectIsLoading} from 'units/wizard/selectors/preview';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {DEFAULT_PAGE_ROWS_LIMIT} from '../../../../../constants/misc';
import {getQlAutoExecuteChartValue} from '../../../../ql/utils/chart-settings';
import {CHART_SETTINGS, SETTINGS, VISUALIZATION_IDS} from '../../../constants';
import {getDefaultChartName} from '../../../utils/helpers';

import {isD3Visualization} from './../../../utils/visualization';
import LimitInput from './LimitInput/LimitInput';
import SettingFeed from './SettingFeed/SettingFeed';
import SettingNavigator from './SettingNavigator/SettingNavigator';
import SettingPagination from './SettingPagination/SettingPagination';
import SettingSwitcher from './SettingSwitcher/SettingSwitcher';
import SettingTitleMode from './SettingTitleMode/SettingTitleMode';

import './Settings.scss';

const b = block('wizard-chart-settings');
type SettingsKeys = keyof State;

const BASE_SETTINGS_KEYS: SettingsKeys[] = [
    'titleMode',
    'title',
    'legendMode',
    'tooltipSum',
    'pagination',
    'limit',
    'totals',
    'feed',
    'pivotFallback',
    'navigatorSettings',
];

const QL_SETTINGS_KEYS: SettingsKeys[] = [...BASE_SETTINGS_KEYS, 'qlAutoExecuteChart'];

const TOOLTIP_SUM_SUPPORTED_VISUALIZATION = new Set([
    'line',
    'area',
    'area100p',
    'column',
    'column100p',
    'bar',
    'bar100p',
]);

const DEFAULT_PERIOD: Period = 'day';

const visualizationsWithLegendDict = (
    [
        VISUALIZATION_IDS.LINE,

        VISUALIZATION_IDS.AREA,
        VISUALIZATION_IDS.AREA_100P,

        VISUALIZATION_IDS.COLUMN,
        VISUALIZATION_IDS.COLUMN_100P,

        VISUALIZATION_IDS.BAR,
        VISUALIZATION_IDS.BAR_100P,

        VISUALIZATION_IDS.PIE,
        VISUALIZATION_IDS.DONUT,
        VISUALIZATION_IDS.SCATTER,

        VISUALIZATION_IDS.GEOLAYER,
        VISUALIZATION_IDS.GEOPOINT,
        VISUALIZATION_IDS.GEOPOLYGON,
        VISUALIZATION_IDS.HEATMAP,
        VISUALIZATION_IDS.COMBINED_CHART,

        VISUALIZATION_IDS.POLYLINE,

        VISUALIZATION_IDS.SCATTER_D3,
        VISUALIZATION_IDS.PIE_D3,
        VISUALIZATION_IDS.BAR_X_D3,
    ] as string[]
).reduce((acc: Record<string, boolean>, item) => {
    acc[item] = true;
    return acc;
}, {});

type StateProps = ReturnType<typeof mapStateToProps>;

interface GeneralProps {
    onApply: (args: {
        visualization: Shared['visualization'];
        extraSettings: CommonSharedExtraSettings;
        isSettingsEqual: boolean;
    }) => void;
    onCancel: () => void;
    dataset?: Dataset;
    visualization: Shared['visualization'];
    extraSettings: CommonSharedExtraSettings;
    widget: WidgetData;
    datasetsCount: number;
    qlMode?: boolean;
    chartType: QLChartType | null | undefined;
}

type InnerProps = GeneralProps & StateProps;

interface State {
    valid: boolean;
    titleMode: string;
    title: string;
    legendMode: string;
    tooltipSum: string;
    feed: string;
    pagination?: string;
    limit?: string;
    groupping?: string;
    totals?: string;
    pivotFallback?: string;
    navigatorSettings: NavigatorSettings;
    navigatorSeries: string[];
    d3Fallback: string;
    qlAutoExecuteChart?: string;
}

export const DIALOG_CHART_SETTINGS = Symbol('DIALOG_CHART_SETTINGS');

export type OpenDialogChartSettingsArgs = {
    id: typeof DIALOG_CHART_SETTINGS;
    props: GeneralProps;
};

class DialogSettings extends React.PureComponent<InnerProps, State> {
    constructor(props: InnerProps) {
        super(props);

        const {widget, dataset, visualization, extraSettings} = this.props;

        let groupping;

        const isFlatTable = visualization.id === 'flatTable';
        const isPivotTable = visualization.id === 'pivotTable';
        const isDonut = visualization.id === 'donut';

        if (isFlatTable) {
            const placeholderWithGrouppingSettings = visualization.placeholders.find(
                (placeholder) =>
                    placeholder.settings && (placeholder.settings as {groupping: string}).groupping,
            )!;

            groupping = (placeholderWithGrouppingSettings.settings as {groupping: string})
                .groupping;
        }

        const {
            titleMode = CHART_SETTINGS.TITLE_MODE.HIDE,
            title = (widget && widget.key && widget.key.replace(/.+\//, '')) ||
                getDefaultChartName({dataset, visualization}),
            legendMode = CHART_SETTINGS.LEGEND.SHOW,
            tooltipSum = CHART_SETTINGS.TOOLTIP_SUM.ON,
            pagination = CHART_SETTINGS.PAGINATION.OFF,
            totals = CHART_SETTINGS.TOTALS.OFF,
            limit = DEFAULT_PAGE_ROWS_LIMIT,
            feed = '',
            pivotFallback = 'off',
            qlAutoExecuteChart,
        } = extraSettings;

        const navigatorSettings = this.prepareNavigatorSettings(visualization, extraSettings);
        const navigatorSeries = this.prepareNavigatorSeries(navigatorSettings.isNavigatorAvailable);

        const filteredSelectedLines = (navigatorSettings.selectedLines || []).filter((line) =>
            navigatorSeries.includes(line),
        );

        const syncedNavigatorSettings: NavigatorSettings = {
            ...navigatorSettings,
            selectedLines: filteredSelectedLines,
        };

        const tableSettings: Partial<
            Record<
                keyof Pick<
                    State,
                    'pagination' | 'limit' | 'totals' | 'pivotFallback' | 'groupping'
                >,
                string | undefined
            >
        > = {};

        if (isPivotTable || isFlatTable) {
            tableSettings.totals = totals;

            tableSettings.pivotFallback = pivotFallback;
            const isBackendPivotTable = pivotFallback !== 'on';
            if ((isPivotTable && isBackendPivotTable) || isFlatTable) {
                tableSettings.pagination = pagination;
                tableSettings.limit = String(limit);
            }

            if (isFlatTable) {
                tableSettings.groupping = groupping;
            }
        }

        this.state = {
            valid: true,

            titleMode,
            qlAutoExecuteChart: getQlAutoExecuteChartValue(qlAutoExecuteChart, props.chartType),
            title,
            legendMode,
            tooltipSum,
            feed,
            navigatorSettings: syncedNavigatorSettings,
            navigatorSeries,
            ...(isDonut && {totals}),
            ...tableSettings,
            d3Fallback: isD3Visualization(visualization.id as WizardVisualizationId)
                ? CHART_SETTINGS.D3_FALLBACK.OFF
                : CHART_SETTINGS.D3_FALLBACK.ON,
        };
    }

    componentDidUpdate(prevProps: Readonly<InnerProps>) {
        if (
            typeof prevProps.highchartsWidget?.series === 'undefined' &&
            typeof this.props.highchartsWidget?.series !== 'undefined' &&
            this.state.navigatorSettings.isNavigatorAvailable
        ) {
            const navigatorSeries = this.prepareNavigatorSeries(
                this.state.navigatorSettings.isNavigatorAvailable,
            );

            const selectedLines = this.state.navigatorSettings.selectedLines || [];
            const filteredSelectedLines = selectedLines.filter((line) =>
                navigatorSeries.includes(line),
            );
            this.setState({
                navigatorSeries,
                navigatorSettings: {
                    ...this.state.navigatorSettings,
                    selectedLines: filteredSelectedLines,
                },
            });
        }
    }

    prepareNavigatorSeries(isNavigatorAvailable: boolean): string[] {
        if (!isNavigatorAvailable) {
            return [];
        }
        const highchartsWidget = this.props?.highchartsWidget;
        const userSeries = highchartsWidget?.userOptions?.series || [];
        const graphs = highchartsWidget?.series || [];

        const seriesNames = userSeries.map(
            (userSeria) => userSeria.legendTitle || userSeria.title || userSeria.name,
        );
        return graphs
            .filter((series: Highcharts.Series) => {
                const axisExtremes = series.yAxis.getExtremes();

                if (!series.data.length) {
                    return false;
                }

                if (axisExtremes.dataMin === null && axisExtremes.dataMax === null) {
                    return false;
                } else {
                    return seriesNames.includes(series.name);
                }
            })
            .map((series) => series.name);
    }

    prepareNavigatorSettings(
        visualization: Shared['visualization'],
        extraSettings: CommonSharedExtraSettings,
    ): NavigatorSettings {
        const isNavigatorAvailable = getIsNavigatorAvailable(visualization);

        if (!isNavigatorAvailable) {
            return {isNavigatorAvailable} as NavigatorSettings;
        }

        const navigatorSettings: NavigatorSettings =
            extraSettings.navigatorSettings || ({} as NavigatorSettings);

        const navigatorMode =
            navigatorSettings.navigatorMode ||
            // Fallback for old charts, the navigatorMode field was right in the settings
            extraSettings.navigatorMode ||
            CHART_SETTINGS.NAVIGATOR.HIDE;
        const navigatorSeriesName = extraSettings.navigatorSeriesName || '';

        const selectedLines: string[] = navigatorSettings.selectedLines || [];

        let periodSettings = navigatorSettings.periodSettings;
        let linesMode = navigatorSettings.linesMode || NavigatorLinesMode.All;

        // Fallback, previously the navigator displayed only one line
        // In order not to change the old charts with the navigator, by default we display only one line.
        if (navigatorSeriesName) {
            selectedLines.push(navigatorSeriesName);
            linesMode = NavigatorLinesMode.Selected;
        }

        const itemDataType = this.getXPlaceholderItemDataType();

        if (!periodSettings) {
            // If the user had the navigator turned on and the default period was not set.
            // Then we leave the period empty (that is, we keep the old behavior of the navigator)
            // If this is the first time the navigator is turned on, then we put down the normal default period.
            periodSettings =
                navigatorMode === CHART_SETTINGS.NAVIGATOR.SHOW
                    ? {value: '', period: DEFAULT_PERIOD, type: itemDataType}
                    : {value: '1', period: DEFAULT_PERIOD, type: itemDataType};
        } else {
            // Updating the data_type of the period settings;
            periodSettings.type = itemDataType;
        }

        return {
            navigatorMode,
            isNavigatorAvailable,
            selectedLines,
            linesMode,
            periodSettings,
        };
    }

    setValid = (valid: boolean) => this.setState({valid});

    onApply = () => {
        const settings = _pick(
            this.state,
            this.props.qlMode ? QL_SETTINGS_KEYS : BASE_SETTINGS_KEYS,
        );

        let isSettingsEqual = _isEqual(settings, this.props.extraSettings);

        let extraSettings: CommonSharedExtraSettings = {
            ...this.props.extraSettings,
            ...settings,
        } as CommonSharedExtraSettings;

        // We give the limit type only before the submission in order to process the cases correctly
        // with an empty string, which when casted in Number will turn into 0
        if (extraSettings.limit) {
            extraSettings = {
                ...extraSettings,
                limit: Number(extraSettings.limit),
            };
        }

        let visualization = this.props.visualization;

        if (visualization.id === 'flatTable') {
            visualization = {
                ...visualization,
                placeholders: visualization.placeholders.map((item) => {
                    if (item.settings?.groupping) {
                        return {
                            ...item,
                            settings: {
                                ...item.settings,
                                groupping: this.state.groupping,
                            },
                        };
                    }

                    return item;
                }),
            } as Shared['visualization'];
        }

        const newVisualizationId = this.getNewVisualizationId();
        if (newVisualizationId) {
            visualization = {
                ...visualization,
                id: newVisualizationId,
            } as Shared['visualization'];
            isSettingsEqual = false;
        }

        this.props.onApply({extraSettings, visualization, isSettingsEqual});
    };

    getNewVisualizationId = () => {
        const {visualization} = this.props;
        const {d3Fallback} = this.state;

        const highchartsD3Map: Record<string, string> = {
            [WizardVisualizationId.Scatter]: WizardVisualizationId.ScatterD3,
            [WizardVisualizationId.Pie]: WizardVisualizationId.PieD3,
            [WizardVisualizationId.Column]: WizardVisualizationId.BarXD3,
        };
        const D3HighchartsMap = Object.fromEntries(
            Object.entries(highchartsD3Map).map(([key, value]) => [value, key]),
        );

        if (d3Fallback === CHART_SETTINGS.D3_FALLBACK.OFF && visualization.id in highchartsD3Map) {
            return highchartsD3Map[visualization.id] as WizardVisualizationId;
        }

        if (d3Fallback === CHART_SETTINGS.D3_FALLBACK.ON && visualization.id in D3HighchartsMap) {
            return D3HighchartsMap[visualization.id] as WizardVisualizationId;
        }

        return null;
    };

    handleNavigatorSelectedLineUpdate = (updatedSelectedLines: string[]) => {
        this.setState({
            navigatorSettings: {
                ...this.state.navigatorSettings,
                selectedLines: updatedSelectedLines,
            },
        });
    };

    handleNavigatorLineModeUpdate = (value: NavigatorLinesMode) => {
        this.setState({
            navigatorSettings: {...this.state.navigatorSettings, linesMode: value},
        });
    };

    handleNavigatorSwitcherChange = (value: string) => {
        this.setState({
            navigatorSettings: {...this.state.navigatorSettings, navigatorMode: value},
        });
    };

    handleNavigatorPeriodUpdate = (periodValues: NavigatorPeriod) => {
        this.setState({
            navigatorSettings: {...this.state.navigatorSettings, periodSettings: {...periodValues}},
        });
    };

    handleQlAutoExecuteChartUpdate = (value: string) => {
        this.setState({
            qlAutoExecuteChart: value,
        });
    };

    getXPlaceholderItemDataType() {
        const {visualization} = this.props;
        const placeholders = visualization.placeholders || [];
        const placeholderX = placeholders.find((placeholder) => placeholder.id === 'x');
        const items = placeholderX?.items || [];
        const item = items[0];

        return item.data_type;
    }

    renderTitleMode() {
        const titleMode = this.state.titleMode || CHART_SETTINGS.TITLE_MODE.HIDE;
        const inputTitleValue = this.state.title;

        return (
            <SettingTitleMode
                titleMode={titleMode}
                inputValue={inputTitleValue}
                onChangeSwitcher={(value: string) => {
                    this.setState({titleMode: value});
                }}
                onChangeInput={(value: string) => {
                    this.setState({title: value});
                }}
            />
        );
    }

    renderLegend() {
        const {legendMode = CHART_SETTINGS.LEGEND.SHOW} = this.state;

        const {visualization} = this.props;

        if (!visualizationsWithLegendDict[visualization.id]) {
            return null;
        }
        const title = i18n('wizard', 'label_legend');
        return (
            <SettingSwitcher
                currentValue={legendMode}
                checkedValue={CHART_SETTINGS.LEGEND.SHOW}
                uncheckedValue={CHART_SETTINGS.LEGEND.HIDE}
                onChange={(value) => {
                    this.setState({legendMode: value});
                }}
                title={title}
                qa="legend-switcher"
            />
        );
    }

    renderTooltipSum() {
        const {visualization} = this.props;
        const tooltipSum = this.state.tooltipSum || CHART_SETTINGS.TOOLTIP_SUM.ON;

        const tooltipSumEnabled = TOOLTIP_SUM_SUPPORTED_VISUALIZATION.has(visualization.id);

        if (!tooltipSumEnabled) {
            return null;
        }

        const title = i18n('wizard', 'label_tooltip-sum');

        return (
            <SettingSwitcher
                currentValue={tooltipSum}
                checkedValue={CHART_SETTINGS.TOOLTIP_SUM.ON}
                uncheckedValue={CHART_SETTINGS.TOOLTIP_SUM.OFF}
                onChange={(value: string) => {
                    this.setState({tooltipSum: value});
                }}
                title={title}
                qa="tooltip-sum-switcher"
            />
        );
    }

    renderNavigator() {
        const {navigatorSettings, navigatorSeries} = this.state;
        const {navigatorMode, isNavigatorAvailable, periodSettings, linesMode, selectedLines} =
            navigatorSettings;

        if (!(navigatorSeries || []).length || !isNavigatorAvailable) {
            return null;
        }

        return (
            <SettingNavigator
                lines={navigatorSeries}
                periodSettings={periodSettings}
                onUpdatePeriod={this.handleNavigatorPeriodUpdate}
                selectedLines={selectedLines}
                onUpdateSelectedLines={this.handleNavigatorSelectedLineUpdate}
                linesMode={linesMode}
                onUpdateRadioButtons={this.handleNavigatorLineModeUpdate}
                navigatorValue={navigatorMode}
                onToggle={this.handleNavigatorSwitcherChange}
            />
        );
    }

    renderPagination() {
        const {datasetsCount} = this.props;
        const {pagination} = this.state;

        if (!pagination || this.props.qlMode) {
            return null;
        }

        const isTreeInTable = this.getIsTreeInTable();

        return (
            <SettingPagination
                paginationValue={pagination}
                onChange={(value: string) => {
                    this.setState({pagination: value});
                }}
                datasetsCount={datasetsCount}
                tooltipClassName={b('tooltip')}
                isTreeInTable={isTreeInTable}
            />
        );
    }

    renderLimit() {
        const {pagination, limit} = this.state;

        if (typeof limit === 'undefined' || this.props.qlMode) {
            return null;
        }

        return (
            <LimitInput
                text={limit}
                disabled={pagination === CHART_SETTINGS.PAGINATION.OFF}
                setValid={this.setValid}
                onChange={(nextLimit) => this.setState({limit: nextLimit})}
            />
        );
    }

    getGrouping() {
        const {groupping = CHART_SETTINGS.GROUPPING.ON} = this.state;

        /* Initially, this setting was set as {grouping: 'enabled'}, then it was renamed to 'on'|'off'. For the RadioButton component, this transition turned out to be quite painful, because it crashes when trying to drop a value into it that does not correspond to any value in RadioButton.Radio*/

        if (groupping === 'enabled') {
            return CHART_SETTINGS.GROUPPING.ON;
        }

        if (groupping === 'disabled') {
            return CHART_SETTINGS.GROUPPING.OFF;
        }

        return groupping;
    }

    renderGrouping() {
        const {groupping} = this.state;

        if (typeof groupping === 'undefined' || this.props.qlMode) {
            return null;
        }

        const title = i18n('wizard', 'label_groupping');
        return (
            <SettingSwitcher
                currentValue={this.getGrouping()}
                checkedValue={CHART_SETTINGS.GROUPPING.ON}
                uncheckedValue={CHART_SETTINGS.GROUPPING.OFF}
                onChange={(value: string) => {
                    this.setState({groupping: value});
                }}
                title={title}
                qa="groupping-switcher"
            />
        );
    }

    getIsTreeInTable() {
        const {visualization} = this.props;

        return (
            visualization.id === 'flatTable' &&
            visualization.placeholders.some((placeholder) => {
                return placeholder.items.some((field) => {
                    return isTreeField(field);
                });
            })
        );
    }

    renderTotals() {
        const {visualization, qlMode} = this.props;
        const {totals, pivotFallback} = this.state;
        const visualizationId = visualization.id as WizardVisualizationId;

        const shouldRenderTotal = [
            WizardVisualizationId.FlatTable,
            WizardVisualizationId.Donut,
        ].includes(visualizationId);

        if (!shouldRenderTotal || qlMode) {
            return null;
        }

        const isTreeInTable = this.getIsTreeInTable();
        const isPivotFallbackTurnedOn =
            visualizationId === WizardVisualizationId.PivotTable && pivotFallback === 'on';

        const currentValue = isPivotFallbackTurnedOn ? CHART_SETTINGS.TOTALS.OFF : totals || '';

        const title = i18n('wizard', 'label_totals');
        return (
            <SettingSwitcher
                currentValue={currentValue}
                checkedValue={CHART_SETTINGS.TOTALS.ON}
                uncheckedValue={CHART_SETTINGS.TOTALS.OFF}
                onChange={(value: string) => {
                    this.setState({totals: value});
                }}
                title={title}
                qa="totals-switcher"
                disabled={isTreeInTable || isPivotFallbackTurnedOn}
                tooltip={isTreeInTable}
                tooltipText={i18n('wizard', 'tooltip_tree-total_unavailable')}
                tooltipClassName={b('tooltip')}
                tooltipPosition={['right']}
            />
        );
    }

    renderLoader() {
        return (
            <div className={b('loader')}>
                <Loader size="l" />
            </div>
        );
    }

    renderFeed() {
        const visualization = this.props.visualization as GraphShared['visualization'];
        const placeholders = visualization.placeholders;

        const isInvertedXYAxis =
            visualization.id === WizardVisualizationId.Bar ||
            visualization.id === WizardVisualizationId.Bar100p;

        const placeholderIdWithDimensionField = isInvertedXYAxis
            ? PlaceholderId.Y
            : PlaceholderId.X;

        const placeholderWithDimensionField = placeholders.find(
            (p) => p.id === placeholderIdWithDimensionField,
        );

        if (!placeholderWithDimensionField || visualization.allowComments === false) {
            return null;
        }

        const firstField = getFirstFieldInPlaceholder(placeholderWithDimensionField);
        const placeholderSettings = placeholderWithDimensionField.settings as PlaceholderSettings;
        const isValidField = Boolean(
            isDateField(firstField) &&
                placeholderSettings?.axisModeMap &&
                placeholderSettings?.axisModeMap[firstField.guid] &&
                placeholderSettings?.axisModeMap[firstField.guid] !== SETTINGS.AXIS_MODE.DISCRETE,
        );

        if (!isValidField || !Utils.isEnabledFeature(Feature.Comments)) {
            return null;
        }

        return (
            <SettingFeed
                currentFeed={this.state.feed}
                onFeedUpdate={(value: string) => {
                    this.setState({feed: value});
                }}
            />
        );
    }

    renderPivotFallback() {
        const {visualization} = this.props;
        const {pivotFallback} = this.state;

        if (visualization.id !== 'pivotTable') {
            return null;
        }

        const isMultiDataset = this.props.datasetsCount > 1;

        return (
            <SettingSwitcher
                currentValue={pivotFallback!}
                checkedValue={CHART_SETTINGS.PIVOT_FALLBACK.ON}
                uncheckedValue={CHART_SETTINGS.PIVOT_FALLBACK.OFF}
                onChange={(value) => {
                    const partialSettings: Pick<State, 'pivotFallback' | 'pagination' | 'limit'> = {
                        pivotFallback: value,
                    };

                    if (value === CHART_SETTINGS.PIVOT_FALLBACK.ON) {
                        partialSettings.pagination = undefined;
                        partialSettings.limit = undefined;
                    }

                    this.setState(partialSettings);
                }}
                title={i18n('wizard', 'label_pivot-fallback')}
                qa="pivot-fallback-switcher"
                disabled={isMultiDataset}
                tooltip={isMultiDataset}
                tooltipText={i18n('wizard', 'tooltip_backend-pivot_unavailable')}
                tooltipClassName={b('tooltip')}
                tooltipPosition={['right']}
            />
        );
    }

    renderD3Switch() {
        const {visualization} = this.props;
        const {d3Fallback} = this.state;
        const currentVisualizationId = visualization.id as WizardVisualizationId;
        const isScatterVisualization = [
            WizardVisualizationId.Scatter,
            WizardVisualizationId.ScatterD3,
        ].includes(currentVisualizationId);
        const isPieVisualization = [
            WizardVisualizationId.Pie,
            WizardVisualizationId.PieD3,
        ].includes(currentVisualizationId);
        const isColumnVisualization = [
            WizardVisualizationId.Column,
            WizardVisualizationId.BarXD3,
        ].includes(currentVisualizationId);
        const enabled =
            (isScatterVisualization && Utils.isEnabledFeature(Feature.D3ScatterVisualization)) ||
            (isPieVisualization && Utils.isEnabledFeature(Feature.D3PieVisualization)) ||
            (isColumnVisualization && Utils.isEnabledFeature(Feature.D3BarXVisualization));

        if (!enabled) {
            return null;
        }

        return (
            <SettingSwitcher
                currentValue={d3Fallback}
                checkedValue={CHART_SETTINGS.D3_FALLBACK.ON}
                uncheckedValue={CHART_SETTINGS.D3_FALLBACK.OFF}
                onChange={(value) => {
                    this.setState({
                        d3Fallback: value,
                    });
                }}
                title={i18n('wizard', 'label_d3-fallback')}
                qa="d3-fallback-switcher"
            />
        );
    }

    renderQlAutoExecutionChart() {
        const {qlMode} = this.props;

        if (!qlMode || !this.state.qlAutoExecuteChart) {
            return null;
        }

        return (
            <SettingSwitcher
                currentValue={this.state.qlAutoExecuteChart}
                checkedValue={CHART_SETTINGS.QL_AUTO_EXECUTION_CHART.ON}
                uncheckedValue={CHART_SETTINGS.QL_AUTO_EXECUTION_CHART.OFF}
                onChange={this.handleQlAutoExecuteChartUpdate}
                title={i18n('sql', 'label_ql-auto-execution-chart')}
            />
        );
    }

    renderModalBody() {
        const {navigatorSettings} = this.state;
        const {isPreviewLoading} = this.props;

        const isNavigatorAvailable = navigatorSettings.isNavigatorAvailable;

        if (isPreviewLoading && isNavigatorAvailable) {
            return this.renderLoader();
        }

        return (
            <div className={b('settings')}>
                {this.renderTitleMode()}
                {this.renderLegend()}
                {this.renderTooltipSum()}
                {this.renderPagination()}
                {this.renderLimit()}
                {this.renderGrouping()}
                {this.renderTotals()}
                {this.renderFeed()}
                {this.renderPivotFallback()}
                {this.renderNavigator()}
                {this.renderD3Switch()}
                {this.renderQlAutoExecutionChart()}
            </div>
        );
    }

    render() {
        const {valid} = this.state;

        return (
            <Dialog
                open={true}
                className={b()}
                onClose={this.props.onCancel}
                disableFocusTrap={true}
            >
                <div className={b('content')}>
                    <Dialog.Header caption={i18n('wizard', 'label_chart-settings')} />
                    <Dialog.Body>{this.renderModalBody()}</Dialog.Body>
                    <Dialog.Footer
                        preset="default"
                        onClickButtonCancel={() => {
                            this.props.onCancel();
                        }}
                        onClickButtonApply={this.onApply}
                        textButtonApply={i18n('wizard', 'button_apply')}
                        textButtonCancel={i18n('wizard', 'button_cancel')}
                        propsButtonApply={{
                            disabled: !valid,
                        }}
                        //@ts-ignore
                        hr={false}
                    />
                </div>
            </Dialog>
        );
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        isPreviewLoading: selectIsLoading(state),
        highchartsWidget: selectHighchartsWidget(state),
    };
};

DialogManager.registerDialog(DIALOG_CHART_SETTINGS, connect(mapStateToProps)(DialogSettings));
