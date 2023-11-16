import React from 'react';

import {
    ConfigItem,
    DashKit as DashKitComponent,
    DashKitProps,
    ActionPanel as DashkitActionPanel,
    ActionPanelItem as DashkitActionPanelItem,
    MenuItems,
} from '@gravity-ui/dashkit';
import {ChartColumn, CopyPlus, Gear, Heading, Sliders, TextAlignLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryDialogues} from 'components/EntryDialogues';
import {Search} from 'history';
import {i18n} from 'i18n';
import PaletteEditor from 'libs/DatalensChartkit/components/Palette/PaletteEditor/PaletteEditor';
import logger from 'libs/logger';
import {getSdk} from 'libs/schematic-sdk';
import debounce from 'lodash/debounce';
import {ResolveThunks, connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {ControlQA, DashData, DashTab, DashTabItem, DashboardAddWidgetQa, Feature} from 'shared';
import {DatalensGlobalState} from 'ui';
import {selectAsideHeaderIsCompact} from 'ui/store/selectors/asideHeader';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {getConfiguredDashKit} from '../../../../components/DashKit/DashKit';
import {DL} from '../../../../constants';
import SDK from '../../../../libs/sdk';
import Utils from '../../../../utils';
import {EmptyState} from '../../components/EmptyState/EmptyState';
import Loader from '../../components/Loader/Loader';
import {Mode} from '../../modules/constants';
import {
    CopiedConfigData,
    getLayoutMap,
    getPastedWidgetData,
    memoizedGetLocalTabs,
    sortByOrderIdOrLayoutComparator,
    stringifyMemoize,
} from '../../modules/helpers';
import {openDialog, openItemDialog, setCurrentTabData} from '../../store/actions/dash';
import {
    TabsHashStates,
    setDashKitRef,
    setErrorMode,
    setHashState,
    setStateHashId,
} from '../../store/actions/dashTyped';
import {
    closeDialogRelations,
    openDialogRelations,
    setNewRelations,
} from '../../store/actions/relations/actions';
import {
    canEdit,
    selectCurrentTab,
    selectCurrentTabId,
    selectEntryId,
    selectSettings,
    selectShowTableOfContent,
    selectTabHashState,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';
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
    onPasteItem: (data: CopiedConfigData) => void;
    isEditModeLoading: boolean;
};

type DashBodyState = {
    hasCopyInBuffer: CopiedConfigData | null;
};

type BodyProps = StateProps & DispatchProps & RouteComponentProps & OwnProps;

// TODO: add issue
type OverlayControls = NonNullable<DashKitProps['overlayControls']>;
type OverlayControlItem = OverlayControls[keyof OverlayControls][0];

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
    }, 1000);

    getUrlGlobalParams = stringifyMemoize((search, globalParams) => {
        if (!search || !globalParams) {
            return null;
        }
        const searchParams = new URLSearchParams(search as Search);
        return Object.keys(globalParams).reduce(
            (result, key) =>
                searchParams.has(key) ? {...result, [key]: searchParams.getAll(key)} : result,
            {},
        );
    });

    state: DashBodyState = {
        hasCopyInBuffer: null,
    };

    componentDidMount() {
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
            this.onStateChange(
                itemsStateAndParams as TabsHashStates,
                config as unknown as DashData,
            );
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
                onClick: () => {
                    this.props.openDialog(DIALOG_TYPE.WIDGET);
                },
                qa: DashboardAddWidgetQa.AddWidget,
            },
            {
                id: 'selector',
                icon: <Icon data={Sliders} />,
                title: i18n('dash.main.view', 'button_edit-panel-selector'),
                className: b('edit-panel-item'),
                onClick: () => {
                    this.props.openDialog(DIALOG_TYPE.CONTROL);
                },
                qa: DashboardAddWidgetQa.AddControl,
            },
            {
                id: 'text',
                icon: <Icon data={TextAlignLeft} />,
                title: i18n('dash.main.view', 'button_edit-panel-text'),
                className: b('edit-panel-item'),
                onClick: () => {
                    this.props.openDialog(DIALOG_TYPE.TEXT);
                },
                qa: DashboardAddWidgetQa.AddText,
            },
            {
                id: 'header',
                icon: <Icon data={Heading} />,
                title: i18n('dash.main.view', 'button_edit-panel-title'),
                className: b('edit-panel-item'),
                onClick: () => {
                    this.props.openDialog(DIALOG_TYPE.TITLE);
                },
                qa: DashboardAddWidgetQa.AddTitle,
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
            });
        }
        return items;
    }

    onStateChange = (hashStates: TabsHashStates, config: DashData) => {
        this.props.setHashState(hashStates, config);
        this.updateUrlHashState(hashStates, this.props.tabId);
    };

    renderBody() {
        const {
            mode,
            settings,
            tabs,
            showTableOfContent,
            tabData,
            handlerEditClick,
            isEditModeLoading,
            isSidebarOpened,
        } = this.props;

        switch (mode) {
            case Mode.Loading:
            case Mode.Updating:
                return <Loader size="l" />;
            case Mode.Error:
                return <Error />;
        }

        const localTabs = memoizedGetLocalTabs(tabs);

        const hasTableOfContent = !(localTabs.length === 1 && !localTabs[0].items.length);

        let tabDataConfig = tabData as DashKitProps['config'] | null;

        const isEmptyTab = !tabDataConfig?.items.length;

        if (DL.IS_MOBILE && tabData) {
            const [layoutMap, layoutColumns] = getLayoutMap(tabData.layout);
            tabDataConfig = {
                ...tabData,
                items: (tabData.items as DashTab['items'])
                    .sort((prev, next) =>
                        sortByOrderIdOrLayoutComparator(prev, next, layoutMap, layoutColumns),
                    )
                    .map((item, index) => ({
                        ...item,
                        orderId: item.orderId || index,
                    })) as ConfigItem[],
            };
        }

        const overlayControls: DashKitProps['overlayControls'] = Utils.isEnabledFeature(
            Feature.ShowNewRelations,
        )
            ? {
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
              }
            : {};

        const DashKit = getConfiguredDashKit();

        const showEditActionPanel = mode === Mode.Edit;

        return (
            <div className={b('content-wrapper')}>
                {!settings.hideDashTitle && !DL.IS_MOBILE && (
                    <div className={b('entry-name')} data-qa="dash-entry-name">
                        {Utils.getEntryNameFromKey(this.props.entry?.key)}
                    </div>
                )}
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
                        })}
                    >
                        {!settings.hideTabs && <Tabs />}
                        {isEmptyTab ? (
                            <EmptyState
                                openDialog={this.props.openDialog}
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
                                itemsStateAndParams={
                                    this.props.hashStates as DashKitProps['itemsStateAndParams']
                                }
                                onItemEdit={this.props.openItemDialog}
                                onChange={this.onChange}
                                settings={settings as DashKitProps['settings']}
                                defaultGlobalParams={settings.globalParams}
                                globalParams={
                                    this.getUrlGlobalParams(
                                        this.props.location.search,
                                        this.props.settings.globalParams,
                                    ) as DashKitProps['globalParams']
                                }
                                overlayControls={overlayControls}
                            />
                        )}
                        {showEditActionPanel && (
                            <DashkitActionPanel
                                items={this.getActionPanelItems()}
                                className={b('edit-panel', {
                                    'aside-opened': isSidebarOpened,
                                })}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }

    render() {
        const content = this.renderBody();
        return (
            <div className={b()}>
                {content}
                <PaletteEditor />
                <EntryDialogues sdk={getSdk() as unknown as SDK} ref={this.entryDialoguesRef} />
            </div>
        );
    }

    storageHandler = () => {
        this.setState({hasCopyInBuffer: getPastedWidgetData()});
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
});

const mapDispatchToProps = {
    setErrorMode,
    setCurrentTabData,
    openItemDialog,
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
