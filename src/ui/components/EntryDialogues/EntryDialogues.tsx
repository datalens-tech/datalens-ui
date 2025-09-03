import React from 'react';

import noop from 'lodash/noop';
import type {DialogShareProps} from 'ui/registry/units/common/types/components/DialogShare';

import type SDK from '../../libs/sdk';
import {sdk} from '../../libs/sdk';
import {registry} from '../../registry';
import {DialogRelatedEntities} from '../DialogRelatedEntities/DialogRelatedEntities';

import type {DialogAccessProps} from './DialogAccess/DialogAccess';
import {DialogAccess} from './DialogAccess/DialogAccess';
import type {DialogAccessDescriptionProps} from './DialogAccessDescription/DialogAccessDescription';
import {DialogAccessDescription} from './DialogAccessDescription/DialogAccessDescription';
import type {DialogCopyEntryProps} from './DialogCopyEntry';
import {DialogCopyEntry} from './DialogCopyEntry';
import type {DialogCreateDashboardProps} from './DialogCreateDashboard';
import {DialogCreateDashboard} from './DialogCreateDashboard';
import type {DialogCreateEditorChartProps} from './DialogCreateEditorChart';
import {DialogCreateEditorChart} from './DialogCreateEditorChart';
import type {DialogCreateFolderProps} from './DialogCreateFolder';
import {DialogCreateFolder} from './DialogCreateFolder';
import type {DialogCreateQLChartProps} from './DialogCreateQLChart';
import {DialogCreateQLChart} from './DialogCreateQLChart';
import type {DialogCreateWizardChartProps} from './DialogCreateWizardChart';
import {DialogCreateWizardChart} from './DialogCreateWizardChart';
import type {DialogDeleteEntryProps} from './DialogDeleteEntry';
import {DialogDeleteEntry} from './DialogDeleteEntry';
import type {DialogEditFavoritesAliasProps} from './DialogEditFavoritesAlias';
import {DialogEditFavoritesAlias} from './DialogEditFavoritesAlias';
import type {DialogEditWarningProps} from './DialogEditWarning/DialogEditWarning';
import DialogEditWarning from './DialogEditWarning/DialogEditWarning';
import type {DialogEntrySaveAsNewProps} from './DialogEntrySaveAsNew';
import {DialogEntrySaveAsNew} from './DialogEntrySaveAsNew';
import type {DialogMakeActualConfirmProps} from './DialogMakeActualConfirm/DialogMakeActualConfirm';
import DialogMakeActualConfirm from './DialogMakeActualConfirm/DialogMakeActualConfirm';
import type {DialogMigrateToWorkbookProps} from './DialogMigrateToWorkbook';
import {DialogMigrateToWorkbook} from './DialogMigrateToWorkbook';
import type {DialogMoveEntryProps} from './DialogMoveEntry';
import {DialogMoveEntry} from './DialogMoveEntry';
import type {DialogRenameEntryProps} from './DialogRenameEntry';
import {DialogRenameEntry} from './DialogRenameEntry';
import {DialogShareEntry} from './DialogShareEntry';
import type {DialogSwitchPublicProps} from './DialogSwitchPublic';
import {DialogSwitchPublic} from './DialogSwitchPublic';
import type {DialogUnlockProps} from './DialogUnlock';
import {DialogUnlock} from './DialogUnlock';
import type {EntryDialogOnClose, EntryDialogOnCloseArg} from './types';

export enum EntryDialogName {
    Rename = 'rename',
    EditFavoritesAlias = 'edit_favorites_alias',
    Copy = 'copy',
    Move = 'move',
    Delete = 'delete',
    CreateFolder = 'create_folder',
    Access = 'access',
    AccessDescription = 'access_description',
    Unlock = 'unlock',
    CreateDashboard = 'create_dashboard',
    CreateWizardChart = 'create_wizard_chart',
    SwitchPublic = 'switch_public',
    CreateEditorChart = 'create_editor_chart',
    CreateQLChart = 'create_sql_chart',
    EditWarning = 'edit-warning',
    SetActualConfirm = 'set-actual-confirm',
    SaveAsNew = 'save-as-new',
    MigrateToWorkbook = 'migrate-to-workbook',
    ShowRelatedEntities = 'show-related-entities',
    Share = 'share',
}

