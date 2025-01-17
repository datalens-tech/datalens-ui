import type {CSVDelimiter, CSVEncoding} from '../../../constants';
import type {DATASET_FIELD_TYPES} from '../../../types';

export type StateStatus = 'ready' | 'in_progress' | 'failed';
export type RefreshToken = string | null | undefined;

export type GetFileStatusResponse = {
    file_id: string;
    status: StateStatus;
    errors: {
        code: string;
        details: {
            token: string | null;
            row: number;
            column: number;
        };
        level: string;
        message: string;
    }[];
    error?: {
        code: string;
    };
};

export type GetFileStatusArgs = {
    fileId: string;
};

export type FileSourceInfo = {
    is_applicable: boolean;
    source_id: string;
    title: string;
    error?: {code: string} | null;
};

export type GetFileSourcesResponse = {
    file_id: string;
    sources: FileSourceInfo[];
};

export type GetFileSourcesArgs = {
    fileId: string;
};

export type GetFileSourceStatusResponse = {
    file_id: string;
    source_id: string;
    status: StateStatus;
};

export type GetFileSourceStatusArgs = {
    fileId: string;
    sourceId: string;
};

export type FileSourceDataSettings = {
    delimiter: CSVDelimiter;
    encoding: CSVEncoding;
    first_line_is_header: boolean;
};

export type FileSourceSchema =
    | {
          user_type: DATASET_FIELD_TYPES;
          title: string;
          name: string;
      }[]
    | null;

export type FileSourcePreview = (string | number)[][];

export type UpdateFileSourceResponse = {
    data_settings: FileSourceDataSettings;
    file_id: string;
    options: {
        columns: {
            name: string;
            user_type: DATASET_FIELD_TYPES[];
        }[];
        data_settings: {
            delimiter: CSVDelimiter[];
            encoding: CSVEncoding[];
        };
    } | null;
    source: {
        is_valid: boolean;
        preview: FileSourcePreview;
        raw_schema: FileSourceSchema;
        sheet_id: S3BasedConnectionSheetId;
        source_id: string;
        title: string;
        error?: {
            code: string;
            details: {'request-id': string};
            level: string;
            message: string;
        };
        private_path?: string;
        public_link?: string;
        spreadsheet_id?: string;
    };
};

export type FileSourceColumnType = {
    name: string;
    user_type: DATASET_FIELD_TYPES;
};

export type UpdateFileSourceArgs = {
    fileId: string;
    sourceId: string;
    // The field is in the snake case, because it is passed directly to backend request
    column_types?: FileSourceColumnType[];
};

export type ApplySourceSettingsResponse = {};

export type ApplySourceSettingsArgs = {
    fileId: string;
    sourceId: string;
    // The field is in the snake case, because it is passed directly to backend request
    data_settings: FileSourceDataSettings;
    title?: string;
};

export type AddGoogleSheetResponse = {
    file_id: string;
    title: string;
};

export type AddGoogleSheetArgs = {
    type: 'gsheets';
    url: string;
    authorized: boolean;
    refresh_token?: RefreshToken;
    connection_id?: string;
};

export type UpdateS3BasedConnectionDataResponse = {
    files: {
        file_id: string;
        sources: {
            source_id: string;
        }[];
    }[];
};

type BaseUpdatedSource = {
    id: string;
    title: string;
    first_line_is_header: boolean;
};

type S3BasedConnectionSheetId = string | number;

export type GoogleSheetUpdatedSource = BaseUpdatedSource & {
    sheet_id: S3BasedConnectionSheetId;
    spreadsheet_id?: string;
};

export type YandexDocumentUpdatedSource = BaseUpdatedSource & {
    public_link?: string;
    private_path?: string;
    sheet_id?: S3BasedConnectionSheetId;
};

type UpdateGoogleSheetDataArgs = {
    type: 'gsheets';
    sources: GoogleSheetUpdatedSource[];
    refresh_token?: RefreshToken;
};

type UpdateYandexDocumentDataArgs = {
    type: 'yadocs';
    sources: YandexDocumentUpdatedSource[];
    oauth_token?: string;
};

export type UpdateS3BasedConnectionDataArgs = (
    | UpdateGoogleSheetDataArgs
    | UpdateYandexDocumentDataArgs
) & {
    authorized: boolean;
    connection_id?: string;
};

export type AddYandexDocumentResponse = {
    file_id: string;
    title: string;
};

export type AddYandexDocumentArgs = {
    authorized: boolean;
    type: 'yadocs';
    connection_id?: string;
    private_path?: string;
    public_link?: string;
    oauth_token?: RefreshToken;
};

export type GetPresignedUrlResponse = {
    url: string;
    fields: Record<string, string>;
};

export type GetPresignedUrlArgs = {
    content_md5?: string;
};

export type DownloadPresignedUrlArgs = {
    filename: string;
    key: string;
};

export type DownloadPresignedUrlResponse = {
    file_id: string;
    filename: string;
};
