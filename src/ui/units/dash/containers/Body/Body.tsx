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
    ChevronsLeft,
    ChevronsRight,
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
import {createPortal} from 'react-dom';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DashTab, DashTabItem, DashTabLayout} from 'shared';
import {
    ControlQA,
    DASH_INFO_HEADER,
    DashBodyQa,
    DashEntryQa,
    DashKitOverlayMenuQa,
    DashTabItemType,
    EntryScope,
    Feature,
    FixedHeaderQa,
    LOADED_DASH_CLASS,
    SCROLL_TITLE_DEBOUNCE_TIME,
    UPDATE_STATE_DEBOUNCE_TIME,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {
    DEFAULT_DASH_MARGINS,
    FIXED_GROUP_CONTAINER_ID,
    FIXED_GROUP_HEADER_ID,
} from 'ui/components/DashKit/constants';
import {WidgetContextProvider} from 'ui/components/DashKit/context/WidgetContext';
import {getDashKitMenu} from 'ui/components/DashKit/helpers';
import {showToast} from 'ui/store/actions/toaster';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';
import {selectUserSettings} from 'ui/store/selectors/user';
import {isEmbeddedMode} from 'ui/utils/embedded';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {getConfiguredDashKit} from '../../../../components/DashKit/DashKit';
import {DL} from '../../../../constants';
import Utils from '../../../../utils';
import {TYPES_TO_DIALOGS_MAP, getActionPanelItems} from '../../../../utils/getActionPanelItems';
import {EmptyState} from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import {Mode} from '../../modules/constants';
import type {CopiedConfigContext, CopiedConfigData} from '../../modules/helpers';
import {
    getGroupedItems,
    getLayoutMap,
    getLayoutParentId,
    getPastedWidgetData,
    getPreparedCopyItemOptions,
    memoizedGetLocalTabs,
} from '../../modules/helpers';
import type {TabsHashStates} from '../../store/actions/dashTyped';
import {
    setCurrentTabData,
    setDashKitRef,
    setErrorMode,
    setHashState,
    setStateHashId,
    setWidgetCurrentTab,
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
    selectIsNewRelations,
    selectLastModifiedItemId,
    selectSettings,
    selectShowTableOfContent,
    selectSkipReload,
    selectTabHashState,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
import {getPropertiesWithResizeHandles} from '../../utils/dashkitProps';
import {scrollIntoView} from '../../utils/scrollUtils';
import {DashError} from '../DashError/DashError';
import {
    FixedHeaderContainer,
    FixedHeaderControls,
    FixedHeaderWrapper,
} from '../FixedHeader/FixedHeader';
import TableOfContent from '../TableOfContent/TableOfContent';
import {Tabs} from '../Tabs/Tabs';

import iconRelations from 'ui/assets/icons/relations.svg';

import './Body.scss';

const b = block('dash-body');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
type OwnProps = {
    isPublicMode?: boolean;
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
    fixedHeaderControlsEl: HTMLDivElement | null;
    fixedHeaderContainerEl: HTMLDivElement | null;
    isGlobalDragging: boolean;
    hasCopyInBuffer: CopiedConfigData | null;
    loaded: boolean;
    prevMeta: {tabId: string | null; entryId: string | null};
    loadedItemsMap: Map<string, boolean>;
    hash: string;
    delayedScrollElement: HTMLElement | string | null;
    lastDelayedScrollTop: number | null;
    groups: {
        margins: [number, number];
        renderers: DashKitGroup[];
    };
};

type BodyProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

// TODO: add issue
type OverlayControls = NonNullable<DashKitProps['overlayControls']>;
type OverlayControlItem = OverlayControls[keyof OverlayControls][0];

type MemoContext = {
    fixedHeaderCollapsed?: boolean;
    isEmbeddedMode?: boolean;
    isPublicMode?: boolean;
    workbookId?: string | null;
};
type DashkitGroupRenderWithContextProps = DashkitGroupRenderProps & {context: MemoContext};

type GetPreparedCopyItemOptions<T extends object = {}> = (
    itemToCopy: PreparedCopyItemOptions<T>,
) => PreparedCopyItemOptions<T>;

// Body is used as a core in different environments
class Body extends React.PureComponent<BodyProps, DashBodyState> {
    static getDerivedStateFromProps(props: BodyProps, state: DashBodyState) {
        let updatedState: Partial<DashBodyState> = {};

        const {
            prevMeta: {entryId, tabId},
        } = state;
        let isTabUnmount = false;
        // reset loaded before new tab/entry items are mounted
        if (props.entryId !== entryId || props.tabId !== tabId) {
            state.loadedItemsMap.clear();
            updatedState = {
                prevMeta: {tabId: props.tabId, entryId: props.entryId},
                loaded: false,
            };

            isTabUnmount = true;
        }

        const currentHash = props.location.hash;
        const hasHashChanged = currentHash !== state.hash;

        if (hasHashChanged) {
            updatedState.hash = currentHash;
        }

        if (!props.disableHashNavigation) {
            if (!currentHash && state.delayedScrollElement) {
                updatedState.delayedScrollElement = null;
                updatedState.lastDelayedScrollTop = null;
            } else if (!isTabUnmount && hasHashChanged) {
                scrollIntoView(currentHash.replace('#', ''));
                updatedState.delayedScrollElement = state.loaded
                    ? null
                    : currentHash.replace('#', '');
                updatedState.lastDelayedScrollTop = null;
            } else if (currentHash && isTabUnmount) {
                updatedState.delayedScrollElement = currentHash.replace('#', '');
                updatedState.lastDelayedScrollTop = null;
            }
        }

        return Object.keys(updatedState).length ? updatedState : null;
    }

    dashKitRef = React.createRef<DashKitComponent>();
    entryDialoguesRef = React.createRef<EntryDialogues>();

    updateUrlHashState = debounce(async (data, tabId) => {
        if (!this.props.entryId) {
            return;
        }
        const {hash} = await getSdk().sdk.us.createDashState({
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

    scrollIntoViewWithDebounce = debounce(() => {
        if (this.state.delayedScrollElement) {
            const lastDelayedScrollTop = scrollIntoView(
                this.state.delayedScrollElement,
                this.state.lastDelayedScrollTop,
            );
            this.setState({lastDelayedScrollTop});
        }
    }, SCROLL_TITLE_DEBOUNCE_TIME);

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
    _memoizedOrderedConfig?: {
        key: DashKitProps['config'];
        config: DashKitProps['config'];
    };
    _dashBodyRef: React.RefObject<HTMLDivElement>;

    state: DashBodyState;

    constructor(props: BodyProps) {
        super(props);

        this.state = {
            fixedHeaderCollapsed: {},
            fixedHeaderControlsEl: null,
            fixedHeaderContainerEl: null,
            isGlobalDragging: false,
            hasCopyInBuffer: null,
            prevMeta: {tabId: null, entryId: null},
            loaded: false,
            loadedItemsMap: new Map<string, boolean>(),
            hash: '',
            delayedScrollElement: null,
            lastDelayedScrollTop: null,
            groups: {
                margins: DEFAULT_DASH_MARGINS,
                renderers: [
                    {
                        id: FIXED_GROUP_HEADER_ID,
                        render: this.renderFixedGroupHeader,
                        gridProperties: getPropertiesWithResizeHandles(),
                    },
                    {
                        id: FIXED_GROUP_CONTAINER_ID,
                        render: this.renderFixedGroupContainer,
                        gridProperties: getPropertiesWithResizeHandles(),
                    },
                    {
                        id: DEFAULT_GROUP,
                        gridProperties: getPropertiesWithResizeHandles(),
                    },
                ],
            },
        };

        this._dashBodyRef = React.createRef();
    }

    componentDidMount() {
        // if localStorage already have a dash item, we need to set it to state
        this.storageHandler();

        if (this.props.location.hash && !this.props.disableHashNavigation) {
            this.setState({delayedScrollElement: this.props.location.hash.replace('#', '')});
        }

        window.addEventListener('storage', this.storageHandler);
        window.addEventListener('wheel', this.interruptAutoScroll);
        window.addEventListener('touchmove', this.interruptAutoScroll);

        this.updateMargins();
    }

    componentDidUpdate() {
        if (this.dashKitRef !== this.props.dashKitRef) {
            this.props.setDashKitRef(this.dashKitRef);
        }

        this.updateMargins();
    }

    componentDidCatch(error: Error) {
        logger.logError('Dash.Body componentDidCatch', error);
        this.props.setErrorMode(error);
    }

    componentWillUnmount() {
        window.removeEventListener('storage', this.storageHandler);
        window.removeEventListener('wheel', this.interruptAutoScroll);
        window.removeEventListener('touchmove', this.interruptAutoScroll);
    }

    render() {
        return (
            <div className={b()} ref={this._dashBodyRef}>
                {this.renderBody()}
                <PaletteEditor />
                <EntryDialogues ref={this.entryDialoguesRef} />
            </div>
        );
    }

    _fixedHeaderControlsRef: React.RefCallback<HTMLDivElement> = (el) => {
        this.setState({fixedHeaderControlsEl: el});
    };
    _fixedHeaderContainerRef: React.RefCallback<HTMLDivElement> = (el) => {
        this.setState({fixedHeaderContainerEl: el});
    };

    updateMargins() {
        const {margins: stateMargins} = this.state.groups;
        const {margins: propsMargins = DEFAULT_DASH_MARGINS} = this.props.settings;

        if (stateMargins?.[0] !== propsMargins?.[0] || stateMargins?.[1] !== propsMargins?.[1]) {
            this.setState({
                groups: {
                    margins: propsMargins,
                    renderers: this.state.groups.renderers.map((group) => {
                        return {
                            ...group,
                            gridProperties: getPropertiesWithResizeHandles({margin: propsMargins}),
                        };
                    }),
                },
            });
        }
    }

    isCondensed = () => {
        return this.state.groups.margins[0] === 0 || this.state.groups.margins[1] === 0;
    };

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

    onItemCopy = (error: null | Error) => {
        if (error === null) {
            this.props.showToast({
                name: 'successCopyElement',
                type: 'success',
                title: i18n('component.entry-context-menu.view', 'value_copy-success'),
            });
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
        const layout = this.getTabConfig()?.layout || [];

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
                    const parentId = FIXED_GROUP_HEADER_ID;

                    movedItem = {
                        ...itemCopy,
                        parent: FIXED_GROUP_HEADER_ID,
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
                    groups: this.state.groups.renderers,
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

    renderFixedControls = (
        isCollapsed: boolean,
        hasFixedHeaderControlsElements: boolean,
        hasFixedContainerElements: boolean,
    ) => {
        const config = this.getTabConfig();
        const isEditMode = this.isEditMode();

        const {expandIcon, collapseIcon} =
            hasFixedHeaderControlsElements || isEditMode
                ? {expandIcon: ChevronsDown, collapseIcon: ChevronsUp}
                : {expandIcon: ChevronsLeft, collapseIcon: ChevronsRight};

        const expandCollapseButton = (
            <Button
                className={b('sticky-control-btn', {first: !isEditMode, last: true})}
                onClick={this.toggleFixedHeader}
                view={isEditMode ? 'flat' : 'action'}
                size={isEditMode ? 'm' : 'xl'}
                width="max"
                pin="round-brick"
                title={i18n(
                    'dash.main.view',
                    isCollapsed ? 'tooltip_expand-fixed-group' : 'tooltip_collapse-fixed-group',
                )}
                qa={FixedHeaderQa.ExpandCollapseButton}
            >
                <Icon data={isCollapsed ? expandIcon : collapseIcon} />
            </Button>
        );

        if (isEditMode) {
            return (
                (hasFixedHeaderControlsElements || hasFixedContainerElements) && (
                    <React.Fragment>
                        <DropdownMenu
                            switcherWrapperClassName={b('fixed-header-settings-switcher')}
                            renderSwitcher={(props) => (
                                <Button
                                    {...props}
                                    view="flat"
                                    size="m"
                                    width="max"
                                    pin="round-brick"
                                    className={b('sticky-control-btn', {
                                        first: true,
                                        last: false,
                                    })}
                                >
                                    <Icon size={16} data={Gear} />
                                </Button>
                            )}
                            items={[
                                {
                                    action: this.toggleDefaultCollapsedState,
                                    text: i18n('dash.main.view', 'label_fixed-collapsed-default'),
                                    iconStart: (
                                        <Icon
                                            data={
                                                config.settings?.fixedHeaderCollapsedDefault
                                                    ? SquareCheck
                                                    : Square
                                            }
                                        />
                                    ),
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
                        {expandCollapseButton}
                    </React.Fragment>
                )
            );
        } else if (hasFixedContainerElements) {
            return expandCollapseButton;
        }

        return null;
    };

    renderFixedGroupHeader = (
        id: string,
        children: React.ReactNode,
        params: DashkitGroupRenderWithContextProps,
    ) => {
        const isEmpty = params.items.length === 0;
        const hasFixedHeaderControlsElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_HEADER_ID)?.length,
        );
        const hasFixedContainerElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_CONTAINER_ID)?.length,
        );

        if (isEmpty && !hasFixedContainerElements && this.props.mode !== Mode.Edit) {
            return null;
        }

        if (params.isMobile) {
            return children;
        }

        const {fixedHeaderCollapsed = false} = params.context;

        if (!this.state.fixedHeaderControlsEl) {
            return null;
        }

        return createPortal(
            <FixedHeaderControls
                isEmpty={isEmpty}
                isContainerGroupEmpty={!hasFixedContainerElements}
                key={`${id}_${this.props.tabId}`}
                editMode={params.editMode}
                controls={this.renderFixedControls(
                    fixedHeaderCollapsed,
                    hasFixedHeaderControlsElements,
                    hasFixedContainerElements,
                )}
            >
                {children}
            </FixedHeaderControls>,
            this.state.fixedHeaderControlsEl,
        );
    };

    renderFixedGroupContainer = (
        id: string,
        children: React.ReactNode,
        params: DashkitGroupRenderWithContextProps,
    ) => {
        const isEmpty = params.items.length === 0;
        const hasFixedHeaderElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_HEADER_ID)?.length,
        );

        if (isEmpty && !hasFixedHeaderElements && this.props.mode !== Mode.Edit) {
            return null;
        }

        if (params.isMobile) {
            return children;
        }

        if (!this.state.fixedHeaderContainerEl) {
            return null;
        }

        return createPortal(
            <FixedHeaderContainer
                isEmpty={isEmpty}
                isControlsGroupEmpty={!hasFixedHeaderElements}
                key={`${id}_${this.props.tabId}`}
                editMode={params.editMode}
            >
                {children}
            </FixedHeaderContainer>,
            this.state.fixedHeaderContainerEl,
        );
    };

    storageHandler = () => {
        this.setState({hasCopyInBuffer: getPastedWidgetData()});
    };

    interruptAutoScroll = (event: Event) => {
        if (event.isTrusted && this.state.delayedScrollElement) {
            this.setState({delayedScrollElement: null, lastDelayedScrollTop: null});
        }
    };

    getContext = () => {
        const memoContext = this._memoizedContext;
        const isCollapsed = this.getFixedHeaderCollapsedState();

        if (
            memoContext.workbookId !== this.props.workbookId ||
            memoContext.fixedHeaderCollapsed !== isCollapsed
        ) {
            this._memoizedContext = {
                ...(memoContext || {}),
                workbookId: this.props.workbookId,
                fixedHeaderCollapsed: isCollapsed,
                isEmbeddedMode: isEmbeddedMode(),
                isPublicMode: Boolean(this.props.isPublicMode),
            };
        }

        return this._memoizedContext;
    };

    getPreparedCopyItemOptionsFn = (itemToCopy: PreparedCopyItemOptions<CopiedConfigContext>) => {
        return getPreparedCopyItemOptions(itemToCopy, this.props.tabData, {
            workbookId: this.props.workbookId ?? null,
            fromScope: this.props.entry.scope,
            targetEntryId: this.props.entryId,
            targetDashTabId: this.props.tabId,
        });
    };

    getOverlayControls = (): DashKitProps['overlayControls'] => {
        if (!this._memoizedControls) {
            this._memoizedControls = {
                overlayControls: [
                    {
                        id: 'pin',
                        title: i18n('dash.main.view', 'label_pin'),
                        icon: Pin,
                        handler: this.togglePinElement,
                        visible: (configItem) => {
                            const parent = this.getWidgetLayoutById(configItem.id)?.parent;
                            const isSelector =
                                configItem.type === DashTabItemType.GroupControl ||
                                configItem.type === DashTabItemType.Control;

                            return (
                                isSelector &&
                                parent !== FIXED_GROUP_HEADER_ID &&
                                parent !== FIXED_GROUP_CONTAINER_ID
                            );
                        },
                        qa: DashKitOverlayMenuQa.PinButton,
                    },
                    {
                        id: 'unpin',
                        title: i18n('dash.main.view', 'label_unpin'),
                        icon: PinSlash,
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
                        excludeWidgetsTypes: [
                            DashTabItemType.Text,
                            DashTabItemType.Title,
                            DashTabItemType.Image,
                        ],
                        icon: iconRelations,
                        qa: ControlQA.controlLinks,
                        handler: (widget: DashTabItem) => {
                            this.props.setNewRelations(true);
                            this.props.openDialogRelations({
                                widget,
                                dashKitRef: this.dashKitRef,
                                onClose: () => {
                                    this.props.setNewRelations(false);
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

            this._memoizedMenu = [
                ...dashkitMenu.slice(0, -1),
                {
                    id: 'pin',
                    title: i18n('dash.main.view', 'label_pin'),
                    icon: <Icon data={Pin} size={16} />,
                    handler: this.togglePinElement,
                    visible: (configItem) => {
                        const parent = this.getWidgetLayoutById(configItem.id)?.parent;
                        const isSelector =
                            configItem.type === DashTabItemType.GroupControl ||
                            configItem.type === DashTabItemType.Control;

                        return (
                            !isSelector &&
                            parent !== FIXED_GROUP_HEADER_ID &&
                            parent !== FIXED_GROUP_CONTAINER_ID
                        );
                    },
                    qa: DashKitOverlayMenuQa.PinButton,
                },

                ...dashkitMenu.slice(-1),
            ];
        }

        return this._memoizedMenu;
    };

    dataProviderContextGetter = () => {
        const {tabId, entryId} = this.props;

        const dashInfo = {
            dashId: entryId || '',
            dashTabId: tabId || '',
        };

        return {
            [DASH_INFO_HEADER]: new URLSearchParams(dashInfo).toString(),
        };
    };

    private isEditMode() {
        return this.props.mode === Mode.Edit;
    }

    private getConfig = () => {
        const {tabData} = this.props;
        const tabDataConfig = tabData;

        if (!tabDataConfig || !DL.IS_MOBILE) {
            return tabDataConfig;
        }

        const memoItems = this._memoizedOrderedConfig;

        if (!memoItems || memoItems.key !== tabDataConfig) {
            const layoutIndex: Record<string, number> = {};
            const sortedItems = getGroupedItems(tabDataConfig.items, tabDataConfig.layout)
                .reduce((list, group) => {
                    group.forEach((item) => {
                        layoutIndex[item.id] = item.orderId;
                    });
                    list.push(...group);
                    return list;
                }, [])
                .sort((a, b) => a.orderId - b.orderId);
            const sortedLayout = tabDataConfig.layout.reduce<ConfigLayout[]>((memo, item) => {
                memo[layoutIndex[item.i]] = item;
                return memo;
            }, []);

            this._memoizedOrderedConfig = {
                key: tabDataConfig as DashKitProps['config'],
                config: {
                    ...tabDataConfig,
                    layout: sortedLayout,
                    items: sortedItems as ConfigItem[],
                },
            };
        }

        return this._memoizedOrderedConfig?.config;
    };

    private itemAddHandler = (isMounted: boolean, id: string, domElement: HTMLElement) => {
        if (
            this.isEditMode() &&
            isMounted &&
            isEnabledFeature(Feature.EnableDashAutoFocus) &&
            this.props.lastModifiedItem === id
        ) {
            const lastDelayedScrollTop = scrollIntoView(domElement, null);

            this.setState({
                delayedScrollElement: domElement,
                lastDelayedScrollTop,
            });
        }
    };

    private renderDashkit = () => {
        const {isGlobalDragging} = this.state;
        const {
            settings,
            tabs,
            handlerEditClick,
            isEditModeLoading,
            globalParams,
            dashkitSettings,
            disableHashNavigation,
        } = this.props;

        const context = this.getContext();

        const tabDataConfig = this.getConfig();
        const fixedHeaderCollapsed = context.fixedHeaderCollapsed || false;
        const isEditMode = this.isEditMode();

        const isEmptyTab = !tabDataConfig?.items.length;

        const DashKit = getConfiguredDashKit(undefined, {disableHashNavigation});

        const hasFixedHeaderControlsElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_HEADER_ID)?.length,
        );
        const hasFixedHeaderContainerElements = Boolean(
            this.getWidgetLayoutByGroup(FIXED_GROUP_CONTAINER_ID)?.length,
        );

        const canRenderDashkit =
            this.state.fixedHeaderControlsEl && this.state.fixedHeaderContainerEl;

        if (isEmptyTab && !isGlobalDragging) {
            return (
                <EmptyState
                    canEdit={this.props.canEdit}
                    isEditMode={isEditMode}
                    isTabView={!settings.hideTabs && tabs.length > 1}
                    onEditClick={handlerEditClick}
                    isEditModeLoading={isEditModeLoading}
                />
            );
        }

        return (
            <WidgetContextProvider onWidgetMountChange={this.itemAddHandler}>
                <FixedHeaderWrapper
                    dashBodyRef={this._dashBodyRef}
                    controlsRef={this._fixedHeaderControlsRef}
                    containerRef={this._fixedHeaderContainerRef}
                    isCollapsed={fixedHeaderCollapsed}
                    editMode={isEditMode}
                    isControlsGroupEmpty={!hasFixedHeaderControlsElements}
                    isContainerGroupEmpty={!hasFixedHeaderContainerElements}
                />
                {canRenderDashkit ? (
                    <DashKit
                        ref={this.dashKitRef}
                        config={tabDataConfig as DashKitProps['config']}
                        editMode={isEditMode}
                        focusable={true}
                        onDrop={this.onDropElement}
                        itemsStateAndParams={
                            this.props.hashStates as DashKitProps['itemsStateAndParams']
                        }
                        groups={this.state.groups.renderers}
                        context={context}
                        getPreparedCopyItemOptions={
                            this
                                .getPreparedCopyItemOptionsFn satisfies GetPreparedCopyItemOptions<any> as GetPreparedCopyItemOptions<{}>
                        }
                        onCopyFulfill={this.onItemCopy}
                        onItemEdit={this.props.openItemDialogAndSetData}
                        onChange={this.onChange}
                        settings={dashkitSettings}
                        defaultGlobalParams={settings.globalParams}
                        globalParams={globalParams}
                        overlayControls={this.getOverlayControls()}
                        overlayMenuItems={this.getOverlayMenu()}
                        skipReload={this.props.skipReload}
                        isNewRelations={this.props.isNewRelations}
                        onItemMountChange={this.handleItemMountChange}
                        onItemRender={this.handleItemRender}
                        hideErrorDetails={this.props.hideErrorDetails}
                        setWidgetCurrentTab={this.props.setWidgetCurrentTab}
                        dataProviderContextGetter={this.dataProviderContextGetter}
                    />
                ) : null}
            </WidgetContextProvider>
        );
    };

    private handleDragStart = () => {
        this.setState({isGlobalDragging: true});
    };

    private handleDragEnd = () => {
        this.setState({isGlobalDragging: false});
    };

    private handleItemMountChange = (item: ConfigItem, {isMounted}: {isMounted: boolean}) => {
        if (isMounted) {
            this.state.loadedItemsMap.set(item.id, false);

            if (this.state.loadedItemsMap.size === this.props.tabData?.items.length) {
                this.scrollIntoViewWithDebounce();
            }
        }
    };

    private handleItemRender = (item: ConfigItem) => {
        const {loadedItemsMap} = this.state;

        if (loadedItemsMap.has(item.id) && loadedItemsMap.get(item.id) !== true) {
            loadedItemsMap.set(item.id, true);

            const isLoaded =
                loadedItemsMap.size === this.props.tabData?.items.length &&
                Array.from(loadedItemsMap.values()).every(Boolean);

            if (isLoaded && this.state.delayedScrollElement) {
                scrollIntoView(this.state.delayedScrollElement, this.state.lastDelayedScrollTop);
                this.setState({delayedScrollElement: null, lastDelayedScrollTop: null});
            } else {
                // if the dash is not fully loaded, we are starting a scroll chain
                // that will try to scroll to the title after each item rendering
                this.scrollIntoViewWithDebounce();
            }
            this.setState({loaded: isLoaded});
        }
    };

    private handleTocItemClick = (itemTitle: string) => {
        if (this.props.disableHashNavigation) {
            if (this.state.loaded) {
                scrollIntoView(encodeURIComponent(itemTitle));
            }

            this.setState({
                delayedScrollElement: encodeURIComponent(itemTitle),
                lastDelayedScrollTop: null,
            });
        }
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

        const {loaded, hasCopyInBuffer} = this.state;

        switch (mode) {
            case Mode.Loading:
            case Mode.Updating:
                return <Loader size="l" />;
            case Mode.Error:
                return <DashError error={error} hideDetails={hideErrorDetails} onRetry={onRetry} />;
        }

        const localTabs = memoizedGetLocalTabs(tabs);

        const hasTableOfContent = !(localTabs.length === 1 && !localTabs[0].items.length);

        const showEditActionPanel = this.isEditMode();

        const loadedMixin = loaded ? LOADED_DASH_CLASS : undefined;

        const content = (
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
                        onItemClick={this.handleTocItemClick}
                    />
                    <div
                        className={b('content', {
                            condensed: this.isCondensed(),
                            'with-table-of-content': showTableOfContent && hasTableOfContent,
                            mobile: DL.IS_MOBILE,
                            aside: getIsAsideHeaderEnabled(),
                            'with-edit-panel': showEditActionPanel,
                            'with-footer': isEnabledFeature(Feature.EnableFooter),
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
                                    copiedData: hasCopyInBuffer,
                                    onPasteItem: this.props.onPasteItem,
                                    openDialog: this.props.openDialog,
                                    filterItem: (item) => item.id === DashTabItemType.Image,
                                    userSettings: this.props.userSettings,
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
    lastModifiedItem: selectLastModifiedItemId(state),
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
    skipReload: selectSkipReload(state),
    isNewRelations: selectIsNewRelations(state),
    userSettings: selectUserSettings(state),
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
    showToast,
    setWidgetCurrentTab,
};

export default compose<BodyProps, OwnProps>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Body);
