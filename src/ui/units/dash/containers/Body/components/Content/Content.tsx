import React from 'react';

import type {ConfigLayout} from '@gravity-ui/dashkit';
import {DashKitDnDWrapper, ActionPanel as DashkitActionPanel} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {
    DashBodyQa,
    DashEntryQa,
    DashTabItemType,
    EntryScope,
    Feature,
    LOADED_DASH_CLASS,
} from 'shared';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';
import {selectUserSettings} from 'ui/store/selectors/user';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {getIsAsideHeaderEnabled} from '../../../../../../components/AsideHeaderAdapter';
import {DL} from '../../../../../../constants';
import Utils from '../../../../../../utils';
import {getActionPanelItems} from '../../../../../../utils/getActionPanelItems';
import Loader from '../../../../components/Loader/Loader';
import {Mode} from '../../../../modules/constants';
import type {CopiedConfigData} from '../../../../modules/helpers';
import {memoizedGetLocalTabs} from '../../../../modules/helpers';
import {openDialog} from '../../../../store/actions/dialogs/actions';
import {
    selectDashError,
    selectSettings,
    selectShowTableOfContent,
    selectTabs,
} from '../../../../store/selectors/dashTypedSelectors';
import {DashError} from '../../../DashError/DashError';
import TableOfContent from '../../../TableOfContent/TableOfContent';
import {Tabs} from '../../../Tabs/Tabs';

const b = block('dash-body');

const isMobileFixedHeaderEnabled = isEnabledFeature(Feature.EnableMobileFixedHeader);

export type Props = {
    copiedData: CopiedConfigData | null;
    dashEntryKey?: string;
    disableHashNavigation?: boolean;
    hideErrorDetails?: boolean;
    isCondensed: boolean;
    loaded: boolean;
    mode: Mode;
    showEditActionPanel: boolean;
    renderDashkit: () => void;
    onDragEnd: () => void;
    onDragStart: () => void;
    onItemClick: (itemTitle: string) => void;
    onRetry: () => void;
} & (
    | {onlyView: true}
    | {
          onlyView?: boolean;
          onPasteItem: (data: CopiedConfigData, newLayout?: ConfigLayout[]) => void;
      }
);

const Content = ({
    copiedData,
    dashEntryKey,
    disableHashNavigation,
    hideErrorDetails,
    isCondensed,
    loaded,
    mode,
    showEditActionPanel,
    renderDashkit,
    onDragEnd,
    onDragStart,
    onItemClick,
    onRetry,
    ...restProps
}: Props) => {
    const dispatch = useDispatch();

    const error = useSelector(selectDashError);
    const isSidebarOpened = !useSelector(selectAsideHeaderIsCompact);
    const settings = useSelector(selectSettings);
    const showTableOfContent = useSelector(selectShowTableOfContent);
    const tabs = useSelector(selectTabs);
    const userSettings = useSelector(selectUserSettings);

    const handleOpenDialog = React.useCallback<(...args: Parameters<typeof openDialog>) => void>(
        (dialogType, dragOperationProps) => {
            dispatch(openDialog(dialogType, dragOperationProps));
        },
        [dispatch],
    );

    switch (mode) {
        case Mode.Loading:
        case Mode.Updating:
            return <Loader size="l" />;
        case Mode.Error:
            return <DashError error={error} hideDetails={hideErrorDetails} onRetry={onRetry} />;
    }

    const localTabs = memoizedGetLocalTabs(tabs);

    const hasTableOfContentForTab = !(localTabs.length === 1 && !localTabs[0].items.length);

    const loadedMixin = loaded ? LOADED_DASH_CLASS : undefined;

    const hideDashTitle = settings.hideDashTitle || (DL.IS_MOBILE && !isMobileFixedHeaderEnabled);

    return (
        <DashKitDnDWrapper onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div
                data-qa={DashBodyQa.ContentWrapper}
                className={b('content-wrapper', {mobile: DL.IS_MOBILE, mode}, loadedMixin)}
            >
                <div
                    className={b('content-container', {
                        mobile: DL.IS_MOBILE,
                        'no-title':
                            settings.hideDashTitle && (settings.hideTabs || tabs.length === 1),
                        'no-title-with-tabs':
                            settings.hideDashTitle && !settings.hideTabs && tabs.length > 1,
                    })}
                >
                    <TableOfContent
                        disableHashNavigation={disableHashNavigation}
                        onItemClick={onItemClick}
                    />
                    <div
                        className={b('content', {
                            condensed: isCondensed,
                            'with-table-of-content': showTableOfContent && hasTableOfContentForTab,
                            mobile: DL.IS_MOBILE,
                            aside: getIsAsideHeaderEnabled(),
                            'with-edit-panel': showEditActionPanel,
                            'with-footer': isEnabledFeature(Feature.EnableFooter),
                        })}
                    >
                        {!hideDashTitle && dashEntryKey && (
                            <div className={b('entry-name')} data-qa={DashEntryQa.EntryName}>
                                {Utils.getEntryNameFromKey(dashEntryKey)}
                            </div>
                        )}
                        {!settings.hideTabs && <Tabs className={b('tabs')} />}
                        {renderDashkit()}
                        {!restProps.onlyView && (
                            <DashkitActionPanel
                                toggleAnimation={true}
                                disable={!showEditActionPanel}
                                items={getActionPanelItems({
                                    copiedData,
                                    onPasteItem: restProps.onPasteItem,
                                    openDialog: handleOpenDialog,
                                    filterItem: (item) => item.id === DashTabItemType.Image,
                                    userSettings,
                                    scope: EntryScope.Dash,
                                })}
                                className={b('edit-panel', {
                                    'aside-opened': isSidebarOpened,
                                })}
                            />
                        )}
                    </div>
                </div>
            </div>
        </DashKitDnDWrapper>
    );
};

export default Content;
