import React from 'react';

import {Ellipsis, NodesRight} from '@gravity-ui/icons';
import {BreadcrumbsItem, Button, Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryDialogName, EntryDialogResolveStatus} from 'components/EntryDialogues';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {Dispatch, bindActionCreators} from 'redux';
import {ActionPanelQA} from 'shared';
import {DatalensGlobalState, EntryDialogues, sdk} from 'ui';
import {registry} from 'ui/registry';
import {addWorkbookInfo, resetWorkbookPermissions} from 'units/workbooks/store/actions';
import {selectWorkbookName} from 'units/workbooks/store/selectors';

import type {GetEntryResponse} from '../../../../../shared/schema';
import {DL} from '../../../../constants/common';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import Utils from '../../../../utils';
import EntryContextMenu, {EntryContextMenuProps} from '../../../EntryContextMenu/EntryContextMenu';
import {
    ICONS_ENTRY_MENU_DEFAULT_CLASSNAME,
    ICONS_ENTRY_MENU_DEFAULT_SIZE,
} from '../../../EntryContextMenu/EntryContextMenuBase/EntryContextMenuBase';
import {EntryContextMenuItems} from '../../../EntryContextMenu/helpers';
import {DialogSwitchPublicProps} from '../../../EntryDialogues/DialogSwitchPublic';
import NavigationModal from '../../../Navigation/NavigationModal';

import './EntryPanel.scss';

const i18n = I18n.keyset('component.action-panel.view');

const b = block('dl-entry-panel');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {
    additionalEntryItems: EntryContextMenuItems;
    entry?: GetEntryResponse;
    onCloseNavigation?: () => void;
    enablePublish?: boolean;
};

type Props = OwnProps & DispatchProps & StateProps & RouteComponentProps;

type State = {
    visibleEntryContextMenu?: boolean;
    isNavigationVisible?: boolean;
    entry?: GetEntryResponse;
    error?: Error;
    startFromNavigation?: string;
};

class EntryPanel extends React.Component<Props, State> {
    static defaultProps = {
        additionalEntryItems: [],
        enablePublish: false,
    };

    static getDerivedStateFromProps(props: Props, state: State): State | null {
        const {entry: entryState} = state;
        const {entry: entryProps} = props;

        if (entryState) {
            if (
                entryProps &&
                (entryState.entryId !== entryProps.entryId || entryState.key !== entryProps.key)
            ) {
                return {
                    entry: {
                        ...entryProps,
                    },
                };
            }

            if (!(entryState as {fake?: boolean}).fake) {
                return null;
            }
        }

        return {
            entry: {
                ...entryProps!,
            },
        };
    }

    state: State = {
        entry: undefined,
        startFromNavigation: '',
        visibleEntryContextMenu: false,
        isNavigationVisible: false,
    };

    private btnEntryContextMenuRef = React.createRef<HTMLButtonElement>();
    private entryDialogsRef = React.createRef<EntryDialogues>();
    private entryContextMenuRef = React.createRef<EntryContextMenuProps>();

