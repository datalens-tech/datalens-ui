import React from 'react';

import {ListUl} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {History, Location} from 'history';
import {I18n} from 'i18n';
import {ResolveThunks, connect} from 'react-redux';
import {EntryUpdateMode, Feature} from 'shared';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';
import {
    ActionPanel,
    DL,
    DatalensGlobalState,
    EntryDialogName,
    EntryDialogResolveStatus,
    EntryDialogues,
} from 'ui';
import {registry} from 'ui/registry';
import {closeDialog as closeDialogConfirm, openDialogConfirm} from 'ui/store/actions/dialog';
import {ValuesType} from 'utility-types';
import Utils from 'utils';

import {GetEntryResponse} from '../../../../../shared/schema';
import {
    EntryContextMenuItem,
    EntryContextMenuItems,
} from '../../../../components/EntryContextMenu/helpers';
import {isDraftVersion} from '../../../../components/Revisions/helpers';
import {RevisionEntry} from '../../../../components/Revisions/types';
import {ICONS_MENU_DEFAULT_SIZE} from '../../../../libs/DatalensChartkit/menu/MenuItems';
import navigateHelper from '../../../../libs/navigateHelper';
import {isEmbeddedMode} from '../../../../utils/embedded';
import {DIALOG_TYPE} from '../../containers/Dialogs/constants';
import {
    purgeData,
    saveDashAsDraft,
    saveDashAsNewDash,
    setActualDash,
    setDashViewMode,
    setDefaultViewState,
    setPageDefaultTabItems,
    setPublishDraft,
} from '../../store/actions/dashTyped';
import {
    selectDashAccessDescription,
    selectLoadingEditMode,
    selectRenameWithoutReload,
    selectStateMode,
} from '../../store/selectors/dashTypedSelectors';
import {DashEntry} from '../../typings/entry';

import {EditControls} from './EditControls/EditControls';
import {ViewControls} from './ViewControls/ViewControls';
import {cancelEditClick} from './helpers';

import './DashActionPanel.scss';

const b = block('dash-action-panel');
const i18n = I18n.keyset('dash.action-panel.view');

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type StateProps = ReturnType<typeof mapStateToProps>;

type OwnProps = {
    entry: DashEntry;
    canEdit: boolean;
    isEditMode: boolean;
    isDraft: boolean;
    hasTableOfContent: boolean;
    history: History;
    location: Location;
    progress: boolean;
    handlerEditClick: () => void;
    openDialog: (dialogType: ValuesType<typeof DIALOG_TYPE>) => void;
    toggleTableOfContent: () => void;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
};

export type ActionPanelProps = OwnProps & StateProps & DispatchProps;

type ActionPanelState = {};

class DashActionPanel extends React.PureComponent<ActionPanelProps, ActionPanelState> {
    render() {
        const {entry, isEditMode} = this.props;
        const showHeader = !isEmbeddedMode();
        const enablePublish = Utils.isEnabledFeature(Feature.EnablePublishEntry) && !entry?.fake;

        const DashSelectState = registry.dash.components.get('DashSelectState');

        return (
            <div className={b({editing: isEditMode})}>
                {showHeader && (
                    <React.Fragment>
                        <ActionPanel
                            entry={entry as GetEntryResponse}
                            additionalEntryItems={this.getAdditionalEntryItems()}
                            rightItems={[
                                <div className={b('controls')} key="controls">
                                    {this.renderControls()}
                                </div>,
                            ]}
                            enablePublish={enablePublish}
                            setActualVersion={this.handlerSetActualVersion}
                            isEditing={isEditMode}
                        />
                        {Boolean(DashSelectState) && <DashSelectState />}
                    </React.Fragment>
                )}
            </div>
        );
    }

    renderControls() {
        const {entry} = this.props;

        if (this.props.isSelectStateMode) {
            return null;
        }

        const saveDashHandler = entry?.fake
            ? this.handleSaveDash
            : this.handlerSaveAndPublishDashClick;

        return this.props.isEditMode ? (
            <EditControls
                revId={this.props.dashEntry.entry?.revId}
                publishedId={this.props.dashEntry.entry?.publishedId}
                onSaveAndPublishDashClick={saveDashHandler}
                onSaveAsDraftDashClick={this.handlerSaveAsDraftDashClick}
                onSaveAsNewClick={this.handlerSaveAsNewClick}
                onCancelClick={this.handlerCancelEditClick}
                onOpenDialogSettingsClick={this.openDialogSettings}
                onOpenDialogConnectionsClick={this.openDialogConnections}
                onOpenDialogTabsClick={this.openDialogTabs}
                entryDialoguesRef={this.props.entryDialoguesRef}
                isDraft={this.props.isDraft}
                isRenameWithoutReload={this.props.isRenameWithoutReload}
                loading={this.props.progress || this.props.isLoadingEditMode}
                showCancel={!entry?.fake}
                showSaveDropdown={!entry?.fake}
            />
        ) : (
            <ViewControls
                canEdit={this.props.canEdit}
                progress={this.props.progress}
                isLoadingEditMode={this.props.isLoadingEditMode}
                onEditClick={this.props.handlerEditClick}
                onAccessClick={this.openDialogAccess}
                entryDialoguesRef={this.props.entryDialoguesRef}
                isWorkbook={Boolean(entry && entry.workbookId)}
            />
        );
    }

