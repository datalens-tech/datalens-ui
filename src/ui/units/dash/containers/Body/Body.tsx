import React from 'react';

import {
    DashKitDnDWrapper,
    ActionPanel as DashkitActionPanel,
    DashKit as GravityDashkit,
} from '@gravity-ui/dashkit';
import type {
    ConfigItem,
    ConfigLayout,
    DashKit as DashKitComponent,
    DashKitGroup,
    DashKitProps,
    DashkitGroupRenderProps,
    ItemDropProps,
    PreparedCopyItemOptions,
} from '@gravity-ui/dashkit';
import {DEFAULT_GROUP, MenuItems} from '@gravity-ui/dashkit/helpers';
import {
    ChevronsDown,
    ChevronsUp,
    Gear,
    Pin,
    PinSlash,
    Square,
    SquareCheck,
} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
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
import type {DashTab, DashTabItem, DashTabLayout} from 'shared';
import {
    ControlQA,
    DashEntryQa,
    DashKitOverlayMenuQa,
    Feature,
    UPDATE_STATE_DEBOUNCE_TIME,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {
    FIXED_GROUP_CONTAINER_ID,
    FIXED_GROUP_HEADER_ID,
    FIXED_HEADER_GROUP_COLS,
    FIXED_HEADER_GROUP_LINE_MAX_ROWS,
} from 'ui/components/DashKit/constants';
import {getDashKitMenu} from 'ui/components/DashKit/helpers';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {getConfiguredDashKit} from '../../../../components/DashKit/DashKit';
import {DL} from '../../../../constants';
import type SDK from '../../../../libs/sdk';
import Utils from '../../../../utils';
import {TYPES_TO_DIALOGS_MAP, getActionPanelItems} from '../../../../utils/getActionPanelItems';
import {EmptyState} from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import {Mode} from '../../modules/constants';
import type {CopiedConfigContext, CopiedConfigData} from '../../modules/helpers';
import {
    getLayoutMap,
    getLayoutParentId,
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
    selectDashError,
    selectDashWorkbookId,
    selectEntryId,
    selectSettings,
    selectShowTableOfContent,
    selectTabHashState,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
import {DashError} from '../DashError/DashError';
import {FixedHeaderContainer, FixedHeaderControls} from '../FixedHeader/FixedHeader';
import TableOfContent from '../TableOfContent/TableOfContent';
import {Tabs} from '../Tabs/Tabs';

import iconRelations from 'ui/assets/icons/relations.svg';

import './Body.scss';

const b = block('dash-body');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
type OwnProps = {
    hideErrorDetails?: boolean;
    onRetry: () => void;
    globalParams: DashKitProps['globalParams'];
    dashkitSettings: DashKitProps['settings'];
    disableHashNavigation?: boolean;
    disableUrlState?: boolean;
} & (
    | ({
          onlyView?: boolean;
      } & EditProps)
    | NoEditProps
);

type EditProps = {
    handlerEditClick: () => void;
    onPasteItem: (data: CopiedConfigData, newLayout?: ConfigLayout[]) => void;
    isEditModeLoading: boolean;
};

type NoEditProps = {
    onlyView: true;
} & Partial<EditProps>;

type DashBodyState = {
    fixedHeaderCollapsed: Record<string, boolean>;
    isGlobalDragging: boolean;
    hasCopyInBuffer: CopiedConfigData | null;
};

type BodyProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

// TODO: add issue
type OverlayControls = NonNullable<DashKitProps['overlayControls']>;
type OverlayControlItem = OverlayControls[keyof OverlayControls][0];

type MemoContext = {
    fixedHeaderCollapsed?: boolean;
    workbookId?: string | null;
    getPreparedCopyItemOptions?: (
        itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>,
    ) => ReturnType<typeof getPreparedCopyItemOptions>;
};
type DashkitGroupRenderWithContextProps = DashkitGroupRenderProps & {context: MemoContext};

const GROUPS_WEIGHT = {
    [FIXED_GROUP_HEADER_ID]: 2,
    [FIXED_GROUP_CONTAINER_ID]: 1,
    [DEFAULT_GROUP]: 0,
} as const;

const DashKit = getConfiguredDashKit();

// Body is used as a core in different environments
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

    _memoizedContext: MemoContext = {};
    _memoizedControls: DashKitProps['overlayControls'];
    _memoizedMenu: DashKitProps['overlayMenuItems'];
    _memoizedWidgetsMap: {
        layout: DashTabLayout[] | null;
        byGroup: Record<string, DashTabLayout[]>;
        byId: Record<string, DashTabLayout>;
        columns: number;
    } = {
        layout: null,
        byGroup: {},
        byId: {},
        columns: 0,
    };

    state: DashBodyState = {
        fixedHeaderCollapsed: {},
        isGlobalDragging: false,
        hasCopyInBuffer: null,
    };

    groups: DashKitGroup[] = [
        {
            id: FIXED_GROUP_HEADER_ID,
            render: (id, children, props) =>
                this.renderFixedGroupHeader(
                    id,
                    children,
                    props as DashkitGroupRenderWithContextProps,
                ),
            gridProperties: (props) => {
                return {
                    ...props,
                    cols: FIXED_HEADER_GROUP_COLS,
                    maxRows: FIXED_HEADER_GROUP_LINE_MAX_ROWS,
                    autoSize: false,
                    compactType: 'horizontal-nowrap',
                };
            },
        },
        {
            id: FIXED_GROUP_CONTAINER_ID,
            render: (id, children, props) =>
                this.renderFixedGroupContainer(
                    id,
                    children,
                    props as DashkitGroupRenderWithContextProps,
                ),
        },
        {
            id: DEFAULT_GROUP,
        },
    ];

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

    render() {
        return (
            <div className={b()}>
                {this.renderBody()}
                <PaletteEditor />
                <EntryDialogues sdk={getSdk() as unknown as SDK} ref={this.entryDialoguesRef} />
            </div>
        );
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
            this.props.setCurrentTabData(config as unknown as DashTab);
        }
    };

    onDropElement = (dropProps: ItemDropProps) => {
        if (this.props.onlyView) {
            return;
        }

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
        if (this.props.disableUrlState) {
            return;
        }
        this.updateUrlHashState(hashStates, this.props.tabId);
    };

    getGroupsInsertCoords = (forSingleInsert = false) => {
        const {tabData} = this.props;
        const tabDataConfig = tabData as DashKitProps['config'] | null;

        return (tabDataConfig?.layout || []).reduce(
            (memo, item) => {
                const parentId = getLayoutParentId(item);
                const bottom = item.y + item.h;
                const left = item.x + item.w;

                switch (parentId) {
                    case FIXED_GROUP_HEADER_ID:
                        memo[FIXED_GROUP_HEADER_ID] = {
                            y: forSingleInsert
                                ? 0
                                : Math.max(memo[FIXED_GROUP_CONTAINER_ID].y, bottom),
                            x: Math.max(memo[FIXED_GROUP_HEADER_ID].x, left),
                        };
                        break;

                    case FIXED_GROUP_CONTAINER_ID:
                        memo[FIXED_GROUP_CONTAINER_ID] = {
                            y: Math.max(memo[FIXED_GROUP_CONTAINER_ID].y, bottom),
                            x: 0,
                        };
                        break;

                    default:
                        memo[DEFAULT_GROUP] = {
                            y: 0,
                            x: 0,
                        };
                }

                return memo;
            },
            {
                [DEFAULT_GROUP]: {x: 0, y: 0},
                [FIXED_GROUP_HEADER_ID]: {x: 0, y: 0},
                [FIXED_GROUP_CONTAINER_ID]: {x: 0, y: 0},
            },
        );
    };

    getTabConfig() {
        const {tabData} = this.props;
        return tabData as DashTab;
    }

    getMemoLayoutMap() {
        const widgetsMap = this._memoizedWidgetsMap;
        const layout = this.getTabConfig().layout;

        if (widgetsMap.layout !== layout) {
            widgetsMap.layout = layout;
            const [byId, columns, byGroup] = getLayoutMap(layout);

            widgetsMap.byId = byId;
            widgetsMap.byGroup = byGroup;
            widgetsMap.columns = columns;
        }

        return widgetsMap;
    }

    getWidgetLayoutById(widgetId: string) {
        return this.getMemoLayoutMap().byId[widgetId];
    }

    getWidgetLayoutByGroup(groupId: string) {
        return this.getMemoLayoutMap().byGroup[groupId];
    }

    togglePinElement = (widget: ConfigItem) => {
        const tabDataConfig = this.getTabConfig();
        const groupCoords = this.getGroupsInsertCoords(true);

        let movedItem: ConfigLayout | null = null;
        const newLayout = tabDataConfig.layout.reduce<ConfigLayout[]>((memo, item) => {
            if (item.i === widget.id) {
                const {parent, ...itemCopy} = item;
                const isFixed =
                    parent === FIXED_GROUP_CONTAINER_ID || parent === FIXED_GROUP_HEADER_ID;

                if (isFixed) {
                    movedItem = {
                        ...itemCopy,
                        ...groupCoords[DEFAULT_GROUP],
                    };
                } else {
                    const leftSpace = tabDataConfig.layout.reduce((memo, item) => {
                        if (item.parent === FIXED_GROUP_HEADER_ID) {
                            memo -= item.w;
                        }
                        return memo;
                    }, FIXED_HEADER_GROUP_COLS);

                    const parentId =
                        itemCopy.h <= FIXED_HEADER_GROUP_LINE_MAX_ROWS && itemCopy.w <= leftSpace
                            ? FIXED_GROUP_HEADER_ID
                            : FIXED_GROUP_CONTAINER_ID;

                    movedItem = {
                        ...itemCopy,
                        parent: parentId,
                        ...groupCoords[parentId],
                    };
                }
            } else {
                memo.push(item);
            }

            return memo;
        }, []);

        if (movedItem) {
            this.props.setCurrentTabData({
                ...tabDataConfig,
                layout: GravityDashkit.reflowLayout({
                    newLayoutItem: movedItem,
                    layout: newLayout,
                    groups: this.groups,
                }),
            });
        }
    };

    unpinAllElements = () => {
        const tabDataConfig = this.getTabConfig();

        if (tabDataConfig) {
            const groupCoords = this.getGroupsInsertCoords();

            const newLayout = tabDataConfig.layout.map(({parent, ...item}) => {
                switch (parent || DEFAULT_GROUP) {
                    case FIXED_GROUP_HEADER_ID:
                        return {...item, y: 0};
                    case FIXED_GROUP_CONTAINER_ID: {
                        return {
                            ...item,
                            y: item.y + groupCoords[FIXED_GROUP_HEADER_ID].y,
                        };
                    }
                    case DEFAULT_GROUP: {
                        return {
                            ...item,
                            y:
                                item.y +
                                groupCoords[FIXED_GROUP_HEADER_ID].y +
                                groupCoords[FIXED_GROUP_CONTAINER_ID].y,
                        };
                    }
                    default:
                        return item;
                }
            });

            this.props.setCurrentTabData({...tabDataConfig, layout: newLayout});
        }
    };

    toggleDefaultCollapsedState = () => {
        const config = this.getTabConfig();

        this.props.setCurrentTabData({
            ...config,
            settings: {
                ...config.settings,
                fixedHeaderCollapsedDefault: !config.settings?.fixedHeaderCollapsedDefault,
            },
        });
    };

    toggleFixedHeader = () => {
        const {tabId} = this.props;

        if (tabId) {
            this.setState({
                fixedHeaderCollapsed: {
                    ...this.state.fixedHeaderCollapsed,
                    [tabId]: !this.getFixedHeaderCollapsedState(),
                },
            });
        }
    };

    getFixedHeaderCollapsedState() {
        const {tabId} = this.props;

        if (!tabId) {
            return false;
        }

        if (tabId && tabId in this.state.fixedHeaderCollapsed) {
            return this.state.fixedHeaderCollapsed[tabId as string];
        }

        const config = this.getTabConfig();
        return config.settings?.fixedHeaderCollapsedDefault ?? false;
    }

    renderFixedControls = (isCollapsed: boolean, hasFixedContainerElements: boolean) => {
        const {mode} = this.props;
        const config = this.getTabConfig();

        if (mode === Mode.Edit) {
            return (
                <DropdownMenu
                    renderSwitcher={(props) => (
                        <Button {...props} view={'raised'}>
                            <Icon size={16} data={Gear} />
                        </Button>
                    )}
                    items={[
                        config.settings?.fixedHeaderCollapsedDefault
                            ? {
                                  action: this.toggleDefaultCollapsedState,
                                  text: i18n('dash.main.view', 'label_fixed-show-default'),
                                  iconStart: <Icon data={Square} />,
                                  theme: 'normal',
                              }
                            : {
                                  action: this.toggleDefaultCollapsedState,
                                  text: i18n('dash.main.view', 'label_fixed-collapsed-default'),
                                  iconStart: <Icon data={SquareCheck} />,
                                  theme: 'normal',
                              },
                        {
                            action: this.unpinAllElements,
                            text: i18n('dash.main.view', 'label_unpin-all'),
                            iconStart: <Icon data={PinSlash} />,
                            theme: 'danger',
                        },
                    ]}
                />
            );
        } else if (hasFixedContainerElements) {
            return (
                <Button onClick={this.toggleFixedHeader} view={'flat'}>
                    <Icon data={isCollapsed ? ChevronsDown : ChevronsUp} />
                </Button>
            );
        } else {
            return (
                <Button onClick={this.toggleFixedHeader} view={'flat'} disabled={true}>
                    <Icon data={Pin} />
                </Button>
            );
        }
    };

    renderFixedGroupHeader = (
        id: string,
        children: React.ReactNode,
        params: DashkitGroupRenderWithContextProps,
    ) => {
        const isEmpty = params.items.length === 0;
        const hasFixedContainerElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_CONTAINER_ID),
        );

        if (isEmpty && !hasFixedContainerElements && this.props.mode !== Mode.Edit) {
            return null;
        }
        const {fixedHeaderCollapsed = false} = params.context;

        return (
            <FixedHeaderControls
                isEmpty={isEmpty}
                key={`${id}_${this.props.tabId}`}
                isCollapsed={fixedHeaderCollapsed}
                editMode={params.editMode}
                controls={this.renderFixedControls(fixedHeaderCollapsed, hasFixedContainerElements)}
            >
                {children}
            </FixedHeaderControls>
        );
    };

    renderFixedGroupContainer = (
        id: string,
        children: React.ReactNode,
        params: DashkitGroupRenderWithContextProps,
    ) => {
        const isEmpty = params.items.length === 0;
        const hasFixedHeaderElements = Boolean(this.getWidgetLayoutByGroup(FIXED_GROUP_HEADER_ID));

        if (isEmpty && !hasFixedHeaderElements && this.props.mode !== Mode.Edit) {
            return null;
        }
        const {fixedHeaderCollapsed = false} = params.context;

        return (
            <FixedHeaderContainer
                isEmpty={isEmpty}
                key={`${id}_${this.props.tabId}`}
                isCollapsed={fixedHeaderCollapsed}
                editMode={params.editMode}
            >
                {children}
            </FixedHeaderContainer>
        );
    };

    storageHandler = () => {
        this.setState({hasCopyInBuffer: getPastedWidgetData()});
    };

    getContext = () => {
        const memoContext = this._memoizedContext;
        const isCollapsed = this.getFixedHeaderCollapsedState();

        if (
            memoContext.workbookId !== this.props.workbookId ||
            memoContext.fixedHeaderCollapsed !== isCollapsed
        ) {
            const fn = (itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>) => {
                return getPreparedCopyItemOptions(itemToCopy, this.props.tabData, {
                    workbookId: this.props.workbookId ?? null,
                });
            };

            this._memoizedContext = {
                ...(memoContext || {}),
                getPreparedCopyItemOptions: memoContext.getPreparedCopyItemOptions || fn,
                workbookId: this.props.workbookId,
                fixedHeaderCollapsed: isCollapsed,
            };
        }

        return this._memoizedContext;
    };

    getOverlayControls = (): DashKitProps['overlayControls'] => {
        if (!this._memoizedControls) {
            this._memoizedControls = {
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
        }

        return this._memoizedControls;
    };

    getOverlayMenu = () => {
        if (!this._memoizedMenu) {
            const dashkitMenu = getDashKitMenu();

            if (Utils.isEnabledFeature(Feature.EnableDashFixedHeader)) {
                this._memoizedMenu = [
                    ...dashkitMenu.slice(0, -1),
                    {
                        id: 'pin',
                        title: i18n('dash.main.view', 'label_pin'),
                        icon: <Icon data={Pin} size={16} />,
                        handler: this.togglePinElement,
                        visible: (configItem) => {
                            const parent = this.getWidgetLayoutById(configItem.id)?.parent;

                            return (
                                parent !== FIXED_GROUP_HEADER_ID &&
                                parent !== FIXED_GROUP_CONTAINER_ID
                            );
                        },
                        qa: DashKitOverlayMenuQa.PinButton,
                    },
                    {
                        id: 'unpin',
                        title: i18n('dash.main.view', 'label_unpin'),
                        icon: <Icon data={PinSlash} size={16} />,
                        handler: this.togglePinElement,
                        visible: (configItem) => {
                            const parent = this.getWidgetLayoutById(configItem.id)?.parent;

                            return (
                                parent === FIXED_GROUP_HEADER_ID ||
                                parent === FIXED_GROUP_CONTAINER_ID
                            );
                        },
                        qa: DashKitOverlayMenuQa.UnpinButton,
                    },
                    ...dashkitMenu.slice(-1),
                ];
            } else {
                this._memoizedMenu = dashkitMenu;
            }
        }

        return this._memoizedMenu;
    };

    getMobileLayout(): DashKitProps['config'] | null {
        const {tabData} = this.props;
        const tabDataConfig = tabData as DashKitProps['config'] | null;

        if (!tabDataConfig) {
            return tabDataConfig;
        }

        const {byId, columns} = this.getMemoLayoutMap();
        const getWeight = (item: DashTabItem): number => {
            const parentId = getLayoutParentId(byId[item.id]);

            return (GROUPS_WEIGHT as any)[parentId] || 0;
        };

        return {
            ...tabDataConfig,
            items: (tabDataConfig.items as DashTab['items'])
                .sort((prev, next) => {
                    const prevWeight = getWeight(prev);
                    const nextWeight = getWeight(next);

                    if (prevWeight === nextWeight) {
                        return sortByOrderIdOrLayoutComparator(prev, next, byId, columns);
                    }

                    return nextWeight - prevWeight;
                })
                .map((item, index) => ({
                    ...item,
                    orderId: item.orderId || index,
                })) as ConfigItem[],
        };
    }

    private renderDashkit = () => {
        const {isGlobalDragging} = this.state;
        const {
            mode,
            settings,
            tabs,
            tabData,
            handlerEditClick,
            isEditModeLoading,
            globalParams,
            dashkitSettings,
        } = this.props;

        const tabDataConfig = DL.IS_MOBILE
            ? this.getMobileLayout()
            : (tabData as DashKitProps['config'] | null);

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
                groups={
                    Utils.isEnabledFeature(Feature.EnableDashFixedHeader) ? this.groups : undefined
                }
                context={this.getContext()}
                onItemEdit={this.props.openItemDialogAndSetData}
                onChange={this.onChange}
                settings={dashkitSettings}
                defaultGlobalParams={settings.globalParams}
                globalParams={globalParams}
                overlayControls={this.getOverlayControls()}
                overlayMenuItems={this.getOverlayMenu()}
            />
        );
    };

    private handleDragStart = () => {
        this.setState({isGlobalDragging: true});
    };

    private handleDragEnd = () => {
        this.setState({isGlobalDragging: false});
    };

    private renderBody() {
        const {
            mode,
            settings,
            tabs,
            showTableOfContent,
            isSidebarOpened,
            hideErrorDetails,
            onRetry,
            error,
            disableHashNavigation,
        } = this.props;

        switch (mode) {
            case Mode.Loading:
            case Mode.Updating:
                return <Loader size="l" />;
            case Mode.Error:
                return <DashError error={error} hideDetails={hideErrorDetails} onRetry={onRetry} />;
        }

        const localTabs = memoizedGetLocalTabs(tabs);

        const hasTableOfContent = !(localTabs.length === 1 && !localTabs[0].items.length);

        const showEditActionPanel = mode === Mode.Edit;

        const content = (
            <div className={b('content-wrapper', {mobile: DL.IS_MOBILE})}>
                <div
                    className={b('content-container', {
                        mobile: DL.IS_MOBILE,
                        'no-title':
                            settings.hideDashTitle && (settings.hideTabs || tabs.length === 1),
                        'no-title-with-tabs':
                            settings.hideDashTitle && !settings.hideTabs && tabs.length > 1,
                    })}
                >
                    <TableOfContent disableHashNavigation={disableHashNavigation} />
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
                        {!this.props.onlyView && (
                            <DashkitActionPanel
                                toggleAnimation={true}
                                disable={!showEditActionPanel}
                                items={getActionPanelItems({
                                    copiedData: this.state.hasCopyInBuffer,
                                    onPasteItem: this.props.onPasteItem,
                                    openDialog: this.props.openDialog,
                                })}
                                className={b('edit-panel', {
                                    'aside-opened': isSidebarOpened,
                                })}
                            />
                        )}
                    </div>
                </div>
            </div>
        );

        return (
            <DashKitDnDWrapper onDragStart={this.handleDragStart} onDragEnd={this.handleDragEnd}>
                {content}
            </DashKitDnDWrapper>
        );
    }
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
    error: selectDashError(state),
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
