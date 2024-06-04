import type {UpdateFileSourceResponse} from '../../../../../../shared/schema';
import type {
    ApplySourceSettings,
    ListItemProps,
    ReplaceSourceActionData,
    StandaloneFileSource,
    UpdateFileSource,
    UpdateFileSourceInline,
} from '../../../store';

export type HandleFileUpload = (file: File) => void;
export type HandleFilesUpload = (files: File[]) => void;
export type HandleFileSourceUpdate = UpdateFileSource;
export type HandleInlineFileSourceUpdate = UpdateFileSourceInline;
export type HandleFileColumnFilterUpdate = (columnFilter: string) => void;
export type HandleSourceSettingsApply = ApplySourceSettings;
export type HandleReplaceSource = (file: File, sourceId: string) => void;
export type HandleReplaceSourceActionData = (data: ReplaceSourceActionData) => void;
export type DeleteUploadedFile = (fileName: string) => void;
export type DeleteFileSource = (sourceId: string) => void;
export type OpenRenameSourceDialog = (
    source: UpdateFileSourceResponse['source'] | StandaloneFileSource,
) => void;
export type OpenSourcesDialog = (fileId: string) => void;

export type GroupTitle = {
    groupTitle: string;
    // The service field by which List will disable possible clicks on the header
    disabled: true;
    withBorder?: boolean;
};

export type FileListItem = ListItemProps | GroupTitle;