const getMapDialogues = (): Record<string, any> => {
    const {getAdditionalEntryDialoguesMap} = registry.common.functions.getAll();
    return {
        [EntryDialogName.Access]: DialogAccess,
        [EntryDialogName.AccessDescription]: DialogAccessDescription,
        [EntryDialogName.Unlock]: DialogUnlock,
        [EntryDialogName.Delete]: DialogDeleteEntry,
        [EntryDialogName.Move]: DialogMoveEntry,
        [EntryDialogName.Rename]: DialogRenameEntry,
        [EntryDialogName.EditFavoritesAlias]: DialogEditFavoritesAlias,
        [EntryDialogName.Copy]: DialogCopyEntry,
        [EntryDialogName.CreateFolder]: DialogCreateFolder,
        [EntryDialogName.CreateDashboard]: DialogCreateDashboard,
        [EntryDialogName.CreateWizardChart]: DialogCreateWizardChart,
        [EntryDialogName.SwitchPublic]: DialogSwitchPublic,
        [EntryDialogName.CreateEditorChart]: DialogCreateEditorChart,
        [EntryDialogName.CreateQLChart]: DialogCreateQLChart,
        [EntryDialogName.EditWarning]: DialogEditWarning,
        [EntryDialogName.SetActualConfirm]: DialogMakeActualConfirm,
        [EntryDialogName.SaveAsNew]: DialogEntrySaveAsNew,
        [EntryDialogName.MigrateToWorkbook]: DialogMigrateToWorkbook,
        [EntryDialogName.ShowRelatedEntities]: DialogRelatedEntities,
        [EntryDialogName.Share]: DialogShareEntry,
        ...getAdditionalEntryDialoguesMap(),
    };
};

// For the TSX component
interface MapDialoguesProps {
    [EntryDialogName.Access]: DialogAccessProps;
    [EntryDialogName.AccessDescription]: DialogAccessDescriptionProps;
    [EntryDialogName.Unlock]: DialogUnlockProps;
    [EntryDialogName.Delete]: DialogDeleteEntryProps;
    [EntryDialogName.Move]: DialogMoveEntryProps;
    [EntryDialogName.Copy]: DialogCopyEntryProps;
    [EntryDialogName.CreateFolder]: DialogCreateFolderProps;
    [EntryDialogName.Rename]: DialogRenameEntryProps;
    [EntryDialogName.EditFavoritesAlias]: DialogEditFavoritesAliasProps;
    [EntryDialogName.CreateDashboard]: DialogCreateDashboardProps;
    [EntryDialogName.CreateEditorChart]: DialogCreateEditorChartProps;
    [EntryDialogName.SwitchPublic]: DialogSwitchPublicProps;
    [EntryDialogName.CreateWizardChart]: DialogCreateWizardChartProps;
    [EntryDialogName.CreateQLChart]: DialogCreateQLChartProps;
    [EntryDialogName.EditWarning]: DialogEditWarningProps;
    [EntryDialogName.SetActualConfirm]: DialogMakeActualConfirmProps;
    [EntryDialogName.SaveAsNew]: DialogEntrySaveAsNewProps;
    [EntryDialogName.MigrateToWorkbook]: DialogMigrateToWorkbookProps;
    [EntryDialogName.Share]: DialogShareProps;
}

type MethodOpenWithProps<T> = {
    dialog: T;
    dialogProps: T extends keyof MapDialoguesProps
        ? Omit<MapDialoguesProps[T], 'sdk' | 'visible' | 'onClose'>
        : undefined;
};

type MethodOpenCommon<T, P> = {
    dialog: T;
    dialogProps?: P;
};

type MethodOpen<T, P> = T extends keyof MapDialoguesProps
    ? MethodOpenWithProps<T>
    : MethodOpenCommon<T, P>;

interface EntryDialoguesProps {
    sdk?: SDK;
}

interface EntryDialoguesState {
    dialog: EntryDialogName | string | null;
    resolveOpenDialog: (arg: EntryDialogOnCloseArg) => void;
    visible: boolean;
    dialogProps?: Record<string, any>;
}

const initState: EntryDialoguesState = {
    dialog: null,
    resolveOpenDialog: noop,
    visible: false,
    dialogProps: {},
};

class EntryDialogues extends React.Component<EntryDialoguesProps, EntryDialoguesState> {
    state = {...initState};

    render() {
        let content: React.ReactNode = null;
        const mapDialogues = getMapDialogues();

        if (this.state.dialog !== null && this.state.dialog in mapDialogues) {
            const dialog = mapDialogues[this.state.dialog];
            content = React.createElement(dialog, {
                ...this.state.dialogProps,
                sdk,
                visible: this.state.visible,
                onClose: this.onClose,
            });
        }

        return content;
    }

    // Public method via ref
    open<T extends string, P extends Record<string, any> = any>({
        dialog,
        dialogProps,
    }: MethodOpen<T, P>): Promise<EntryDialogOnCloseArg> {
        return new Promise((resolveOpenDialog) => {
            this.setState({
                dialog,
                resolveOpenDialog,
                dialogProps,
                visible: true,
            });
        });
    }

    private onClose: EntryDialogOnClose = ({status, data = {}}) => {
        const {resolveOpenDialog} = this.state;

        this.setState({...initState});

        resolveOpenDialog({status, data});
    };
}

export default EntryDialogues;
