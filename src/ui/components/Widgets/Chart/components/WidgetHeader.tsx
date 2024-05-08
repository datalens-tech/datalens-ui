import React from 'react';

import {AdaptiveTabs, SharePopover} from '@gravity-ui/components';
import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DebugInfoTool from 'components/DashKit/plugins/DebugInfoTool/DebugInfoTool';
import {CurrentTab} from 'components/DashKit/plugins/Widget/types';
import {ChartkitMenuDialogsQA, ControlQA} from 'shared';
import {DL} from 'ui/constants/common';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {socialNets} from 'ui/units/dash/modules/constants';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {DRAGGABLE_HANDLE_CLASS_NAME} from '../helpers/helpers';

import iconClearActionParams from '../../../../assets/icons/funnel-clear.svg';

import './WidgetHeader.scss';

type TabItem = {
    id: string;
    title: string;
    disabled?: boolean;
};

type HeaderProps = {
    widgetId: string;
    isFullscreen: boolean;
    onFullscreenClick: () => void;
    editMode: boolean;
    hideTabs: boolean;
    withShareWidget: boolean;
    tabsItems?: Array<TabItem>;
    currentTab?: CurrentTab;
    onSelectTab?: (param: string) => void;
    hideDebugTool?: boolean;
    showActionParamsFilter?: boolean;
    onFiltersClear?: () => void;
    title?: string;
};

const b = block('widget-header');

export const WidgetHeader = (props: HeaderProps) => {
    const {
        widgetId,
        isFullscreen,
        onFullscreenClick,
        editMode,
        hideTabs,
        withShareWidget,
        tabsItems,
        currentTab,
        onSelectTab,
        hideDebugTool,
        showActionParamsFilter,
        onFiltersClear,
        title,
    } = props;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'm';

    const showTabs = !hideTabs && tabsItems && currentTab && onSelectTab;

    const widgetTitle = currentTab?.title || title;
    const showFiltersClear = showActionParamsFilter && onFiltersClear;

    const renderTabs = () => (
        <div className={b('tabs', {'edit-mode': editMode}, DRAGGABLE_HANDLE_CLASS_NAME)}>
            {showTabs && (
                <AdaptiveTabs
                    size={size}
                    items={tabsItems}
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
            )}
        </div>
    );

    return (
        <React.Fragment>
            {!hideDebugTool && <DebugInfoTool label="id" value={widgetId} modType="outer" />}
            <div
                className={b({
                    mobile: DL.IS_MOBILE,
                    fullscreen: isFullscreen,
                    'with-shares': withShareWidget,
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
                {isFullscreen ? <div className={b('title')}>{widgetTitle}</div> : renderTabs()}
                {withShareWidget && (
                    <div className={b('share-widget')}>
                        <SharePopover
                            useWebShareApi={DL.IS_MOBILE}
                            url={window.location.href}
                            title={widgetTitle}
                            text={widgetTitle}
                            shareOptions={socialNets}
                        />
                    </div>
                )}
                {showFiltersClear && (
                    <div className={b('filters-controls')}>
                        <Button qa={ControlQA.filtersClear} onClick={onFiltersClear}>
                            <Icon
                                data={iconClearActionParams}
                                size={16}
                                className={b('icon-filter-clear')}
                            />
                        </Button>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
