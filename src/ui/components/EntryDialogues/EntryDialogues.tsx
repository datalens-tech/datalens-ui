import React from 'react';

import noop from 'lodash/noop';
import {DialogDashMetaProps} from 'ui/registry/units/dash/types/DialogDashMeta';

import SDK, {sdk} from '../../libs/sdk';
import {registry} from '../../registry';

import {DialogAccess, DialogAccessProps} from './DialogAccess/DialogAccess';
import {
    DialogAccessDescription,
    DialogAccessDescriptionProps,
} from './DialogAccessDescription/DialogAccessDescription';
import {DialogCopyEntry, DialogCopyEntryProps} from './DialogCopyEntry';
import {DialogCreateDashboard, DialogCreateDashboardProps} from './DialogCreateDashboard';
import {DialogCreateEditorChart, DialogCreateEditorChartProps} from './DialogCreateEditorChart';
import {DialogCreateFolder, DialogCreateFolderProps} from './DialogCreateFolder';
import {DialogCreateQLChart, DialogCreateQLChartProps} from './DialogCreateQLChart';
import {DialogCreateWizardChart, DialogCreateWizardChartProps} from './DialogCreateWizardChart';
import {DialogDashMetaWrapper as DialogDashMeta} from './DialogDashMeta/DialogDashMetaWrapper';
import {DialogDeleteEntry, DialogDeleteEntryProps} from './DialogDeleteEntry';
import {DialogEditFavoritesAlias, DialogEditFavoritesAliasProps} from './DialogEditFavoritesAlias';
import DialogEditWarning, {DialogEditWarningProps} from './DialogEditWarning/DialogEditWarning';
import {DialogEntrySaveAsNew, DialogEntrySaveAsNewProps} from './DialogEntrySaveAsNew';
import DialogMakeActualConfirm, {
    DialogMakeActualConfirmProps,
} from './DialogMakeActualConfirm/DialogMakeActualConfirm';
import {DialogMigrateToWorkbook, DialogMigrateToWorkbookProps} from './DialogMigrateToWorkbook';
import {DialogMoveEntry, DialogMoveEntryProps} from './DialogMoveEntry';
import {DialogRenameEntry, DialogRenameEntryProps} from './DialogRenameEntry';
import {DialogSwitchPublic, DialogSwitchPublicProps} from './DialogSwitchPublic';
import {DialogUnlock, DialogUnlockProps} from './DialogUnlock';
import {EntryDialogOnClose, EntryDialogOnCloseArg} from './types';

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
    DashMeta = 'dash_meta',
    CreateDashboard = 'create_dashboard',
    CreateWizardChart = 'create_wizard_chart',
    SwitchPublic = 'switch_public',
    CreateEditorChart = 'create_editor_chart',
    CreateQLChart = 'create_sql_chart',
    EditWarning = 'edit-warning',
    SetActualConfirm = 'set-actual-confirm',
    SaveAsNew = 'save-as-new',
    MigrateToWorkbook = 'migrate-to-workbook',
}

const getMapDialogues = (): Record<string, any> => {
    const {getAdditionalEntryDialoguesMap} = registry.common.functions.getAll();
    return {
        [EntryDialogName.Access]: DialogAccess,
        [EntryDialogName.AccessDescription]: DialogAccessDescription,
        [EntryDialogName.Unlock]: DialogUnlock,
        [EntryDialogName.DashMeta]: DialogDashMeta,
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
        ...getAdditionalEntryDialoguesMap(),
    };
};

// For the TSX component
interface MapDialoguesProps {
    [EntryDialogName.Access]: DialogAccessProps;
    [EntryDialogName.AccessDescription]: DialogAccessDescriptionProps;
    [EntryDialogName.Unlock]: DialogUnlockProps;
    [EntryDialogName.DashMeta]: DialogDashMetaProps;
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

export default class EntryDialogues extends React.Component<
    EntryDialoguesProps,
    EntryDialoguesState
> {
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

    // public via ref
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
