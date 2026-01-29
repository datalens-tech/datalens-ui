import React from 'react';

import type {
    ConfigItem,
    ConfigLayout,
    DashKitGroup,
    DashKitProps,
    DashkitGroupRenderProps,
    ReactGridLayoutProps,
} from '@gravity-ui/dashkit';
import {DEFAULT_GROUP} from '@gravity-ui/dashkit/helpers';
import {
    ChevronsDown,
    ChevronsLeft,
    ChevronsRight,
    ChevronsUp,
    Gear,
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
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DashTab, DashTabLayout} from 'shared';
import {
    Feature,
    FixedHeaderQa,
    SCROLL_TITLE_DEBOUNCE_TIME,
    SCR_USER_AGENT_HEADER_VALUE,
} from 'shared';
import {getAllTabItems} from 'shared/utils/dash';
import type {DatalensGlobalState} from 'ui';
import {
    DEFAULT_DASH_MARGINS,
    FIXED_GROUP_CONTAINER_ID,
    FIXED_GROUP_HEADER_ID,
} from 'ui/components/DashKit/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {Mode} from '../../modules/constants';
import type {CopiedConfigData} from '../../modules/helpers';
import {getLayoutMap, getLayoutParentId} from '../../modules/helpers';
import {setCurrentTabData, setErrorMode} from '../../store/actions/dashTyped';
import {
    selectCurrentTab,
    selectCurrentTabId,
    selectEntryId,
    selectLastModifiedItemId,
    selectSettings,
} from '../../store/selectors/dashTypedSelectors';
import {dispatchDashLoadedEvent} from '../../utils/customEvents';
import {getCustomizedProperties} from '../../utils/dashkitProps';
import {scrollIntoView} from '../../utils/scrollUtils';
import {FixedHeaderContainer, FixedHeaderControls} from '../FixedHeader/FixedHeader';

import Content from './components/Content/Content';
import {FixedContainerWrapperWithContext, FixedControlsWrapperWithContext} from './context';

import './Body.scss';

const VIEWPORT_DASH_LOADED_EVENT_DEBOUNCE_TIME = 1000;

// Do not change class name, the snapter service uses
const b = block('dash-body');

const isMobileFixedHeaderEnabled = isEnabledFeature(Feature.EnableMobileFixedHeader);

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;
export type OwnProps = {
    isPublicMode?: boolean;
    isSplitPaneLayout?: boolean;
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
    dashEl: HTMLDivElement | null;
    isGlobalDragging: boolean;
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
    totalItemsCount: number;
};

type BodyProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

