import type {OpenDialogMetricSettingsArgs} from '../../units/wizard/components/Dialogs/DialogMetricSettings/DialogMetricSettings';
import type {OpenDialogColorArgs} from '../../units/wizard/components/Dialogs/DialogColor/DialogColor';
import type {OpenDialogFieldInspectorArgs} from '../../units/wizard/components/Dialogs/DialogFieldInspector/DialogFieldInspector';
import type {OpenDialogShapesArgs} from '../../units/wizard/components/Dialogs/DialogShapes/DialogShapes';
import type {OpenDialogFieldArgs} from '../../units/wizard/components/Dialogs/DialogField/DialogField';
import type {OpenDialogFilterArgs} from '../../index';
import type {OpenDialogPlaceholderArgs} from '../../units/wizard/components/Dialogs/DialogPlaceholder/DialogPlaceholder';
import type {OpenDialogPointsSizeArgs} from '../../units/wizard/components/Dialogs/DialogPointsSize';
import type {OpenDialogErrorWithTabsArgs} from '../../components/DialogErrorWithTabs/DialogErrorWithTabs';
import type {OpenDialogNeedResetArgs} from '../../components/OpenDialogNeedReset/OpenDialogNeedReset';
import type {OpenDialogChartSettingsArgs} from '../../units/wizard/components/Dialogs/Settings/Settings';
import type {
    OpenDialogCreateConnectionArgs,
    OpenDialogCreateConnectionInWbArgs,
} from '../../units/connections/components';
import type {OpenDialogConfirmArgs} from '../../components/DialogConfirm/DialogConfirm';
import type {OpenDialogWarningArgs} from '../../components/DialogWarning/DialogWarning';
import type {OpenDialogDatasetFieldInspectorArgs} from '../../units/datasets/components/dialogs/DatasetFieldInspector/DatasetFieldInspector';
import type {OpenDialogParameterArgs} from '../../components/DialogParameter/DialogParameter';
import type {OpenDialogMultidatasetArgs} from '../../units/wizard/components/Dialogs/DialogMultidataset';
import type {OpenDialogRelationsArgs} from '../../components/DialogRelations/DialogRelations';
import type {OpenDialogAliasesArgs} from '../../components/DialogRelations/components/DialogAliases/DialogAliases';
import type {OpenDialogColumnSettingsArgs} from '../../units/wizard/components/Dialogs/DialogColumnSettings/DialogColumnSettings';
import type {OpenDialogFieldEditorArgs} from '../../components/DialogFieldEditor/DialogFieldEditor';
import type {OpenDialogRenameEntryInNewWorkbookArgs} from '../../units/workbooks/components/RenameEntryDialog/RenameEntryDialog';
import type {OpenDialogDeleteEntryInNewWorkbookArgs} from '../../units/workbooks/components/DeleteEntryDialog/DeleteEntryDialog';
import type {OpenDialogDuplicateEntryInWorkbookArgs} from '../../units/workbooks/components/DuplicateEntryDialog/DuplicateEntryDialog';
import type {OpenDialogConnS3Sources} from '../../units/connections/components/dialogs';
import type {OpenDialogConnWithInputArgs} from '../../units/connections/components/custom-forms/components/DialogWithInput';
import type {OpenDialogConnConfirmArgs} from '../../units/connections/components/dialogs/Confirm';
import type {OpenDialogMoveCollectionsWorkbooksArgs} from '../../components/CollectionsStructure/MoveCollectionsWorkbooksDialog';
import type {OpenDialogMoveCollectionArgs} from '../../components/CollectionsStructure/MoveCollectionDialog';
import type {OpenDialogMoveWorkbookArgs} from '../../components/CollectionsStructure/MoveWorkbookDialog';
import type {OpenDialogCopyWorkbookArgs} from '../../components/CollectionsStructure/CopyWorkbookDialog';
import type {OpenDialogMigrateEntryToWorkbookArgs} from '../../components/CollectionsStructure/MigrateEntryToWorkbookDialog';
import type {OpenDialogEditWorkbookArgs} from '../../components/CollectionsStructure/EditWorkbookDialog';
import type {OpenDialogCreateWorkbookArgs} from '../../components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import type {OpenDialogEditCollectionArgs} from '../../components/CollectionsStructure/EditCollectionDialog';
import type {OpenDialogCreateCollectionArgs} from '../../components/CollectionsStructure/CreateCollectionDialog';
import type {OpenDialogCopyEntriesArgs} from '../../components/CollectionsStructure/CopyEntriesDialog';
import type {OpenDialogQLParameterArgs} from '../../components/DialogQLParameter/DialogQLParameter';
import type {OpenDialogSelectMigrationToWorkbookArgs} from '../../components/SelectMigrationToWorkbookDialog/SelectMigrationToWorkbookDialog';
import type {OpenDialogMigrateToWorkbookArgs} from '../../components/MigrateToWorkbookDialog/MigrateToWorkbookDialog';
import type {OpenDialogLabelSettingsArgs} from '../../units/wizard/components/Dialogs/DialogLabelSettings/DialogLabelSettings';
import type {OpenDialogExtendedSettingsArgs} from '../../components/DialogExtendedSettings/DialogExtendedSettings';
import type {OpenDialogCopyEntriesToWorkbookArgs} from '../../components/CopyEntriesToWorkbookDialog/CopyEntriesToWorkbookDialog';
import type {OpenDialogConnAddYadocArgs} from '../../units/connections/components/custom-forms/Yadocs/components/DialogAddDocument/DialogAddDocument';
import type {OpenDialogEditQueryArgs} from '../../units/dash/containers/Dialogs/DialogEditQuery/DialogEditQuery';
import type {OpenDialogDeleteCollectionArgs} from '../../components/CollectionsStructure/DeleteCollectionDialog';
import type {OpenDialogDeleteCollectionsWorkbooksArgs} from '../../components/CollectionsStructure/DeleteCollectionsWorkbooksDialog';
import type {OpenDialogDeleteWorkbookArgs} from '../../components/CollectionsStructure/DeleteWorkbookDialog';
import type {OpenDialogCreateEntryInWorkbookArgs} from '../../components/CollectionsStructure/CreateEntryInWorkbookDialog';
import type {OpenDialogIamAccessArgs} from '../../components/IamAccessDialog';
import type {OpenDialogAssignClaimsArgs} from '../../components/OpenDialogAssignClaims/OpenDialogAssignClaims';
import { OpenDialogShareArgs } from 'ui/components/OpenDialogShare/OpenDialogShare';
import { OpenDialogExportPdfArgs } from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/Header/components/Menu/Items/Export/ExportDialog';
import type {OpenDialogTooltipSettingsArgs} from '../../units/wizard/components/Dialogs/DialogTooltipSettings/DialogTooltipSettings';
import type {OpenDialogChangeDatasetFieldsArgs} from '../../units/datasets/components/DatasetTable/components/BatchActionPanel/components/DialogChangeDatasetFields/DialogChangeDatasetFields';
import type {OpenDialogCollectionNoCreatePermissionArgs} from 'ui/components/CollectionsStructure/CollectionNoCreatePermissionDialog';
import type {OpenDialogReleaseVersionArgs} from 'ui/components/AsideHeaderAdapter/VersionDialog/VersionDialog';
import type {OpenDialogExportWorkbookArgs} from 'ui/components/CollectionsStructure/ExportWorkbookDialog/ExportWorkbookDialog';
import type {OpenDialogDefaultArgs} from 'ui/components/DialogDefault/DialogDefault';
import type {OpenDialogCreatePublicGalleryWorkbookArgs} from 'ui/components/CollectionsStructure/CreatePublicGalleryWorkbookDialog';
import type {OpenDialogEntryDescriptionArgs} from 'ui/components/DialogEntryDescription/DialogEntryDescriptionWrapper';

