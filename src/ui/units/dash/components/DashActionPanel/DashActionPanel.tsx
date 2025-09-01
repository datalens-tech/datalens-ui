import React from 'react';

import {ListUl} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {History, Location} from 'history';
import {I18n} from 'i18n';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {Feature} from 'shared';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';
import type {DatalensGlobalState, EntryDialogues} from 'ui';
import {ActionPanel, DL, EntryDialogName, EntryDialogResolveStatus} from 'ui';
import {registry} from 'ui/registry';
import {closeDialog as closeDialogConfirm, openDialogConfirm} from 'ui/store/actions/dialog';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {isDraftVersion} from 'ui/utils/revisions';
import Utils from 'ui/utils/utils';
import type {ValuesType} from 'utility-types';

import type {GetEntryResponse} from '../../../../../shared/schema';
import type {
    EntryContextMenuItem,
    EntryContextMenuItems,
} from '../../../../components/EntryContextMenu/helpers';
import type {RevisionEntry} from '../../../../components/Revisions/types';
import {DIALOG_TYPE} from '../../../../constants/dialogs';
import {ICONS_MENU_DEFAULT_SIZE} from '../../../../libs/DatalensChartkit/menu/MenuItems';
import navigateHelper from '../../../../libs/navigateHelper';
import {isEmbeddedMode} from '../../../../utils/embedded';
import {
    saveDashAsDraft,
    saveDashAsNewDash,
    setActualDash,
    setDashViewMode,
    setDefaultViewState,
    setPageDefaultTabItems,
    setPublishDraft,
    updateDeprecatedDashConfig,
} from '../../store/actions/dashTyped';
import {isDeprecatedDashData} from '../../store/actions/helpers';
import {openEmptyDialogRelations} from '../../store/actions/relations/actions';
import {DASH_EDIT_HISTORY_UNIT_ID} from '../../store/constants';
import {
    selectDashAccessDescription,
    selectDashShowOpenedDescription,
    selectLoadingEditMode,
    selectStateMode,
} from '../../store/selectors/dashTypedSelectors';
import type {DashEntry} from '../../typings/entry';

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
    canGoBack: boolean;
    canGoForward: boolean;
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
        const enablePublish = isEnabledFeature(Feature.EnablePublishEntry) && !entry?.fake;

        const DashSelectState = registry.dash.components.get('DashSelectState');
        const DashActionPanelAdditionalButtons = registry.dash.components.get(
            'DashActionPanelAdditionalButtons',
        );

        let deprecationWarning = null;
        if (this.isDeprecated()) {
            deprecationWarning = {
                message: i18n('label_deprecation-warning'),
                onConfirm: this.openDialogUpdateDeprecatedConfig,
            };
        }

        return (
            <div className={b({editing: isEditMode})}>
                {showHeader && (
                    <React.Fragment>
                        <ActionPanel
                            entry={entry as GetEntryResponse}
                            additionalEntryItems={this.getAdditionalEntryItems()}
                            rightItems={[
                                <DashActionPanelAdditionalButtons key="additional-buttons" />,
                                <div className={b('controls')} key="controls">
                                    {this.renderControls()}
                                </div>,
                            ]}
                            enablePublish={enablePublish}
                            setActualVersion={this.handlerSetActualVersion}
                            isEditing={isEditMode}
                            deprecationWarning={deprecationWarning}
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
                canGoBack={this.props.canGoBack}
                canGoForward={this.props.canGoForward}
                onGoBack={this.handleGoBack}
                onGoForward={this.handleGoForward}
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
                showOpenedDescription={this.props.showOpenedDescription}
            />
        );
    }

    openDialogSettings = () => this.props.openDialog(DIALOG_TYPE.SETTINGS);
    openDialogConnections = () => this.props.openEmptyDialogRelations();
    openDialogTabs = () => this.props.openDialog(DIALOG_TYPE.TABS);

    openDialogAccess = () => {
        if (this.props.accessDescription && !this.props.canEdit) {
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

    openDialogUpdateDeprecatedConfig = () => {
        this.props.openDialogConfirm({
            onApply: this.handleUpdateDeprecatedConfig,
            onCancel: this.props.closeDialogConfirm,
            message: i18n('dialog_deprecation-confirm-text'),
            confirmHeaderText: i18n('dialog_deprecation-confirm-header'),
            confirmButtonText: i18n('dialog_deprecation-apply-label'),
            cancelButtonText: i18n('dialog_deprecation-cancel-label'),
            cancelButtonView: 'flat',
            confirmButtonView: 'normal',
            isWarningConfirm: true,
            showAlert: true,
            confirmOnEnterPress: true,
        });
    };

    handleUpdateDeprecatedConfig = () => {
        this.props.updateDeprecatedDashConfig();
        this.props.closeDialogConfirm();
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
            const {entry} = this.props.dashEntry;
            const response = await this.props.entryDialoguesRef.current.open({
                dialog: EntryDialogName.SaveAsNew,
                dialogProps: {
                    entryId: this.props.entry.entryId,
                    initDestination: Utils.getPathBefore({path: entry.key}),
                    initName: Utils.getEntryNameFromKey(entry.key, true),
                    onSaveAsNewCallback: this.props.saveDashAsNewDash,
                    workbookId: entry.workbookId,
                    warningMessage: this.isDeprecated()
                        ? i18n('dialog_deprecation-copy-text')
                        : null,
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

    private handleGoBack = () => {
        if (this.props.canGoBack) {
            this.props.goBack({unitId: DASH_EDIT_HISTORY_UNIT_ID});
        }
    };
    private handleGoForward = () => {
        if (this.props.canGoForward) {
            this.props.goForward({unitId: DASH_EDIT_HISTORY_UNIT_ID});
        }
    };

    private handleSaveDash = async () => {
        const {entry, data, annotation} = this.props.dashEntry;
        const {getDashEntryUrl} = registry.dash.functions.getAll();

        const response = await this.props.entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.CreateDashboard,
            dialogProps: {
                workbookId: entry?.workbookId,
                initDestination: Utils.getPathBefore({path: entry.key}),
                data,
                description: annotation?.description,
            },
        });

        if (response?.status === EntryDialogResolveStatus.Success) {
            this.props.setDashViewMode();
            const dashUrl = getDashEntryUrl(response);
            this.props.history.push(dashUrl);
        }
    };

    private isDeprecated() {
        const {dashEntry} = this.props;

        return Boolean(dashEntry?.data) && isDeprecatedDashData(dashEntry.data);
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        dashEntry: state.dash,
        isLoadingEditMode: selectLoadingEditMode(state),
        isRenameWithoutReload: selectIsRenameWithoutReload(state),
        isSelectStateMode: selectStateMode(state),
        accessDescription: selectDashAccessDescription(state),
        showOpenedDescription: selectDashShowOpenedDescription(state),
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
    updateDeprecatedDashConfig,
    openDialogConfirm,
    openEmptyDialogRelations,
    closeDialogConfirm,
    goBack,
    goForward,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashActionPanel);
