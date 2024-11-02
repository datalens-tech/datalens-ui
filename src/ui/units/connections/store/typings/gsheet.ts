import type {
    AddGoogleSheetResponse,
    FileSourceInfo,
    RefreshToken,
    StateStatus,
    UpdateFileSourceResponse,
} from '../../../../../shared/schema';
import type {DataLensApiError} from '../../../../typings';

/** Google sheet from the moment of uploading to successful status polling and requesting sources*/
export type UploadedGSheet = {
    type: 'uploadedGSheet';
    status: StateStatus;
    data: AddGoogleSheetResponse & {sources?: FileSourceInfo[]};
    replacedSourceId?: string;
    error?: DataLensApiError | null;
};

/** Brief information on the Google sheet source before successfully obtaining all data on this source*/
export type GSheetSourceInfo = {
    type: 'gsheetSourceInfo';
    status: StateStatus;
    fileId: string;
    data: FileSourceInfo;
    error?: DataLensApiError | null;
};

/** Full information on the Google sheet source. Available for editing*/
export type GSheetEditableSource = {
    type: 'gsheetEditableSource';
    status: StateStatus;
    data: UpdateFileSourceResponse;
    error?: DataLensApiError | null;
};

/** Information on the source of an already created connection. Read-only*/
export type GSheetReadonlySource = {
    type: 'gsheetReadonlySource';
    status: StateStatus;
    data: {
        file_id: string;
        first_line_is_header: boolean;
        id: string;
        status: StateStatus;
        title: string;
        sheet_id: string | number;
        raw_schema: UpdateFileSourceResponse['source']['raw_schema'];
        preview: UpdateFileSourceResponse['source']['preview'];
        spreadsheet_id?: string;
    };
    error?: DataLensApiError | null;
};

export type GSheetSource = GSheetEditableSource | GSheetReadonlySource;

export type GSheetItem =
    | UploadedGSheet
    | GSheetSourceInfo
    | GSheetEditableSource
    | GSheetReadonlySource;

export type GSheetAddSectionState = {
    url: string;
    active: boolean;
    disabled: boolean;
    uploading: boolean;
};

type GSheetActiveDialogSources = {
    type: 'dialog-sources';
    fileId: string;
    batch?: boolean;
};

type GSheetActiveDialogRename = {
    type: 'dialog-rename';
    sourceId: string;
    value?: string;
};

type GSheetActiveDialogReplace = {
    type: 'dialog-replace';
    sourceId: string;
    authorized: boolean;
    connectionId?: string;
    refreshToken?: RefreshToken;
};

type GSheetActiveDialogLogout = {
    type: 'dialog-logout';
};

export type GSheetActiveDialog =
    | GSheetActiveDialogSources
    | GSheetActiveDialogRename
    | GSheetActiveDialogReplace
    | GSheetActiveDialogLogout;
