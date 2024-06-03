import type {CollectionsStructureState} from 'store/reducers/collectionsStructure';
import type {ColorPaletteEditorState} from 'store/reducers/colorPaletteEditor';
import type {DialogState} from 'store/reducers/dialog';
import type {LandingState} from 'store/reducers/landing';
import type {AsideHeaderState} from 'store/typings/asideHeader';
import type {EntryGlobalState} from 'store/typings/entryContent';
import type {UserState} from 'store/typings/user';
import type {CopyEntriesToWorkbookState} from 'ui/store/reducers/copyEntriesToWorkbook';
import type {MigrationToWorkbookState} from 'ui/store/reducers/migrationToWorkbook';
import type {CollectionsState} from 'units/collections/store/reducers';
import type {ConnectionsReduxState} from 'units/connections/store/typings';
import type {DashState} from 'units/dash/store/reducers/dashTypedReducer';
import type {DatasetReduxState} from 'units/datasets/store/types';
import type {ComponentsState} from 'units/editor/store/reducers';
import type {EditorState} from 'units/editor/store/reducers/editor/editorTypedReducer';
import type {QLState} from 'units/ql/store/typings';
import type {WizardGlobalState} from 'units/wizard/reducers';
import type {WorkbooksState} from 'units/workbooks/store/reducers';

import type {EditHistoryState} from './store/reducers/editHistory';
import type {CollectionsNavigationState} from './units/collections-navigation/store/reducers';

export {default as ActionPanel} from './components/ActionPanel/ActionPanel';
export {default as Utils} from './utils';
export {default as PathSelect} from './components/PathSelect/PathSelect';
export {LandingPage} from './components/LandingPage/LandingPage';
export {default as ErrorContent} from './components/ErrorContent/ErrorContent';
export {default as DataTypeIcon} from './components/DataTypeIcon/DataTypeIcon';
export {default as Tabs} from './components/Tabs/Tabs';
export {default as FormattedValue} from './components/FormattedValue/FormattedValue';
export {default as RelativeDatesPicker} from './components/RelativeDatesPicker/RelativeDatesPicker';
export {default as DialogNoRights} from './components/DialogNoRights/DialogNoRights';
export {default as DNDPane} from './components/DNDPane/DNDPane';
export {default as Monaco} from './components/Monaco/Monaco';
export * from './components/Monaco/Monaco';
export type {MonacoTypes} from './libs/monaco';

export * from './constants';
export * from './typings';
export * from './components/PageTitle';
export * from './components/EntryDialogues';
export * from './components/Navigation';
export * from './components/SlugifyUrl';
export * from './components/Interpolate';
export * from './components/DialogFilter/DialogFilter';
export * from './components/ErrorContent/ErrorContent';
export * from './components/FormattedValue/FormattedValue';
export * from './hoc';
export * from './hooks';
export * from './libs';
export * from './modules';

export type DatalensGlobalState = {
    wizard: WizardGlobalState;
    asideHeader: AsideHeaderState;
    connections: ConnectionsReduxState;
    dash: DashState;
    dataset: DatasetReduxState;
    ql: QLState;
    collections: CollectionsState;
    collectionsStructure: CollectionsStructureState;
    workbooks: WorkbooksState;
    collectionsNavigation: CollectionsNavigationState;
    dialog: DialogState;
    landing: LandingState;
    components: ComponentsState;
    editor: EditorState;
    entryContent: EntryGlobalState;
    user: UserState;
    colorPaletteEditor: ColorPaletteEditorState;
    migrationToWorkbook: MigrationToWorkbookState;
    copyEntriesToWorkbook: CopyEntriesToWorkbookState;
    editHistory: EditHistoryState;
};
