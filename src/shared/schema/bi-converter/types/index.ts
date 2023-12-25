import {CSVDelimiter, CSVEncoding} from '../../../constants';
import {DATASET_FIELD_TYPES} from '../../../types';
import type {GoogleRefreshToken} from '../../types';

export type StateStatus = 'ready' | 'in_progress' | 'failed';

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
        preview: (string | number)[][];
        raw_schema:
            | {
                  user_type: DATASET_FIELD_TYPES;
                  title: string;
                  name: string;
              }[]
            | null;
        sheet_id: number;
        source_id: string;
        spreadsheet_id: string;
        title: string;
        error?: {
            code: string;
            details: {'request-id': string};
            level: string;
            message: string;
        };
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
    refresh_token?: GoogleRefreshToken;
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

export type GSheetUpdatedSource = {
    id: string;
    title: string;
    spreadsheet_id: string;
    sheet_id: number;
    first_line_is_header: boolean;
};

export type UpdateS3BasedConnectionDataArgs = {
    sources: GSheetUpdatedSource[];
    authorized: boolean;
    connection_id?: string;
    refresh_token?: GoogleRefreshToken;
};

export type AddYandexDocumentResponse = {
    file_id: string;
    title: string;
};

export type AddYandexDocumentArgs = {
    authorized: boolean;
    type: 'yadocs';
    private_path?: string;
    public_link?: string;
    oauth_token?: GoogleRefreshToken;
};
