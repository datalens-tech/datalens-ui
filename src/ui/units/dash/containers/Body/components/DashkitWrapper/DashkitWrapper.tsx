import React from 'react';

import type {
    ConfigItem,
    ConfigLayout,
    DashKitGroup,
    DashKitProps,
    ItemDropProps,
} from '@gravity-ui/dashkit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTab, DashTabLayout} from 'shared';
import {FOCUSED_WIDGET_PARAM_NAME, Feature} from 'shared';
import {showToast} from 'ui/store/actions/toaster';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {getConfiguredDashKit} from '../../../../../../components/DashKit/DashKit';
import {
    FIXED_GROUP_CONTAINER_ID,
    FIXED_GROUP_HEADER_ID,
} from '../../../../../../components/DashKit/constants';
import {WidgetContextProvider} from '../../../../../../components/DashKit/context/WidgetContext';
import {DL} from '../../../../../../constants';
import {TYPES_TO_DIALOGS_MAP} from '../../../../../../utils/getActionPanelItems';
import {EmptyState} from '../../../../components/EmptyState/EmptyState';
import type {CopiedConfigData} from '../../../../modules/helpers';
import {
    setCurrentTabData,
    setWidgetCurrentTab,
    toggleTableOfContent,
    updateTabsWithGlobalState,
} from '../../../../store/actions/dashTyped';
import type {SetWidgetCurrentTabArgs, TabsHashStates} from '../../../../store/actions/dashTyped';
import {openDialog, openItemDialogAndSetData} from '../../../../store/actions/dialogs/actions';
import {
    canEdit as selectCanEdit,
    selectDashDescription,
    selectDashShowOpenedDescription,
    selectEntryId,
    hasTableOfContent as selectHasTableOfContent,
    selectSettings,
    selectSkipReload,
    selectTabs,
} from '../../../../store/selectors/dashTypedSelectors';
import type {UpdateTabsWithGlobalStateArgs} from '../../../../store/typings/dash';
import {FixedHeaderWrapper} from '../../../FixedHeader/FixedHeader';
import {FloatingMobileMenuWithContext, RefsContextProvider} from '../../context';

import {useConfig} from './hooks/useConfig';
import {useDashKitContext} from './hooks/useDashKitContext';
import {useDashkitRef} from './hooks/useDashkitRef';
import {useDataProviderContext} from './hooks/useDataProviderContext';
import {useHashStates} from './hooks/useHashStates';
import {useOverlay} from './hooks/useOverlay';
import {usePreparedCopyItemOptions} from './hooks/usePreparedCopyItemOptions';
import type {GetPreparedCopyItemOptions} from './hooks/usePreparedCopyItemOptions';

const b = block('dash-body');

const isMobileFixedHeaderEnabled = isEnabledFeature(Feature.EnableMobileFixedHeader);

type DashkitWrapperProps = {
    dashEl: HTMLDivElement | null;
    dashkitSettings: DashKitProps['settings'];
    disableHashNavigation?: boolean;
    disableUrlState?: boolean;
    globalParams: DashKitProps['globalParams'];
    groupsRenderers: DashKitGroup[];
    handleEditClick?: () => void;
    hasFixedHeaderContainerElements: boolean;
    hasFixedHeaderControlsElements: boolean;
    hideErrorDetails?: boolean;
    isEditMode: boolean;
    isEditModeLoading?: boolean;
    isFixedHeaderCollapsed: boolean;
    isGlobalDragging: boolean;
    isPublicMode?: boolean;
    isSplitPaneLayout?: boolean;
    onlyView?: boolean;
    getGroupsInsertCoords: (forSingleInsert?: boolean) => Record<string, {x: number; y: number}>;
    getWidgetLayoutById: (widgetId: string) => DashTabLayout;
    onItemMountChange: (item: ConfigItem, data: {isMounted: boolean}) => void;
    onItemRender: (item: ConfigItem) => void;
    onWidgetMountChange: (isMounted: boolean, id: string, domElement: HTMLElement) => void;
    onPasteItem?: (data: CopiedConfigData, newLayout?: ConfigLayout[]) => void;
};

