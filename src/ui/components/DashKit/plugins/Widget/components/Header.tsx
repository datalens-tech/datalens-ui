import React from 'react';

import {AdaptiveTabs, SharePopover, TabItem} from '@gravity-ui/components';
import {ArrowLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DRAGGABLE_HANDLE_CLASS_NAME} from 'ui/components/Widgets/Chart/helpers/helpers';
import {DL} from 'ui/constants/common';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {socialNets} from 'ui/units/dash/modules/constants';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';

import DebugInfoTool from '../../DebugInfoTool/DebugInfoTool';
import {CurrentTab} from '../types';

import {DASH_WIDGET_CLASSNAME} from './helpers';

import '../Widget.scss';

type HeaderProps = {
    widgetId: string;
    isFullscreen: boolean;
    onFullscreenClick: () => void;
    editMode: boolean;
    hideTabs: boolean;
    withShareWidget: boolean;
    tabsItems: Array<TabItem<{}>>;
    currentTab: CurrentTab;
    onSelectTab: (param: string) => void;
    hideDebugTool?: boolean;
};

const b = block(DASH_WIDGET_CLASSNAME);

export const Header = (props: HeaderProps) => {
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
    } = props;

    const size = isMobileView ? MOBILE_SIZE.TABS : 'm';

    const renderTabs = () => (
        <div className={b('tabs', {'edit-mode': editMode}, DRAGGABLE_HANDLE_CLASS_NAME)}>
            {!hideTabs && (
                <AdaptiveTabs
                    size={size}
                    items={tabsItems}
                    activeTab={currentTab.id}
                    onSelectTab={onSelectTab}
                    breakpointsConfig={DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG}
                    wrapTo={(tab, node) => {
                        const isActive = tab?.id === currentTab.id;

                        return (
                            <div className={b('tab', {active: isActive})}>
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
            <div className={b('header', {mobile: isMobileView})}>
                {isFullscreen && (
                    <span
                        className={b('back-icon')}
                        onClick={onFullscreenClick}
                        data-qa="chart-widget-back-icon"
                    >
                        <Icon data={ArrowLeft} />
                    </span>
                )}
                {isFullscreen ? <div className={b('title')}>{currentTab.title}</div> : renderTabs()}
                {withShareWidget && (
                    <div className={b('share-widget')}>
                        <SharePopover
                            useWebShareApi={DL.IS_MOBILE}
                            url={window.location.href}
                            title={currentTab.title}
                            text={currentTab.title}
                            shareOptions={socialNets}
                        />
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
