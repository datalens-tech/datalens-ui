import React from 'react';

import {DashKitDnDWrapper, ActionPanel as DashkitActionPanel} from '@gravity-ui/dashkit';
import type {
    ConfigItem,
    ConfigLayout,
    DashKit as DashKitComponent,
    DashKitProps,
    ActionPanelItem as DashkitActionPanelItem,
    ItemDropProps,
    PreparedCopyItemOptions,
} from '@gravity-ui/dashkit';
import {MenuItems} from '@gravity-ui/dashkit/helpers';
import {
    ChartColumn,
    Code,
    CopyPlus,
    Gear,
    Heading,
    Sliders,
    TextAlignLeft,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryDialogues} from 'components/EntryDialogues';
import {i18n} from 'i18n';
import PaletteEditor from 'libs/DatalensChartkit/components/Palette/PaletteEditor/PaletteEditor';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import debounce from 'lodash/debounce';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DashTab, DashTabItem} from 'shared';
import {
    ControlQA,
    DashEntryQa,
    DashTabItemType,
    DashboardAddWidgetQa,
    Feature,
    UPDATE_STATE_DEBOUNCE_TIME,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {registry} from 'ui/registry';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {getConfiguredDashKit} from '../../../../components/DashKit/DashKit';
import {DL} from '../../../../constants';
import type SDK from '../../../../libs/sdk';
import Utils from '../../../../utils';
import {EmptyState} from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import {Mode} from '../../modules/constants';
import type {CopiedConfigContext, CopiedConfigData} from '../../modules/helpers';
import {
    getLayoutMap,
    getPastedWidgetData,
    getPreparedCopyItemOptions,
    memoizedGetLocalTabs,
    sortByOrderIdOrLayoutComparator,
} from '../../modules/helpers';
import type {TabsHashStates} from '../../store/actions/dashTyped';
import {
    setCurrentTabData,
    setDashKitRef,
    setErrorMode,
    setHashState,
    setStateHashId,
} from '../../store/actions/dashTyped';
import {openDialog, openItemDialogAndSetData} from '../../store/actions/dialogs/actions';
import {
    closeDialogRelations,
    openDialogRelations,
    setNewRelations,
} from '../../store/actions/relations/actions';
import {
    canEdit,
    selectCurrentTab,
    selectCurrentTabId,
    selectDashWorkbookId,
    selectEntryId,
    selectSettings,
    selectShowTableOfContent,
    selectTabHashState,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
import {getUrlGlobalParams} from '../../utils/url';
import {DIALOG_TYPE} from '../Dialogs/constants';
import Error from '../Error/Error';
import TableOfContent from '../TableOfContent/TableOfContent';
import {Tabs} from '../Tabs/Tabs';

import iconRelations from 'ui/assets/icons/relations.svg';

import './Body.scss';

const b = block('dash-body');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
type OwnProps = {
    handlerEditClick: () => void;
    onPasteItem: (data: CopiedConfigData, newLayout?: ConfigLayout[]) => void;
    isEditModeLoading: boolean;
};

type DashBodyState = {
    isGlobalDragging: boolean;
    hasCopyInBuffer: CopiedConfigData | null;
};

type BodyProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

// TODO: add issue
type OverlayControls = NonNullable<DashKitProps['overlayControls']>;
type OverlayControlItem = OverlayControls[keyof OverlayControls][0];

const TYPES_TO_DIALOGS_MAP = {
    [DashTabItemType.Widget]: DIALOG_TYPE.WIDGET,
    [DashTabItemType.GroupControl]: DIALOG_TYPE.GROUP_CONTROL,
    [DashTabItemType.Control]: DIALOG_TYPE.CONTROL,
    [DashTabItemType.Text]: DIALOG_TYPE.TEXT,
    [DashTabItemType.Title]: DIALOG_TYPE.TITLE,
};

class Body extends React.PureComponent<BodyProps> {
    dashKitRef = React.createRef<DashKitComponent>();
    entryDialoguesRef = React.createRef<EntryDialogues>();

    updateUrlHashState = debounce(async (data, tabId) => {
        if (!this.props.entryId) {
            return;
        }
        const {hash} = await getSdk().us.createDashState({
            entryId: this.props.entryId,
            data,
        });
        // check if we are still on the same tab (user could switch to another when request is still in progress)
        if (tabId !== this.props.tabId) {
            this.props.setStateHashId({hash, tabId});
            return;
        }
        const {history, location} = this.props;

        const searchParams = new URLSearchParams(location.search);

        if (hash) {
            searchParams.set('state', hash);
        } else {
            searchParams.delete('state');
        }

        this.props.setStateHashId({hash, tabId});

        history.push({
            ...location,
            search: `?${searchParams.toString()}`,
        });
    }, UPDATE_STATE_DEBOUNCE_TIME);

    state: DashBodyState = {
        isGlobalDragging: false,
        hasCopyInBuffer: null,
    };

    componentDidMount() {
        // if localStorage already have a dash item, we need to set it to state
        this.storageHandler();

        window.addEventListener('storage', this.storageHandler);
    }

    componentDidUpdate() {
        if (this.dashKitRef !== this.props.dashKitRef) {
            this.props.setDashKitRef(this.dashKitRef);
        }
    }

    componentDidCatch(error: Error) {
        logger.logError('Dash.Body componentDidCatch', error);
        this.props.setErrorMode(error);
    }

    componentWillUnmount() {
        window.removeEventListener('storage', this.storageHandler);
    }

    onChange = ({
        config,
        itemsStateAndParams,
    }: {
        config: DashKitProps['config'];
        itemsStateAndParams: DashKitProps['itemsStateAndParams'];
    }) => {
        if (
            this.props.hashStates !== itemsStateAndParams &&
            itemsStateAndParams &&
            Object.keys(itemsStateAndParams).length
        ) {
            this.onStateChange(itemsStateAndParams as TabsHashStates, config as unknown as DashTab);
        } else if (config) {
            this.props.setCurrentTabData(config);
        }
    };

    getActionPanelItems() {
        const items: DashkitActionPanelItem[] = [
            {
                id: 'chart',
                icon: <Icon data={ChartColumn} />,
                title: i18n('dash.main.view', 'button_edit-panel-chart'),
                className: b('edit-panel-item'),
                qa: DashboardAddWidgetQa.AddWidget,
                dragProps: {
                    type: DashTabItemType.Widget,
                },
            },
            {
                id: 'selector',
                icon: (
                    <Icon data={Utils.isEnabledFeature(Feature.GroupControls) ? Code : Sliders} />
                ),
                title: Utils.isEnabledFeature(Feature.GroupControls)
                    ? i18n('dash.main.view', 'button_edit-panel-editor-selector')
                    : i18n('dash.main.view', 'button_edit-panel-selector'),
                className: b('edit-panel-item'),
                qa: DashboardAddWidgetQa.AddControl,
                dragProps: {
                    type: DashTabItemType.Control,
                },
            },
            {
                id: 'text',
                icon: <Icon data={TextAlignLeft} />,
                title: i18n('dash.main.view', 'button_edit-panel-text'),
                className: b('edit-panel-item'),
                qa: DashboardAddWidgetQa.AddText,
                dragProps: {
                    type: DashTabItemType.Text,
                },
            },
            {
                id: 'header',
                icon: <Icon data={Heading} />,
                title: i18n('dash.main.view', 'button_edit-panel-title'),
                className: b('edit-panel-item'),
                qa: DashboardAddWidgetQa.AddTitle,
                dragProps: {
                    type: DashTabItemType.Title,
                },
            },
        ];

        const copiedData = this.state.hasCopyInBuffer;
        if (copiedData) {
            items.push({
                id: 'paste',
                icon: <Icon data={CopyPlus} />,
                title: i18n('dash.main.view', 'button_edit-panel-paste'),
                className: b('edit-panel-item'),
                onClick: () => {
                    this.props.onPasteItem(copiedData);
                },
                dragProps: {
                    type: copiedData.type,
                    layout: copiedData.layout,
                    extra: copiedData,
                },
            });
        }

        if (Utils.isEnabledFeature(Feature.GroupControls)) {
            items.splice(1, 0, {
                id: 'group-selector',
                icon: <Icon data={Sliders} />,
                title: i18n('dash.main.view', 'button_edit-panel-selector'),
                className: b('edit-panel-item'),
                qa: DashboardAddWidgetQa.AddGroupControl,
                dragProps: {
                    type: DashTabItemType.GroupControl,
                },
            });
        }

        return items.map((item) => {
            if (item.dragProps?.type && !item.onClick) {
                item.onClick = () =>
                    this.props.openDialog(
                        TYPES_TO_DIALOGS_MAP[
                            item.dragProps?.type as keyof typeof TYPES_TO_DIALOGS_MAP
                        ],
                    );
            }

            return item;
        });
    }

    onDropElement = (dropProps: ItemDropProps) => {
        if (dropProps.dragProps.extra) {
            this.props.onPasteItem(
                {
                    ...dropProps.dragProps.extra,
                    layout: dropProps.itemLayout,
                },
                dropProps.newLayout,
            );
            dropProps.commit();
        } else {
            this.props.openDialog(
                TYPES_TO_DIALOGS_MAP[
                    dropProps?.dragProps?.type as keyof typeof TYPES_TO_DIALOGS_MAP
                ],
                dropProps,
            );
        }
    };

    onStateChange = (hashStates: TabsHashStates, config: DashTab) => {
        this.props.setHashState(hashStates, config);
        this.updateUrlHashState(hashStates, this.props.tabId);
    };

    render() {
        return (
            <div className={b()}>
                {this.renderBody()}
                <PaletteEditor />
                <EntryDialogues sdk={getSdk() as unknown as SDK} ref={this.entryDialoguesRef} />
            </div>
        );
    }

    storageHandler = () => {
        this.setState({hasCopyInBuffer: getPastedWidgetData()});
    };

    private renderDashkit = () => {
        const {isGlobalDragging} = this.state;
        const {mode, settings, tabs, tabData, handlerEditClick, isEditModeLoading} = this.props;

        let tabDataConfig = tabData as DashKitProps['config'] | null;

        if (DL.IS_MOBILE && tabDataConfig) {
            const [layoutMap, layoutColumns] = getLayoutMap(tabDataConfig.layout);
            tabDataConfig = {
                ...tabDataConfig,
                items: (tabDataConfig.items as DashTab['items'])
                    .sort((prev, next) =>
                        sortByOrderIdOrLayoutComparator(prev, next, layoutMap, layoutColumns),
                    )
                    .map((item, index) => ({
                        ...item,
                        orderId: item.orderId || index,
                    })) as ConfigItem[],
            };
        }

        const dashkitSettings = {
            ...settings,
        } as NonNullable<DashKitProps['settings']>;

        const {getMinAutoupdateInterval} = registry.dash.functions.getAll();
        const {autoupdateInterval} = Utils.getOptionsFromSearch(window.location.search);
        if (autoupdateInterval) {
            const minAutoupdateInterval = getMinAutoupdateInterval();

            dashkitSettings.autoupdateInterval =
                autoupdateInterval >= getMinAutoupdateInterval()
                    ? autoupdateInterval
                    : minAutoupdateInterval;
        }

        const overlayControls = this.getOverlayControls();

        const DashKit = getConfiguredDashKit();

        const isEmptyTab = !tabDataConfig?.items.length;

        return isEmptyTab && !isGlobalDragging ? (
            <EmptyState
                canEdit={this.props.canEdit}
                isEditMode={mode === Mode.Edit}
                isTabView={!settings.hideTabs && tabs.length > 1}
                onEditClick={handlerEditClick}
                isEditModeLoading={isEditModeLoading}
            />
        ) : (
            <DashKit
                ref={this.dashKitRef}
                config={tabDataConfig as DashKitProps['config']}
                editMode={mode === Mode.Edit}
                focusable={true}
                onDrop={this.onDropElement}
                itemsStateAndParams={this.props.hashStates as DashKitProps['itemsStateAndParams']}
                context={{
                    getPreparedCopyItemOptions: (
                        itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>,
                    ) => {
                        return getPreparedCopyItemOptions(itemToCopy, tabData, {
                            workbookId: this.props.workbookId ?? null,
                        });
                    },
                    workbookId: this.props.workbookId,
                }}
                onItemEdit={this.props.openItemDialogAndSetData}
                onChange={this.onChange}
                settings={dashkitSettings}
                defaultGlobalParams={settings.globalParams}
                globalParams={getUrlGlobalParams(
                    this.props.location.search,
                    this.props.settings.globalParams,
                )}
                overlayControls={overlayControls}
            />
        );
    };

    private renderBody() {
        const {mode, settings, tabs, showTableOfContent, isSidebarOpened} = this.props;

        switch (mode) {
            case Mode.Loading:
            case Mode.Updating:
                return <Loader size="l" />;
            case Mode.Error:
                return <Error />;
        }

        const localTabs = memoizedGetLocalTabs(tabs);

        const hasTableOfContent = !(localTabs.length === 1 && !localTabs[0].items.length);

        const showEditActionPanel = mode === Mode.Edit;

        const content = (
            <div className={b('content-wrapper')}>
                <div
                    className={b('content-container', {
                        'no-title':
                            settings.hideDashTitle && (settings.hideTabs || tabs.length === 1),
                        'no-title-with-tabs':
                            settings.hideDashTitle && !settings.hideTabs && tabs.length > 1,
                    })}
                >
                    <TableOfContent />
                    <div
                        className={b('content', {
                            'with-table-of-content': showTableOfContent && hasTableOfContent,
                            mobile: DL.IS_MOBILE,
                            aside: getIsAsideHeaderEnabled(),
                            'with-edit-panel': showEditActionPanel,
                            'with-footer': Utils.isEnabledFeature(Feature.EnableFooter),
                        })}
                    >
                        {!settings.hideDashTitle && !DL.IS_MOBILE && (
                            <div className={b('entry-name')} data-qa={DashEntryQa.EntryName}>
                                {Utils.getEntryNameFromKey(this.props.entry?.key)}
                            </div>
                        )}
                        {!settings.hideTabs && <Tabs />}
                        {this.renderDashkit()}
                        <DashkitActionPanel
                            toggleAnimation={true}
                            disable={!showEditActionPanel}
                            items={this.getActionPanelItems()}
                            className={b('edit-panel', {
                                'aside-opened': isSidebarOpened,
                            })}
                        />
                    </div>
                </div>
            </div>
        );

        if (Utils.isEnabledFeature(Feature.EnableDashDNDPanel)) {
            return (
                <DashKitDnDWrapper
                    onDragStart={() => {
                        this.setState({isGlobalDragging: true});
                    }}
                    onDragEnd={() => {
                        this.setState({isGlobalDragging: false});
                    }}
                >
                    {content}
                </DashKitDnDWrapper>
            );
        }

        return content;
    }

    private getOverlayControls = (): DashKitProps['overlayControls'] => {
        return {
            overlayControls: [
                {
                    allWidgetsControls: true,
                    id: MenuItems.Settings,
                    title: i18n('dash.settings-dialog.edit', 'label_settings'),
                    icon: Gear,
                    qa: ControlQA.controlSettings,
                },
                {
                    allWidgetsControls: true,
                    title: i18n('dash.main.view', 'button_links'),
                    excludeWidgetsTypes: ['title', 'text'],
                    icon: iconRelations,
                    qa: ControlQA.controlLinks,
                    handler: (widget: DashTabItem) => {
                        this.props.setNewRelations(true);
                        this.props.openDialogRelations({
                            widget,
                            dashKitRef: this.dashKitRef,
                            onApply: () => {},
                            onClose: () => {
                                this.props.setNewRelations(false);
                                this.props.closeDialogRelations();
                            },
                        });
                    },
                } as OverlayControlItem,
            ],
        };
    };
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    entryId: selectEntryId(state),
    entry: state.dash.entry,
    mode: state.dash.mode,
    showTableOfContent: selectShowTableOfContent(state),
    hashStates: selectTabHashState(state),
    settings: selectSettings(state),
    tabData: selectCurrentTab(state),
    dashKitRef: state.dash.dashKitRef,
    canEdit: canEdit(state),
    tabs: selectTabs(state),
    tabId: selectCurrentTabId(state),
    isSidebarOpened: !selectAsideHeaderIsCompact(state),
    workbookId: selectDashWorkbookId(state),
});

const mapDispatchToProps = {
    setErrorMode,
    setCurrentTabData,
    openItemDialogAndSetData,
    setHashState,
    setStateHashId,
    setDashKitRef,
    openDialogRelations,
    closeDialogRelations,
    setNewRelations,
    openDialog,
};

export default compose<BodyProps, OwnProps>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Body);
