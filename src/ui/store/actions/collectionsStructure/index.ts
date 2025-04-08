import type {DatalensGlobalState} from 'ui/index';
import type {
    CreateCollectionAction,
    CreateWorkbookAction,
    GetCollectionAction,
    GetCollectionBreadcrumbsAction,
    GetRootCollectionPemissionsAction,
    GetStructureItemsAction,
    MoveCollectionAction,
    MoveCollectionsAction,
    MoveWorkbookAction,
    MoveWorkbooksAction,
    ResetCollectionBreadcrumbsAction,
    ResetStateAction,
    ResetStructureItemsAction,
    DeleteCollectionsAction,
    DeleteWorkbooksAction,
    CopyWorkbookAction,
    UpdateWorkbookAction,
    UpdateCollectionAction,
    DeleteCollectionAction,
    DeleteWorkbookAction,
} from './common';
import type {
    ExportWorkbookAction,
    ImportWorkbookAction,
    GetImportProgressAction,
    GetExportProgressAction,
    GetExportResultAction,
} from './export';
import type {AddDemoWorkbookAction, CopyTemplateAction} from './templates';
import type {ThunkDispatch} from 'redux-thunk';

export type CollectionsStructureAction =
    | ResetStateAction
    | GetRootCollectionPemissionsAction
    | ResetCollectionBreadcrumbsAction
    | GetCollectionBreadcrumbsAction
    | GetCollectionAction
    | ResetStructureItemsAction
    | GetStructureItemsAction
    | CreateCollectionAction
    | CreateWorkbookAction
    | CopyTemplateAction
    | MoveCollectionAction
    | MoveWorkbookAction
    | MoveCollectionsAction
    | MoveWorkbooksAction
    | DeleteCollectionsAction
    | DeleteWorkbooksAction
    | CopyWorkbookAction
    | UpdateWorkbookAction
    | UpdateCollectionAction
    | DeleteCollectionAction
    | DeleteWorkbookAction
    | AddDemoWorkbookAction
    | ExportWorkbookAction
    | ImportWorkbookAction
    | GetImportProgressAction
    | GetExportProgressAction
    | GetExportResultAction;

export type CollectionsStructureDispatch = ThunkDispatch<
    DatalensGlobalState,
    void,
    CollectionsStructureAction
>;

// Re-export all action creators
export * from './common';
export * from './export';
export * from './templates';