    componentDidMount() {
        const workbookId = this.state.entry?.workbookId;

        if (workbookId) {
            this.props.actions.addWorkbookInfo(workbookId);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const workbookId = this.props.entry?.workbookId;
        const prevWorkbookId = prevProps.entry?.workbookId;

        if (prevWorkbookId !== workbookId && workbookId) {
            this.props.actions.addWorkbookInfo(workbookId);
        }

        if (prevWorkbookId && !workbookId) {
            this.props.actions.resetWorkbookPermissions();
        }
    }

    render() {
        const {children} = this.props;
        const {
            entry: {isFavorite} = {isFavorite: undefined},
            entry,
            isNavigationVisible,
        } = this.state;

        const isFakeEntry = (entry as any)?.fake;

        const additionalItems = this.getEntryContextMenuItems();

        const {EntryBreadcrumbs, ButtonFavorite} = registry.common.components.getAll();

        return (
            <React.Fragment>
                {this.renderEntryTitle()}
                <EntryBreadcrumbs
                    renderRootContent={this.renderRootContent}
                    entry={this.state.entry}
                    workbookName={this.props.workbookName}
                    openNavigationAction={this.openNavigation}
                />
                <div className={b()}>
                    {!DL.IS_MOBILE && (
                        <div className={b('entry-actions')}>
                            {!isFakeEntry && (
                                <ButtonFavorite
                                    className={b('action-btn', {active: isFavorite})}
                                    onClick={this.toggleFavorite}
                                    isFavorite={isFavorite}
                                />
                            )}
                            {!isFakeEntry || additionalItems.length ? (
                                <Button
                                    className={b('action-btn', b('more-dropdown'))}
                                    qa={ActionPanelQA.MoreBtn}
                                    size="m"
                                    view="flat"
                                    onClick={this.toggleEntryContextMenu}
                                    ref={this.btnEntryContextMenuRef}
                                >
                                    <Icon className={b('more')} data={Ellipsis} size={18} />
                                </Button>
                            ) : null}
                            <EntryContextMenu
                                entryDialogsRef={this.entryDialogsRef}
                                forwardRef={this.entryContextMenuRef}
                                onClose={this.onCloseEntryContextMenu}
                                anchorRef={this.btnEntryContextMenuRef}
                                visible={this.state.visibleEntryContextMenu}
                                entry={entry}
                                additionalItems={additionalItems}
                                showSpecificItems={true}
                            />
                        </div>
                    )}
                    {children}
                    <NavigationModal
                        sdk={sdk}
                        startFrom={this.getNavigationPath()}
                        resolvePathMode="key"
                        onClose={this.onCloseNavigation}
                        visible={Boolean(isNavigationVisible)}
                        currentPageEntry={entry}
                    />
                </div>
            </React.Fragment>
        );
    }

    toggleFavorite = () => {
        const entry = this.state.entry!;
        const {entryId, isFavorite} = entry;

        try {
            if (isFavorite) {
                getSdk()
                    .us.deleteFavorite({entryId})
                    .then(() =>
                        this.setState({
                            entry: {
                                ...entry,
                                isFavorite: false,
                            },
                        }),
                    );
                return;
            }
            getSdk()
                .us.addFavorite({entryId})
                .then(() =>
                    this.setState({
                        entry: {
                            ...entry,
                            isFavorite: true,
                        },
                    }),
                );
        } catch (error) {
            logger.logError('EntryPanel: toggleFavorite failed', error);
            this.setState({
                error,
            });
        }
    };

    onChangePublicClick = async () => {
        if (!this.state.entry || !this.entryDialogsRef.current) {
            return;
        }

        const result = await this.entryDialogsRef.current.open({
            dialog: EntryDialogName.SwitchPublic,
            dialogProps: {
                entry: this.state.entry as DialogSwitchPublicProps['entry'],
            },
        });

        if (result.status === EntryDialogResolveStatus.Success && result.data) {
            this.setState({
                entry: {
                    ...this.state.entry!,
                    public: Boolean(result.data?.publish),
                },
            });
        }
    };

    getNavigationPath() {
        return this.state.startFromNavigation || Utils.getPathBefore({path: this.state.entry!.key});
    }

    onCloseNavigation = () => {
        this.setState({
            isNavigationVisible: false,
            startFromNavigation: '',
        });
    };

    openNavigation = (startFromNavigation: string) => {
        this.setState({
            isNavigationVisible: true,
            startFromNavigation,
        });
    };

    onCloseEntryContextMenu = () => this.setState({visibleEntryContextMenu: false});

    toggleEntryContextMenu = () =>
        this.setState({visibleEntryContextMenu: !this.state.visibleEntryContextMenu});

    private getEntryContextMenuItems(): EntryContextMenuItems {
        const {enablePublish, additionalEntryItems} = this.props;
        const entry = this.state.entry!;
        const isAdmin = Boolean(entry.permissions?.admin);

        let disabled = false;

        if ((entry as any).fake) {
            disabled = true;
        }

        const items = [...additionalEntryItems];

        if (isAdmin && enablePublish && !disabled) {
            items.push({
                icon: (
                    <Icon
                        data={NodesRight}
                        className={ICONS_ENTRY_MENU_DEFAULT_CLASSNAME}
                        width={ICONS_ENTRY_MENU_DEFAULT_SIZE}
                        height={ICONS_ENTRY_MENU_DEFAULT_SIZE}
                    />
                ),
                text: i18n('button_switch-public'),
                action: this.onChangePublicClick,
                id: 'public',
            });
        }

        return items;
    }

    private renderRootContent = (rootItem: BreadcrumbsItem) => {
        if ((this.props.entry as any | undefined)?.fake) {
            return rootItem.text;
        }

        return (
            <Link
                key={rootItem.text}
                view="secondary"
                href={rootItem.href}
                title={rootItem.text}
                onClick={rootItem.action}
                className={b('item')}
            >
                {rootItem.text}
            </Link>
        );
    };

    private renderEntryTitle = () => {
        const {ActionPanelEntrySelect} = registry.common.components.getAll();

        return <ActionPanelEntrySelect className={b('entry-title')} />;
    };
}

const mapStateToProps = (state: DatalensGlobalState, ownProps: OwnProps) => {
    const workbookId = ownProps.entry?.workbookId || '';

    return {
        workbookName: selectWorkbookName(state, workbookId),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                addWorkbookInfo,
                resetWorkbookPermissions,
            },
            dispatch,
        ),
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EntryPanel));