    openDialogSettings = () => this.props.openDialog(DIALOG_TYPE.SETTINGS);
    openDialogConnections = () => this.props.openDialog(DIALOG_TYPE.CONNECTIONS);
    openDialogTabs = () => this.props.openDialog(DIALOG_TYPE.TABS);

    openDialogAccess = () => {
        if (
            Utils.isEnabledFeature(Feature.CustomAccessDescription) &&
            this.props.accessDescription &&
            !this.props.canEdit
        ) {
            this.props.entryDialoguesRef.current?.open?.({
                dialog: EntryDialogName.AccessDescription,
                dialogProps: {
                    accessDescription: this.props.accessDescription,
                },
            });
            return;
        }
        this.props.entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.Access,
            dialogProps: {
                entry: this.props.entry as GetEntryResponse,
            },
        });
    };

    handlerCancelEditClick = () => {
        cancelEditClick({
            isDraft: this.props.isDraft,
            setDefaultViewState: this.props.setDefaultViewState,
            openDialogConfirm: this.props.openDialogConfirm,
            closeDialogConfirm: this.props.closeDialogConfirm,
        });
    };

    handlerSaveAsNewClick = async () => {
        if (this.props.entryDialoguesRef.current) {
            const {entry, data, lockToken} = this.props.dashEntry;
            const response = await this.props.entryDialoguesRef.current.open({
                dialog: EntryDialogName.SaveAsNew,
                dialogProps: {
                    entryData: {
                        data: purgeData(data),
                        lockToken,
                        mode: EntryUpdateMode.Publish,
                        meta: {is_release: true},
                    },
                    initDestination: Utils.getPathBefore({path: entry.key}),
                    initName: Utils.getEntryNameFromKey(entry.key, true),
                    onSaveAsNewCallback: this.props.saveDashAsNewDash,
                    workbookId: entry.workbookId,
                },
            });

            if (response.status === EntryDialogResolveStatus.Success && response.data) {
                // browser blockes events which are not triggered by users (event.isTrusted)
                // https://www.w3.org/TR/DOM-Level-3-Events/#trusted-events
                navigateHelper.open(response.data);
            }
        }
    };

    handlerSetActualVersion = () => {
        const isDraftEntry = isDraftVersion(this.props.entry as RevisionEntry);
        if (isDraftEntry) {
            this.props.setPublishDraft();
        } else if (this.props.entryDialoguesRef.current) {
            this.props.entryDialoguesRef.current.open({
                dialog: EntryDialogName.SetActualConfirm,
                dialogProps: {
                    onConfirm: this.props.setActualDash,
                },
            });
        }
    };

    handlerSaveAsDraftDashClick = () => {
        this.props.saveDashAsDraft();
    };

    handlerSaveAndPublishDashClick = () => {
        this.props.setActualDash();
    };

    private getAdditionalEntryItems() {
        const {canEdit, hasTableOfContent, dashEntry, entry} = this.props;
        const {revId, publishedId} = dashEntry.entry;
        const isCurrentRevisionActual = revId === publishedId;

        const getSelectStateMenuItemFn = registry.common.functions.get('getSelectStateMenuItem');

        const selectStateMenuItem = getSelectStateMenuItemFn({
            action: this.onSelectStateClick,
            hidden: !canEdit || !isCurrentRevisionActual || DL.IS_MOBILE || Boolean(entry?.fake),
        });

        const items: EntryContextMenuItem[] = [
            {
                action: this.onValueTableOfContentsClick,
                text: i18n('value_table-of-content'),
                icon: <Icon data={ListUl} size={ICONS_MENU_DEFAULT_SIZE} />,
                qa: ActionPanelEntryContextMenuQa.TableOfContent,
                id: 'tableOfContent',
                hidden: !hasTableOfContent,
            },
        ];
        if (selectStateMenuItem) {
            items.push(selectStateMenuItem);
        }
        return items.filter((item) => !item.hidden) as EntryContextMenuItems | [];
    }

    private onSelectStateClick = () => {
        this.props.openDialog(DIALOG_TYPE.SELECT_STATE);
    };

    private onValueTableOfContentsClick = () => {
        this.props.toggleTableOfContent();
    };

    private handleSaveDash = async () => {
        const {entry, data} = this.props.dashEntry;
        const {getDashEntryUrl} = registry.dash.functions.getAll();

        const response = await this.props.entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.CreateDashboard,
            dialogProps: {
                workbookId: entry?.workbookId,
                initDestination: Utils.getPathBefore({path: entry.key}),
                data,
            },
        });

        if (response?.status === EntryDialogResolveStatus.Success) {
            this.props.setDashViewMode();
            const dashUrl = getDashEntryUrl(response);
            this.props.history.push(dashUrl);
        }
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        dashEntry: state.dash,
        isLoadingEditMode: selectLoadingEditMode(state),
        isRenameWithoutReload: selectRenameWithoutReload(state),
        isSelectStateMode: selectStateMode(state),
        accessDescription: selectDashAccessDescription(state),
    };
};

const mapDispatchToProps = {
    setDashViewMode,
    setActualDash,
    setPublishDraft,
    saveDashAsDraft,
    saveDashAsNewDash,
    setPageDefaultTabItems,
    setDefaultViewState,
    openDialogConfirm,
    closeDialogConfirm,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashActionPanel);
