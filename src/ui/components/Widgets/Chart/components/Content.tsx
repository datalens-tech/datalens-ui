import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {setSkipReload} from 'ui/units/dash/store/actions/dashTyped';

import {getRandomCKId} from '../../../../libs/DatalensChartkit/ChartKit/helpers/getRandomCKId';
import {DatalensChartkitContent} from '../../../../libs/DatalensChartkit/components/ChartKitBase/components/Chart/Chart';
import Loader from '../../../../libs/DatalensChartkit/components/ChartKitBase/components/Loader/Loader';
import Drill, {Props as DrillProps} from '../../../../libs/DatalensChartkit/components/Drill/Drill';
import {SideMarkdown} from '../../../../libs/DatalensChartkit/components/SideMarkdown/SideMarkdown';
import ExtensionsManager from '../../../../libs/DatalensChartkit/modules/extensions-manager/extensions-manager';
import {ControlsOnlyWidget, DrillDownConfig} from '../../../../libs/DatalensChartkit/types';
import {ChartContentProps, ChartControlsType} from '../types';

import {Header as ChartHeader} from './Header';

import '../ChartWidget.scss';

const b = block('dl-widget');

const Control = ExtensionsManager.getWithWrapper(
    'control',
) as React.ComponentType<ChartControlsType>;

export const Content = (props: ChartContentProps) => {
    const {
        hasHiddenClassMod,
        showLoader,
        veil,
        loaderDelay,
        widgetBodyClassName,
        forwardedRef,
        noControls,
        nonBodyScroll,
        transformLoadedData,
        splitTooltip,
        compactLoader,
        chartId,
        requestId,
        error,
        onRender,
        onChange,
        onError,
        onRetry,
        loadedData,
        getControls,
        drillDownFilters,
        drillDownLevel,
        widgetType,
        menuType,
        customMenuOptions,
        menuChartkitConfig,
        dataProps,
        yandexMapAPIWaiting,
        widgetDataRef,
        widgetRenderTimeRef,
        onFullscreenClick,
        showOverlayWithControlsOnEdit,
        dataProvider,
        isWidgetMenuDataChanged,
        renderPluginLoader,
        enableActionParams,
    } = props;

    const [isExportLoading, setIsExportLoading] = React.useState(false);
    const dispatch = useDispatch();

    const handleExportLoading = React.useCallback(
        (isLoading: boolean) => {
            setIsExportLoading(isLoading);
            dispatch(setSkipReload(isLoading));
        },
        [dispatch],
    );

    const id = React.useMemo(() => getRandomCKId(), []);
    const hasControl = Boolean((loadedData as ControlsOnlyWidget)?.controls?.controls?.length);

    const showControls =
        !noControls &&
        (loadedData as ControlsOnlyWidget)?.controls &&
        ExtensionsManager.has('control');

    const drillDownData = loadedData?.config?.drillDown as DrillDownConfig;
    const chartsInsightsData = loadedData?.chartsInsightsData;

    const sideMarkdownData = loadedData?.sideMarkdown || '';

    const showChartOverlay = Boolean(showOverlayWithControlsOnEdit && onFullscreenClick);

    const initialParams = {
        params: props.initialParams || {},
    } as ChartInitialParams;

    const showContentLoader = showLoader || isExportLoading;
    const showLoaderVeil = veil && !isExportLoading;

    return (
        <div className={b('container', {[String(widgetType)]: Boolean(widgetType)})}>
            <Loader
                visible={showContentLoader}
                compact={compactLoader}
                veil={showLoaderVeil}
                delay={loaderDelay}
            />
            <ChartHeader
                dataProvider={dataProvider}
                chartsInsightsData={chartsInsightsData}
                menuType={menuType}
                customMenuOptions={customMenuOptions}
                menuChartkitConfig={menuChartkitConfig}
                isMenuAvailable={!noControls}
                error={error}
                dataProps={dataProps}
                requestId={requestId}
                loadedData={loadedData}
                widgetDataRef={widgetDataRef}
                widgetRenderTimeRef={widgetRenderTimeRef}
                yandexMapAPIWaiting={yandexMapAPIWaiting}
                onChange={onChange}
                isWidgetMenuDataChanged={isWidgetMenuDataChanged}
                onExportLoading={handleExportLoading}
                enableActionParams={enableActionParams}
            />
            <div
                className={b(
                    'body',
                    {hidden: hasHiddenClassMod, [String(widgetType)]: Boolean(widgetType)},
                    widgetBodyClassName,
                )}
                data-qa={chartId ? `chartkit-body-entry-${chartId}` : null}
            >
                {Boolean(showControls && hasControl && getControls) && (
                    <Control
                        id={id}
                        data={loadedData}
                        onLoad={onRender}
                        onError={onError}
                        onChange={onChange}
                        getControls={getControls}
                        nonBodyScroll={nonBodyScroll}
                        initialParams={initialParams}
                    />
                )}
                {Boolean(drillDownData) && (
                    <Drill
                        onChange={onChange as DrillProps['onChange']}
                        breadcrumbs={drillDownData.breadcrumbs}
                        filters={drillDownFilters}
                        level={drillDownLevel}
                    />
                )}
                {Boolean(sideMarkdownData) && <SideMarkdown data={sideMarkdownData} />}
                <DatalensChartkitContent
                    noControls={noControls}
                    transformLoadedData={transformLoadedData}
                    splitTooltip={splitTooltip}
                    nonBodyScroll={nonBodyScroll}
                    requestId={requestId}
                    error={error}
                    onLoad={onRender}
                    onChange={onChange}
                    onError={onError}
                    onRetry={onRetry}
                    loadedData={loadedData}
                    forwardedRef={forwardedRef}
                    renderPluginLoader={renderPluginLoader}
                />
                {showChartOverlay && (
                    <div
                        className={b('overlay')}
                        onClick={onFullscreenClick}
                        data-qa="chart-widget-overlay"
                    />
                )}
            </div>
        </div>
    );
};
