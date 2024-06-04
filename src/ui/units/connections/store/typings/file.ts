import type {
    ApplySourceSettingsArgs,
    FileSourceColumnType,
    FileSourceInfo,
    UpdateFileSourceResponse,
} from '../../../../../shared/schema';
import type {DataLensApiError} from '../../../../typings';

/** File from the moment of upload to successful status polling*/
export type UploadedFile = {
    file: File;
    id: string;
    error?: DataLensApiError;
    sourcesInfo?: FileSourceInfo[];
};
/** Brief information on the source. Requested after successfully polling the status of the uploaded file*/
export type FileSourceInfoItem = Omit<FileSourceInfo, 'error'> & {
    file_id: string;
    error?: DataLensApiError;
};
/** Full information on the source. Requested based on FileSourceInfoItem*/
export type FileSourceItem = UpdateFileSourceResponse & {
    columnTypes?: FileSourceColumnType[];
    error?: DataLensApiError;
    polling?: boolean;
};
/** Information on the source of an already created connection. Comes in the response of the handle `getConnection` in the `sources` field for connections of the `file` type*/
export type StandaloneFileSource = Omit<
    UpdateFileSourceResponse['source'],
    'is_valid' | 'source_id' | 'error'
> & {id: string};
export type FileSource = FileSourceInfoItem | FileSourceItem | StandaloneFileSource;
export type ListItemProps = UploadedFile | FileSource;

/** Information for working with the native file selection dialog * @param replaceSourceId {stirng=} id of the source to be replaced. * The field is needed in order to dig up the id from the moment the dialog opens until the file is selected for replacement. * @param showFileSelection {boolean=} flag that controls the display of the native dialog for selecting files.*/
export type ReplaceSourceActionData = {
    replaceSourceId?: string;
    showFileSelection?: boolean;
};

export type UpdateFileSource = (
    fileId: string,
    sourceId: string,
    columnTypes?: FileSourceColumnType[],
) => void;

export type UpdateFileSourceInline = (
    sourceId: string,
    updates?: Partial<UpdateFileSourceResponse['source']>,
) => void;

export type ApplySourceSettings = (
    fileId: string,
    sourceId: string,
    settings: ApplySourceSettingsArgs['data_settings'],
) => void;
