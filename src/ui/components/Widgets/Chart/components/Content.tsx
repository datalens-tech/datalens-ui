import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import type {ChartInitialParams} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {showToast} from 'ui/store/actions/toaster';
import {setSkipReload} from 'ui/units/dash/store/actions/dashTyped';
import {getRenderMarkdownFn} from 'ui/utils';

import {getRandomCKId} from '../../../../libs/DatalensChartkit/ChartKit/helpers/getRandomCKId';
import {DatalensChartkitContent} from '../../../../libs/DatalensChartkit/components/ChartKitBase/components/Chart/Chart';
import Loader from '../../../../libs/DatalensChartkit/components/ChartKitBase/components/Loader/Loader';
import type {Props as DrillProps} from '../../../../libs/DatalensChartkit/components/Drill/Drill';
import Drill from '../../../../libs/DatalensChartkit/components/Drill/Drill';
import {SideMarkdown} from '../../../../libs/DatalensChartkit/components/SideMarkdown/SideMarkdown';
import ExtensionsManager from '../../../../libs/DatalensChartkit/modules/extensions-manager/extensions-manager';
import type {ControlsOnlyWidget, DrillDownConfig} from '../../../../libs/DatalensChartkit/types';
import type {ChartContentProps, ChartControlsType} from '../types';

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
        paneSplitOrientation,
        widgetDashState,
        rootNodeRef,
        runAction,
        backgroundColor,
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

    const onAction = React.useCallback(async (actionArgs: {data?: any} = {}) => {
        const {action, ...args} = actionArgs.data || {};

        switch (action) {
            case 'toast': {
                const renderMarkdown = await getRenderMarkdownFn();
                dispatch(
                    showToast({
                        title: args?.title,
                        type: args?.type,
                        content: (
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: renderMarkdown(String(args.content ?? '')),
                                }}
                            />
                        ),
                    }),
                );
                break;
            }
            case 'setPatams': {
                if (onChange) {
                    onChange(
                        {type: 'PARAMS_CHANGED', data: {params: args}},
                        {forceUpdate: true},
                        true,
                    );
                }

                break;
            }
        }
    }, []);

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
                onFullscreenClick={onFullscreenClick}
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
                        runAction={runAction}
                        onAction={onAction}
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
                    paneSplitOrientation={paneSplitOrientation}
                    widgetDashState={widgetDashState}
                    rootNodeRef={rootNodeRef}
                    backgroundColor={backgroundColor}
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
