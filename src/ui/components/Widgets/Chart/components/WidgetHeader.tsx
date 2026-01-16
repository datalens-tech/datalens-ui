import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {ArrowLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DebugInfoTool from 'components/DashKit/plugins/DebugInfoTool/DebugInfoTool';
import type {CurrentTab} from 'components/DashKit/plugins/Widget/types';
import {useDispatch} from 'react-redux';
import {ChartkitMenuDialogsQA} from 'shared';
import {Header as ChartHeader} from 'ui/components/Widgets/Chart/components/Header';
import {DL} from 'ui/constants/common';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {setSkipReload} from 'ui/units/dash/store/actions/dashTyped';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import type {ChartsData} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {
    CombinedError,
    ControlWidget,
    LoadedWidgetData,
    OnChangeData,
} from '../../../../libs/DatalensChartkit/types';
import {MarkdownHelpPopover} from '../../../MarkdownHelpPopover/MarkdownHelpPopover';
import {DRAGGABLE_HANDLE_CLASS_NAME} from '../helpers/helpers';
import type {ChartProviderPropsWithRefProps, ChartWidgetDataRef, DataProps} from '../types';

import './WidgetHeader.scss';

type TabItem = {
    id: string;
    title: string;
    displayedTitle: React.ReactNode;
    hint?: string;
    disabled?: boolean;
};

export type HeaderProps = {
    widgetId: string;
    isFullscreen: boolean;
    onFullscreenClick: () => void;
    editMode: boolean;
    hideTitle?: boolean;
    tabsItems?: Array<TabItem>;
    currentTab?: CurrentTab;
    onSelectTab?: (param: string) => void;
    hideDebugTool?: boolean;
    showActionParamsFilter?: boolean;
    onFiltersClear?: () => void;
    title?: string;
    noControls?: boolean;
    setIsExportLoading?: (arg: boolean) => void;
    extraMod?: string;
};

export type HeaderWithControlsProps = HeaderProps &
    Pick<
        ChartProviderPropsWithRefProps,
        'compactLoader' | 'loaderDelay' | 'menuType' | 'menuChartkitConfig' | 'dataProvider'
    > & {
        error: CombinedError | null;
        dataProps?: DataProps;
        requestId: ChartsData['requestId'];

        loadedData:
            | LoadedWidgetData<ChartsData>
            | (LoadedWidgetData<ChartsData> & ControlWidget & ChartsData['extra']);
        widgetDataRef: ChartWidgetDataRef;
        widgetRenderTimeRef: React.MutableRefObject<number | null>;
        yandexMapAPIWaiting?: number | null;
        enableActionParams?: boolean;
        enableAssistant?: boolean;
        isWidgetMenuDataChanged?: boolean;
        showLoader?: boolean;
        veil?: boolean;

        onChange: (
            changedData: OnChangeData,
            _state: {forceUpdate: boolean},
            callExternalOnChange?: boolean,
            callChangeByClick?: boolean,
        ) => void;

        setIsExportLoading: (arg: boolean) => void;
        reload?: (args?: {silentLoading?: boolean; noVeil?: boolean}) => void;
    };

const b = block('widget-header');

export const WidgetHeader = (props: HeaderProps | HeaderWithControlsProps) => {
    const {
        widgetId,
        isFullscreen,
        onFullscreenClick,
        editMode,
        hideTitle,
        tabsItems,
        currentTab,
        onSelectTab,
        hideDebugTool,
        showActionParamsFilter,
        onFiltersClear,
        title,
        noControls,
        setIsExportLoading,
        extraMod,
    } = props;

    const headerWithControlsProps = props as HeaderWithControlsProps;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'm';

    const widgetTitle = currentTab?.title || title;

    const widgetTitleHint =
        currentTab?.enableHint && currentTab?.hint?.trim() ? currentTab?.hint?.trim() : '';

    const dispatch = useDispatch();

    const handleExportLoading = React.useCallback(
        (isLoading: boolean) => {
            setIsExportLoading?.(isLoading);
            dispatch(setSkipReload(isLoading));
        },
        [dispatch, setIsExportLoading],
    );

    const handleClickHint = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        return false;
    }, []);

    const renderTabs = () => {
        if (DL.IS_MOBILE && (isFullscreen || (!hideTitle && tabsItems?.length === 1))) {
            return (
                <div
                    className={b('mobile-title', {
                        'with-hint': Boolean(widgetTitleHint),
                    })}
                >
                    <div className={b('mobile-title-wrap')}>{widgetTitle}</div>
                    {Boolean(widgetTitleHint) && (
                        <MarkdownHelpPopover
                            markdown={widgetTitleHint}
                            className={b('chart-title-hint')}
                            onClick={handleClickHint}
                        />
                    )}
                </div>
            );
        }

        if (hideTitle || !tabsItems || !currentTab || !onSelectTab || !widgetTitle) {
            return null;
        }

        const displayedTabItems = tabsItems.map((item) => ({
            ...item,
            title: item.displayedTitle || item.title || '',
        }));

        return (
            <div
                className={b(
                    'tabs',
                    {'edit-mode': editMode, 'no-controls': noControls},
                    DRAGGABLE_HANDLE_CLASS_NAME,
                )}
            >
                <AdaptiveTabs
                    size={size}
                    items={displayedTabItems}
                    activeTab={currentTab.id}
                    onSelectTab={onSelectTab}
                    breakpointsConfig={DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG}
                    wrapTo={(tab, node) => {
                        const isActive = tab?.id === currentTab.id;

                        return (
                            <div
                                className={b('tab', {active: isActive})}
                                data-qa={ChartkitMenuDialogsQA.widgetTab}
                            >
                                {hideDebugTool === undefined
                                    ? true
                                    : Boolean(hideDebugTool && !isActive) && (
                                          <DebugInfoTool
                                              label={'tabId'}
                                              value={tab?.id || ''}
                                              modType={'right'}
                                          />
                                      )}
                                {node}
                            </div>
                        );
                    }}
                />
            </div>
        );
    };

    return (
        <React.Fragment>
            {!hideDebugTool && <DebugInfoTool label="id" value={widgetId || ''} modType="outer" />}
            <div
                className={b({
                    mobile: DL.IS_MOBILE,
                    fullscreen: isFullscreen,
                    ...{[String(extraMod)]: Boolean(extraMod)},
                })}
            >
                {isFullscreen && (
                    <span
                        className={b('back-icon')}
                        onClick={onFullscreenClick}
                        data-qa="chart-widget-back-icon"
                    >
                        <Icon data={ArrowLeft} />
                    </span>
                )}
                {renderTabs()}
                <ChartHeader
                    dataProvider={headerWithControlsProps.dataProvider}
                    chartsInsightsData={headerWithControlsProps.loadedData?.chartsInsightsData}
                    menuType={headerWithControlsProps.menuType}
                    customMenuOptions={
                        {} as unknown as ChartProviderPropsWithRefProps['customMenuOptions']
                    }
                    menuChartkitConfig={headerWithControlsProps.menuChartkitConfig}
                    isMenuAvailable={!noControls}
                    error={headerWithControlsProps.error || null}
                    dataProps={headerWithControlsProps.dataProps}
                    requestId={headerWithControlsProps.requestId || ''}
                    chartRevIdRef={null}
                    loadedData={headerWithControlsProps.loadedData}
                    widgetDataRef={headerWithControlsProps.widgetDataRef}
                    widgetRenderTimeRef={headerWithControlsProps.widgetRenderTimeRef}
                    yandexMapAPIWaiting={headerWithControlsProps.yandexMapAPIWaiting}
                    onChange={headerWithControlsProps.onChange}
                    isWidgetMenuDataChanged={headerWithControlsProps.isWidgetMenuDataChanged}
                    onExportLoading={handleExportLoading}
                    enableActionParams={headerWithControlsProps.enableActionParams}
                    enableAssistant={headerWithControlsProps.enableAssistant}
                    onFullscreenClick={onFullscreenClick}
                    showActionParamsFilter={showActionParamsFilter}
                    onFiltersClear={onFiltersClear}
                    canBeDisplayedFilters={true}
                    reload={headerWithControlsProps.reload}
                />
            </div>
        </React.Fragment>
    );
};