type MemoContext = {
    fixedHeaderCollapsed?: boolean;
    isEmbeddedMode?: boolean;
    isPublicMode?: boolean;
    workbookId?: string | null;
    enableAssistant?: boolean;
    // used in group selectors plugin
    currentTabId?: string | null;
};
type DashkitGroupRenderWithContextProps = DashkitGroupRenderProps & {context: MemoContext};

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

        const newTotalItemsCount = getAllTabItems(props.tabData).length;
        if (newTotalItemsCount !== state.totalItemsCount) {
            updatedState.totalItemsCount = newTotalItemsCount;
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

    entryDialoguesRef = React.createRef<EntryDialogues>();

    scrollIntoViewWithDebounce = debounce(() => {
        if (this.state.delayedScrollElement) {
            const lastDelayedScrollTop = scrollIntoView(
                this.state.delayedScrollElement,
                this.state.lastDelayedScrollTop,
            );
            this.setState({lastDelayedScrollTop});
        }
    }, SCROLL_TITLE_DEBOUNCE_TIME);

    dispatchViewportDashLoadedEventDebounced = debounce(() => {
        return this.dispatchViewportDashLoadedEvent();
    }, VIEWPORT_DASH_LOADED_EVENT_DEBOUNCE_TIME);

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
    _memoizedPropertiesCache: Map<string, ReactGridLayoutProps> = new Map();

    state: DashBodyState;

    constructor(props: BodyProps) {
        super(props);

        this.state = {
            fixedHeaderCollapsed: {},
            dashEl: null,
            isGlobalDragging: false,
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
                        gridProperties: this.getMemorizedCustomizedProperties('fixed-header'),
                    },
                    {
                        id: FIXED_GROUP_CONTAINER_ID,
                        render: this.renderFixedGroupContainer,
                        gridProperties: this.getMemorizedCustomizedProperties('fixed-container'),
                    },
                    {
                        id: DEFAULT_GROUP,
                        gridProperties: this.getMemorizedCustomizedProperties('default-group'),
                    },
                ],
            },
            totalItemsCount: 0,
        };
    }

    componentDidMount() {
        if (this.props.location.hash && !this.props.disableHashNavigation) {
            this.setState({delayedScrollElement: this.props.location.hash.replace('#', '')});
        }

        window.addEventListener('wheel', this.interruptAutoScroll);
        window.addEventListener('touchmove', this.interruptAutoScroll);

        this.updateMargins();
    }

    componentDidUpdate() {
        this.updateMargins();
    }

    componentDidCatch(error: Error) {
        logger.logError('Dash.Body componentDidCatch', error);
        this.props.setErrorMode(error);
    }

    componentWillUnmount() {
        window.removeEventListener('wheel', this.interruptAutoScroll);
        window.removeEventListener('touchmove', this.interruptAutoScroll);
        this.scrollIntoViewWithDebounce.cancel();
        this.dispatchViewportDashLoadedEventDebounced.cancel();
    }

    render() {
        return (
            <div
                className={b({'split-pane': this.props.isSplitPaneLayout})}
                ref={this._dashBodyRef}
            >
                <Content
                    dashEntryKey={this.props.entry?.key}
                    disableHashNavigation={this.props.disableHashNavigation}
                    hideErrorDetails={this.props.hideErrorDetails}
                    isCondensed={this.isCondensed()}
                    loaded={this.state.loaded}
                    mode={this.props.mode}
                    onDragEnd={this.handleDragEnd}
                    onDragStart={this.handleDragStart}
                    onItemClick={this.handleTocItemClick}
                    onRetry={this.props.onRetry}
                    dashEl={this.state.dashEl}
                    dashkitSettings={this.props.dashkitSettings}
                    disableUrlState={this.props.disableUrlState}
                    globalParams={this.props.globalParams}
                    groupsRenderers={this.state.groups.renderers}
                    hasFixedHeaderContainerElements={Boolean(
                        this.getWidgetLayoutByGroup(FIXED_GROUP_CONTAINER_ID)?.length,
                    )}
                    hasFixedHeaderControlsElements={Boolean(
                        this.getWidgetLayoutByGroup(FIXED_GROUP_HEADER_ID)?.length,
                    )}
                    isEditModeLoading={this.props.isEditModeLoading}
                    isFixedHeaderCollapsed={this.getFixedHeaderCollapsedState()}
                    isPublicMode={this.props.isPublicMode}
                    isSplitPaneLayout={this.props.isSplitPaneLayout}
                    isGlobalDragging={this.state.isGlobalDragging}
                    getGroupsInsertCoords={this.getGroupsInsertCoords}
                    getWidgetLayoutById={this.getWidgetLayoutById}
                    handleEditClick={this.props.handlerEditClick}
                    onItemMountChange={this.handleItemMountChange}
                    onItemRender={this.handleItemRender}
                    onWidgetMountChange={this.itemAddHandler}
                    {...(this.props.onlyView
                        ? {onlyView: this.props.onlyView, onPasteItem: undefined}
                        : {onlyView: this.props.onlyView, onPasteItem: this.props.onPasteItem})}
                />
                <PaletteEditor />
                <EntryDialogues ref={this.entryDialoguesRef} />
            </div>
        );
    }

    _dashBodyRef: React.RefCallback<HTMLDivElement> = (el) => {
        this.setState({dashEl: el});
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
                            gridProperties: this.getMemorizedCustomizedProperties(
                                `${group.id}-update`,
                                {margin: propsMargins},
                            ),
                        };
                    }),
                },
            });
        }
    }

    getMemorizedCustomizedProperties = (
        id: string,
        extendedProps: Partial<ReactGridLayoutProps> | undefined = {},
    ) => {
        return (props: ReactGridLayoutProps) => {
            const updatedResult = getCustomizedProperties(props, extendedProps);

            const cachedResult = this._memoizedPropertiesCache.get(id);

            if (!isEqual(cachedResult, updatedResult) || !cachedResult) {
                this._memoizedPropertiesCache.set(id, updatedResult);

                return updatedResult;
            }

            return cachedResult;
        };
    };

    isCondensed = () => {
        return this.state.groups.margins[0] === 0 || this.state.groups.margins[1] === 0;
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

    getWidgetLayoutById = (widgetId: string) => {
        return this.getMemoLayoutMap().byId[widgetId];
    };

    getWidgetLayoutByGroup = (groupId: string) => {
        return this.getMemoLayoutMap().byGroup[groupId];
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

        if (params.isMobile && !isMobileFixedHeaderEnabled) {
            return children;
        }

        const {fixedHeaderCollapsed = false} = params.context;

        const content = params.isMobile ? (
            children
        ) : (
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
            </FixedHeaderControls>
        );

        return <FixedControlsWrapperWithContext content={content} />;
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

        if (params.isMobile && !isMobileFixedHeaderEnabled) {
            return children;
        }

        const content = params.isMobile ? (
            children
        ) : (
            <FixedHeaderContainer
                isEmpty={isEmpty}
                isControlsGroupEmpty={!hasFixedHeaderElements}
                key={`${id}_${this.props.tabId}`}
                editMode={params.editMode}
            >
                {children}
            </FixedHeaderContainer>
        );

        return <FixedContainerWrapperWithContext content={content} />;
    };

    interruptAutoScroll = (event: Event) => {
        if (event.isTrusted && this.state.delayedScrollElement) {
            this.setState({delayedScrollElement: null, lastDelayedScrollTop: null});
        }
    };

    private isEditMode() {
        return this.props.mode === Mode.Edit;
    }

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

    private handleDragStart = () => {
        this.setState({isGlobalDragging: true});
    };

    private handleDragEnd = () => {
        this.setState({isGlobalDragging: false});
    };

    private handleItemMountChange = (item: ConfigItem, {isMounted}: {isMounted: boolean}) => {
        if (isMounted) {
            this.state.loadedItemsMap.set(item.id, false);

            if (this.state.loadedItemsMap.size === this.state.totalItemsCount) {
                this.scrollIntoViewWithDebounce();
            }
        }
    };

    private isElementOutsideViewport = (element: Element): boolean => {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        return (
            rect.bottom < 0 ||
            rect.top > viewportHeight ||
            rect.right < 0 ||
            rect.left > viewportWidth
        );
    };

    private dispatchViewportDashLoadedEvent = () => {
        const {loadedItemsMap, dashEl} = this.state;

        if (!dashEl) {
            return;
        }

        const unloadedItemIds: string[] = [];
        loadedItemsMap.forEach((isLoaded, itemId) => {
            if (isLoaded !== true) {
                unloadedItemIds.push(itemId);
            }
        });

        const allViewportItemsLoaded = unloadedItemIds.every((itemId) => {
            const itemElement = document.getElementById(itemId);
            if (!itemElement) {
                return false;
            }
            const result = this.isElementOutsideViewport(itemElement);
            return result;
        });

        if (allViewportItemsLoaded) {
            dispatchDashLoadedEvent();
        }
    };

    private handleItemRender = (item: ConfigItem) => {
        const {loadedItemsMap} = this.state;

        if (loadedItemsMap.has(item.id) && loadedItemsMap.get(item.id) !== true) {
            loadedItemsMap.set(item.id, true);

            const isLoaded =
                loadedItemsMap.size === this.state.totalItemsCount &&
                Array.from(loadedItemsMap.values()).every(Boolean);

            if (isLoaded && this.state.delayedScrollElement) {
                scrollIntoView(this.state.delayedScrollElement, this.state.lastDelayedScrollTop);
                this.setState({delayedScrollElement: null, lastDelayedScrollTop: null});
            } else {
                // if the dash is not fully loaded, we are starting a scroll chain
                // that will try to scroll to the title after each item rendering
                this.scrollIntoViewWithDebounce();
            }

            if (isLoaded) {
                this.dispatchViewportDashLoadedEventDebounced.cancel();
                dispatchDashLoadedEvent();
            } else if (navigator.userAgent === SCR_USER_AGENT_HEADER_VALUE) {
                this.dispatchViewportDashLoadedEventDebounced();
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
}

const mapStateToProps = (state: DatalensGlobalState) => ({
    entryId: selectEntryId(state),
    lastModifiedItem: selectLastModifiedItemId(state),
    entry: state.dash.entry,
    mode: state.dash.mode,
    settings: selectSettings(state),
    tabData: selectCurrentTab(state),
    tabId: selectCurrentTabId(state),
});

const mapDispatchToProps = {
    setErrorMode,
    setCurrentTabData,
};

export default compose<BodyProps, OwnProps>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(Body);
