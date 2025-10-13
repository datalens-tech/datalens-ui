import React from 'react';

import {Ellipsis, Globe} from '@gravity-ui/icons';
import {Button, Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryDialogName, EntryDialogResolveStatus} from 'components/EntryDialogues';
import {I18n} from 'i18n';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {ActionPanelQA, EntryScope} from 'shared';
import type {DatalensGlobalState, EntryDialogues} from 'ui';
import type {FilterEntryContextMenuItems} from 'ui/components/EntryContextMenu';
import {CounterName, GoalId, reachMetricaGoal} from 'ui/libs/metrica';
import {registry} from 'ui/registry';
import type {BreadcrumbsItem} from 'ui/registry/units/common/types/components/EntryBreadcrumbs';
import {addWorkbookInfo, resetWorkbookPermissions} from 'units/workbooks/store/actions';
import {selectWorkbookBreadcrumbs, selectWorkbookName} from 'units/workbooks/store/selectors';

import type {GetEntryResponse} from '../../../../../shared/schema';
import {DL} from '../../../../constants/common';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import type {EntryContextMenuProps} from '../../../EntryContextMenu/EntryContextMenu';
import EntryContextMenu from '../../../EntryContextMenu/EntryContextMenu';
import {
    ICONS_ENTRY_MENU_DEFAULT_CLASSNAME,
    ICONS_ENTRY_MENU_DEFAULT_SIZE,
} from '../../../EntryContextMenu/EntryContextMenuBase/EntryContextMenuBase';
import type {EntryContextMenuItems} from '../../../EntryContextMenu/helpers';
import type {DialogSwitchPublicProps} from '../../../EntryDialogues/DialogSwitchPublic';

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
    filterEntryContextMenuItems?: FilterEntryContextMenuItems;
};

type Props = OwnProps & DispatchProps & StateProps & RouteComponentProps;

type State = {
    visibleEntryContextMenu?: boolean;
    entry?: GetEntryResponse;
    error?: Error;
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
        visibleEntryContextMenu: false,
    };

    private btnEntryContextMenuRef = React.createRef<HTMLButtonElement>();
    private entryDialogsRef = React.createRef<EntryDialogues>();
    private entryContextMenuRef = React.createRef<EntryContextMenuProps>();

    componentDidMount() {
        const workbookId = this.state.entry?.workbookId;

        if (workbookId) {
            this.props.actions.addWorkbookInfo(workbookId, true);
        }
    }

    componentDidUpdate(prevProps: Props) {
        const workbookId = this.props.entry?.workbookId;
        const prevWorkbookId = prevProps.entry?.workbookId;

        if (prevWorkbookId !== workbookId && workbookId) {
            this.props.actions.addWorkbookInfo(workbookId, true);
        }

        if (prevWorkbookId && !workbookId) {
            this.props.actions.resetWorkbookPermissions();
        }
    }

    render() {
        const {children, workbookName, workbookBreadcrumbs} = this.props;
        const {EntryBreadcrumbs} = registry.common.components.getAll();

        return (
            <React.Fragment>
                {this.renderEntryTitle()}
                <EntryBreadcrumbs
                    renderRootContent={this.renderRootContent}
                    entry={this.state.entry}
                    workbookName={workbookName}
                    workbookBreadcrumbs={workbookBreadcrumbs}
                    endContent={
                        <React.Fragment>
                            {this.renderControls()}
                            <div className={b()}>{children}</div>
                        </React.Fragment>
                    }
                />
            </React.Fragment>
        );
    }

    renderControls() {
        if (DL.IS_MOBILE) {
            return null;
        }

        const {entry: {isFavorite} = {isFavorite: undefined}, entry} = this.state;

        const isFakeEntry = (entry as any)?.fake;

        const additionalItems = this.getEntryContextMenuItems();

        const {ButtonFavorite} = registry.common.components.getAll();

        return (
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
                {this.btnEntryContextMenuRef.current && (
                    <EntryContextMenu
                        entryDialogsRef={this.entryDialogsRef}
                        forwardRef={this.entryContextMenuRef}
                        onClose={this.onCloseEntryContextMenu}
                        anchorElement={this.btnEntryContextMenuRef.current}
                        visible={this.state.visibleEntryContextMenu}
                        entry={entry}
                        additionalItems={additionalItems}
                        showSpecificItems={true}
                        filterEntryContextMenuItems={this.props.filterEntryContextMenuItems}
                    />
                )}
            </div>
        );
    }

    toggleFavorite = () => {
        const entry = this.state.entry!;
        const {entryId, isFavorite} = entry;

        try {
            if (isFavorite) {
                getSdk()
                    .sdk.us.deleteFavorite({entryId})
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
                .sdk.us.addFavorite({entryId})
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

        if (this.state.entry.scope === EntryScope.Dash) {
            reachMetricaGoal(CounterName.Main, GoalId.DashboardPublicAccessClick);
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
                        data={Globe}
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
        if (rootItem.href) {
            return (
                <Link
                    key={rootItem.text}
                    view="secondary"
                    href={rootItem.href}
                    title={rootItem.text}
                    onClick={rootItem.action}
                    className={b('item', {link: true})}
                >
                    {rootItem.text}
                </Link>
            );
        }

        return (
            <div key={rootItem.text} className={b('item')}>
                {rootItem.text}
            </div>
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
        workbookBreadcrumbs: selectWorkbookBreadcrumbs(state),
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
