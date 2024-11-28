import React from 'react';

import block from 'bem-cn-lite';
import get from 'lodash/get';
import {useSelector} from 'react-redux';
import type {StringParams} from 'shared';
import {ChartInfoIcon} from 'ui/components/Widgets/Chart/components/ChartInfoIcon';
import type {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import type {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';
import {selectWorkbookEditPermission} from 'ui/units/workbooks/store/selectors';

import {
    drawComments,
    hideComments,
} from '../../../../libs/DatalensChartkit/ChartKit/modules/comments/drawing';
import {
    ChartsInsights,
    MenuWithErrorBoundary,
} from '../../../../libs/DatalensChartkit/components/ChartKitBase/components/Header/components';
import type {ChartsProps} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {getChartkitMenu} from '../../../../libs/DatalensChartkit/modules/menu/menu';
import settings from '../../../../libs/DatalensChartkit/modules/settings/settings';
import type {ChartsInsightsData, GraphWidget} from '../../../../libs/DatalensChartkit/types';
import {registry} from '../../../../registry';
import type {ChartContentProps} from '../types';

import '../ChartWidget.scss';

export type HeaderProps = Pick<
    ChartContentProps,
    | 'menuType'
    | 'customMenuOptions'
    | 'menuChartkitConfig'
    | 'error'
    | 'dataProps'
    | 'requestId'
    | 'loadedData'
    | 'widgetDataRef'
    | 'widgetRenderTimeRef'
    | 'yandexMapAPIWaiting'
    | 'onChange'
    | 'dataProvider'
    | 'enableActionParams'
> & {
    chartsInsightsData?: ChartsInsightsData;
    isMenuAvailable: boolean;
    isWidgetMenuDataChanged?: boolean;
    onExportLoading: (isLoading: boolean) => void;
    onFullscreenClick?: () => void;
};

const b = block('dl-widget');

export const Header = (props: HeaderProps) => {
    const {
        isMenuAvailable,
        chartsInsightsData,
        menuType,
        customMenuOptions,
        menuChartkitConfig,
        error,
        dataProps,
        requestId,
        loadedData,
        widgetDataRef,
        widgetRenderTimeRef,
        yandexMapAPIWaiting,
        dataProvider,
        onChange,
        isWidgetMenuDataChanged,
        onExportLoading,
        onFullscreenClick,
        enableActionParams,
    } = props;

    /**
     * extra prop for rerender chart to actualize show/hide comments menu after add/remove comments
     * because it doesn't trigger any callbacks (and it should not trigger it)
     * but we need to toggle show/hide comments menu
     */
    const [commentsLength, setCommentsLength] = React.useState(null);

    const isEditAvaible = useSelector(selectWorkbookEditPermission);

    const handleCommentsChanged = React.useCallback((length) => {
        setCommentsLength(length);
    }, []);

    /**
     * extra prop for rerender chart after show/hide comments menu
     * because it doesn't trigger any callbacks (and it should not trigger it)
     * but we need to toggle show/hide comments menu
     */
    const hideChartComments = Boolean((loadedData?.config as GraphWidget['config'])?.hideComments);

    const canBeShownMenu = isMenuAvailable && widgetDataRef;

    const configMenu = menuType
        ? getChartkitMenu({
              type: menuType,
              customOptions: customMenuOptions as GetChartkitMenuByType['customOptions'],
              config: menuChartkitConfig?.config,
              chartsDataProvider: (menuChartkitConfig?.chartsDataProvider ||
                  dataProvider) as ChartKitDataProvider,
              onExportLoading,
              onFullscreenClick,
              isEditAvaible,
              extraOptions: {enableActionParams},
              widgetConfig: loadedData?.widgetConfig,
          })
        : settings.menu;

    const {ChartActionPanelButton} = registry.chart.components.getAll();
    const chartData = (dataProps ? dataProps : {}) as unknown as ChartsProps & {
        params: StringParams;
    };
    const safeChartWarning = get(loadedData, 'safeChartInfo');

    return (
        <div className={b('chart-header')}>
            {safeChartWarning && <ChartInfoIcon msg={safeChartWarning} />}
            {chartsInsightsData && (
                <ChartsInsights
                    items={chartsInsightsData.items}
                    messagesByLocator={chartsInsightsData.messagesByLocator}
                    locators={chartsInsightsData.locators}
                />
            )}
            <ChartActionPanelButton
                menuType={menuType}
                loadedData={loadedData}
                widgetDataRef={widgetDataRef}
                chartData={chartData}
            />
            {canBeShownMenu && (
                <MenuWithErrorBoundary
                    commentsLength={commentsLength}
                    hideChartComments={hideChartComments}
                    configMenu={configMenu}
                    widgetDataRef={widgetDataRef}
                    loadedData={loadedData}
                    error={error}
                    propsData={chartData}
                    requestId={requestId}
                    widgetRenderTimeRef={widgetRenderTimeRef}
                    yandexMapAPIWaiting={yandexMapAPIWaiting}
                    callbackOnCommentsChanged={handleCommentsChanged}
                    hideComments={hideComments}
                    drawComments={drawComments}
                    onChange={onChange}
                    /* isWidgetMenuDataChanged - need this flag for extra rerender after widget rendered to check visibility of items (it is not used in component directly) */
                    isWidgetMenuDataChanged={isWidgetMenuDataChanged}
                    chartsDataProvider={dataProvider}
                />
            )}
        </div>
    );
};