export type OpenDialogArgs<T = unknown> =
    | OpenDialogReleaseVersionArgs
    | OpenDialogMetricSettingsArgs
    | OpenDialogColorArgs
    | OpenDialogFieldInspectorArgs
    | OpenDialogShapesArgs
    | OpenDialogFieldArgs
    | OpenDialogFilterArgs
    | OpenDialogQLParameterArgs
    | OpenDialogPlaceholderArgs
    | OpenDialogPointsSizeArgs
    | OpenDialogErrorWithTabsArgs
    | OpenDialogNeedResetArgs
    | OpenDialogChartSettingsArgs
    | OpenDialogCreateConnectionArgs
    | OpenDialogCreateConnectionInWbArgs
    | OpenDialogWarningArgs
    | OpenDialogConfirmArgs
    | OpenDialogDatasetFieldInspectorArgs
    | OpenDialogParameterArgs
    | OpenDialogRelationsArgs
    | OpenDialogAliasesArgs
    | OpenDialogMultidatasetArgs
    | OpenDialogColumnSettingsArgs
    | OpenDialogFieldEditorArgs<T>
    | OpenDialogRenameEntryInNewWorkbookArgs
    | OpenDialogDeleteEntryInNewWorkbookArgs
    | OpenDialogDuplicateEntryInWorkbookArgs
    | OpenDialogConnAddYadocArgs<T>
    | OpenDialogConnWithInputArgs<T>
    | OpenDialogConnConfirmArgs
    | OpenDialogConnS3Sources
    | OpenDialogMoveCollectionsWorkbooksArgs
    | OpenDialogMoveCollectionArgs
    | OpenDialogMoveWorkbookArgs
    | OpenDialogCopyWorkbookArgs
    | OpenDialogExtendedSettingsArgs
    | OpenDialogLabelSettingsArgs
    | OpenDialogEditWorkbookArgs
    | OpenDialogEditCollectionArgs
    | OpenDialogCreateCollectionArgs
    | OpenDialogCreateWorkbookArgs
    | OpenDialogMigrateToWorkbookArgs
    | OpenDialogSelectMigrationToWorkbookArgs
    | OpenDialogMigrateEntryToWorkbookArgs
    | OpenDialogCopyEntriesToWorkbookArgs
    | OpenDialogCopyEntriesArgs
    | OpenDialogEditQueryArgs
    | OpenDialogDeleteCollectionArgs
    | OpenDialogDeleteCollectionsWorkbooksArgs
    | OpenDialogDeleteWorkbookArgs
    | OpenDialogIamAccessArgs
    | OpenDialogCreateEntryInWorkbookArgs
    | OpenDialogAssignClaimsArgs
    | OpenDialogShareArgs
    | OpenDialogExportPdfArgs
    | OpenDialogTooltipSettingsArgs
    | OpenDialogChangeDatasetFieldsArgs
    | OpenDialogCollectionNoCreatePermissionArgs
    | OpenDialogExportWorkbookArgs
    | OpenDialogDefaultArgs
    | OpenDialogCreatePublicGalleryWorkbookArgs
    | OpenDialogEntryDescriptionArgs;
