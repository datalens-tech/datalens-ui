import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {ArrowLeft} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import DebugInfoTool from 'components/DashKit/plugins/DebugInfoTool/DebugInfoTool';
import type {CurrentTab} from 'components/DashKit/plugins/Widget/types';
import {ChartkitMenuDialogsQA, ControlQA} from 'shared';
import {DL} from 'ui/constants/common';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {MarkdownHelpPopover} from '../../../MarkdownHelpPopover/MarkdownHelpPopover';
import {DRAGGABLE_HANDLE_CLASS_NAME} from '../helpers/helpers';

import iconClearActionParams from '../../../../assets/icons/funnel-clear.svg';

import './WidgetHeader.scss';

type TabItem = {
    id: string;
    title: string;
    displayedTitle: React.ReactNode;
    hint?: string;
    disabled?: boolean;
};

type HeaderProps = {
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
};

const b = block('widget-header');

export const WidgetHeader = (props: HeaderProps) => {
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
    } = props;

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'm';

    const widgetTitle = currentTab?.title || title;
    const widgetTitleHint =
        currentTab?.enableHint && currentTab?.hint?.trim() ? currentTab?.hint?.trim() : '';
    const showFiltersClear = showActionParamsFilter && onFiltersClear;

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
                            buttonProps={{
                                className: b('chart-title-hint-button'),
                            }}
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
            {!hideDebugTool && <DebugInfoTool label="id" value={widgetId} modType="outer" />}
            <div
                className={b({
                    mobile: DL.IS_MOBILE,
                    fullscreen: isFullscreen,
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
                {showFiltersClear && (
                    <div className={b('icons')}>
                        <div className={b('filters-controls')}>
                            <Button qa={ControlQA.filtersClear} onClick={onFiltersClear}>
                                <Icon
                                    data={iconClearActionParams}
                                    size={16}
                                    className={b('icon-filter-clear')}
                                />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </React.Fragment>
    );
};