export const DashkitWrapper: React.FC<DashkitWrapperProps> = (props) => {
    const {
        dashEl,
        dashkitSettings,
        disableHashNavigation,
        disableUrlState,
        globalParams,
        groupsRenderers,
        handleEditClick,
        hasFixedHeaderContainerElements,
        hasFixedHeaderControlsElements,
        hideErrorDetails,
        isEditMode,
        isEditModeLoading,
        isFixedHeaderCollapsed,
        isGlobalDragging,
        isPublicMode,
        isSplitPaneLayout,
        onlyView,
        getGroupsInsertCoords,
        getWidgetLayoutById,
        onItemMountChange,
        onItemRender,
        onWidgetMountChange,
        onPasteItem,
    } = props;

    const dispatch = useDispatch();

    const entryId = useSelector(selectEntryId);
    const settings = useSelector(selectSettings);
    const skipReload = useSelector(selectSkipReload);
    const dashDescription = useSelector(selectDashDescription);
    const showOpenedDescription = useSelector(selectDashShowOpenedDescription);
    const hasTableOfContent = useSelector(selectHasTableOfContent);
    const canEdit = useSelector(selectCanEdit);
    const tabs = useSelector(selectTabs);

    const [fixedHeaderControlsEl, setFixedHeaderControlsEl] = React.useState<HTMLDivElement | null>(
        null,
    );
    const [fixedHeaderContainerEl, setFixedHeaderContainerEl] =
        React.useState<HTMLDivElement | null>(null);

    const dashKitRef = useDashkitRef();
    const tabDataConfig = useConfig();
    const context = useDashKitContext({isFixedHeaderCollapsed, isPublicMode});
    const {dataProviderContextGetter} = useDataProviderContext();
    const {hashStates, onStateChange} = useHashStates({disableUrlState});
    const {getPreparedCopyItemOptionsFn} = usePreparedCopyItemOptions();

    const onDropElement = React.useCallback(
        (dropProps: ItemDropProps) => {
            if (onlyView) {
                return;
            }

            if (dropProps.dragProps.extra) {
                onPasteItem?.(
                    {
                        ...dropProps.dragProps.extra,
                        layout: dropProps.itemLayout,
                    },
                    dropProps.newLayout,
                );
                dropProps.commit();
            } else {
                dispatch(
                    openDialog(
                        TYPES_TO_DIALOGS_MAP[
                            dropProps?.dragProps?.type as keyof typeof TYPES_TO_DIALOGS_MAP
                        ],
                        dropProps,
                    ),
                );
            }
        },
        [onlyView, dispatch, onPasteItem],
    );

    const onItemCopy = React.useCallback(
        (error: null | Error) => {
            if (error === null) {
                dispatch(
                    showToast({
                        name: 'successCopyElement',
                        type: 'success',
                        title: i18n('component.entry-context-menu.view', 'value_copy-success'),
                    }),
                );
            }
        },
        [dispatch],
    );

    const onItemEdit = React.useCallback(
        (data: ConfigItem) => {
            dispatch(openItemDialogAndSetData(data));
        },
        [dispatch],
    );

    const onChange = React.useCallback(
        ({
            config,
            itemsStateAndParams,
        }: {
            config: DashKitProps['config'];
            itemsStateAndParams: DashKitProps['itemsStateAndParams'];
        }) => {
            if (
                hashStates !== itemsStateAndParams &&
                itemsStateAndParams &&
                Object.keys(itemsStateAndParams).length
            ) {
                onStateChange(itemsStateAndParams as TabsHashStates, config as unknown as DashTab);
            } else if (config) {
                dispatch(setCurrentTabData(config as unknown as DashTab));
            }
        },
        [dispatch, hashStates, onStateChange],
    );

    const handleSetWidgetCurrentTab = React.useCallback(
        (args: SetWidgetCurrentTabArgs) => {
            dispatch(setWidgetCurrentTab(args));
        },
        [dispatch],
    );

    const handleUpdateTabsWithGlobalState = React.useCallback(
        (args: UpdateTabsWithGlobalStateArgs) => {
            dispatch(updateTabsWithGlobalState(args));
        },
        [dispatch],
    );

    const handleToggleTableOfContent = React.useCallback(
        (expanded?: boolean) => {
            dispatch(toggleTableOfContent(expanded));
        },
        [dispatch],
    );

    const {controls: overlayControls, menu: overlayMenuItems} = useOverlay({
        dashKitRef,
        groupsRenderers,
        hashStates,
        tabDataConfig,
        getGroupsInsertCoords,
        getWidgetLayoutById,
        onChange,
    });

    const fixedHeaderCollapsed = context.fixedHeaderCollapsed || false;

    const isEmptyTab = !tabDataConfig?.items.length && !tabDataConfig?.globalItems?.length;

    const DashKit = getConfiguredDashKit(undefined, {
        disableHashNavigation,
        scope: 'dash',
    });

    const fixedHeaderHasNoVisibleContent =
        !hasFixedHeaderControlsElements &&
        (!hasFixedHeaderContainerElements || fixedHeaderCollapsed);

    if (isEmptyTab && !isGlobalDragging) {
        return (
            <EmptyState
                canEdit={canEdit}
                isEditMode={isEditMode}
                isTabView={!settings.hideTabs && tabs.length > 1}
                onEditClick={handleEditClick}
                isEditModeLoading={isEditModeLoading}
            />
        );
    }

    const shouldRenderMobileMenu = DL.IS_MOBILE && isMobileFixedHeaderEnabled;
    const searchParams = new URLSearchParams(location.search);
    const focusedWidget = searchParams.get(FOCUSED_WIDGET_PARAM_NAME);
    const focusedWidgetParent = focusedWidget
        ? tabDataConfig?.layout?.find((item) => item.i === focusedWidget)?.parent
        : undefined;
    const isFixedHeaderWidgetFocused = Boolean(
        focusedWidgetParent &&
            [FIXED_GROUP_HEADER_ID, FIXED_GROUP_CONTAINER_ID].includes(focusedWidgetParent),
    );
    const mobileFixedHeaderInitiallyOpened = shouldRenderMobileMenu && isFixedHeaderWidgetFocused;

    return (
        <RefsContextProvider
            fixedHeaderControlsEl={fixedHeaderControlsEl}
            fixedHeaderContainerEl={fixedHeaderContainerEl}
            dashEl={dashEl}
        >
            <WidgetContextProvider onWidgetMountChange={onWidgetMountChange}>
                {shouldRenderMobileMenu && entryId && (
                    <FloatingMobileMenuWithContext
                        entryId={entryId}
                        hasFixedContent={
                            hasFixedHeaderContainerElements || hasFixedHeaderControlsElements
                        }
                        dashDescription={dashDescription}
                        showOpenedDescription={showOpenedDescription || false}
                        hasTableOfContent={hasTableOfContent}
                        toggleTableOfContent={handleToggleTableOfContent}
                        fixedContentInitiallyOpened={mobileFixedHeaderInitiallyOpened}
                        fixedContentWidgetFocused={isFixedHeaderWidgetFocused}
                        fixedHeaderControlsRef={setFixedHeaderControlsEl}
                        fixedHeaderContainerRef={setFixedHeaderContainerEl}
                    />
                )}

                {!DL.IS_MOBILE && (
                    <FixedHeaderWrapper
                        className={b('fixed-header', {
                            'no-content': fixedHeaderHasNoVisibleContent,
                        })}
                        dashBodyEl={dashEl}
                        controlsRef={setFixedHeaderControlsEl}
                        containerRef={setFixedHeaderContainerEl}
                        isCollapsed={fixedHeaderCollapsed || false}
                        editMode={isEditMode}
                        isControlsGroupEmpty={!hasFixedHeaderControlsElements}
                        isContainerGroupEmpty={!hasFixedHeaderContainerElements}
                        isSplitPaneContainer={isSplitPaneLayout}
                    />
                )}
                <DashKit
                    ref={dashKitRef}
                    config={tabDataConfig as DashKitProps['config']}
                    editMode={isEditMode}
                    focusable={true}
                    onDrop={onDropElement}
                    itemsStateAndParams={hashStates}
                    groups={groupsRenderers}
                    context={context}
                    getPreparedCopyItemOptions={
                        getPreparedCopyItemOptionsFn as GetPreparedCopyItemOptions<{}>
                    }
                    onCopyFulfill={onItemCopy}
                    onItemEdit={onItemEdit}
                    onChange={onChange}
                    settings={dashkitSettings}
                    defaultGlobalParams={settings.globalParams}
                    globalParams={globalParams}
                    overlayControls={overlayControls}
                    overlayMenuItems={overlayMenuItems}
                    skipReload={skipReload}
                    onItemMountChange={onItemMountChange}
                    onItemRender={onItemRender}
                    hideErrorDetails={hideErrorDetails}
                    setWidgetCurrentTab={handleSetWidgetCurrentTab}
                    updateTabsWithGlobalState={handleUpdateTabsWithGlobalState}
                    dataProviderContextGetter={dataProviderContextGetter}
                />
            </WidgetContextProvider>
        </RefsContextProvider>
    );
};
