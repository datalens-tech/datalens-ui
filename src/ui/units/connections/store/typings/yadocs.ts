import type {
    AddYandexDocumentResponse,
    FileSourceInfo,
    StateStatus,
    UpdateFileSourceResponse,
} from '../../../../../shared/schema';
import type {DataLensApiError} from '../../../../typings';

/** Yandex document from the moment of uploading to successful status polling and requesting sources */
export type UploadedYadoc = {
    type: 'uploadedYadoc';
    status: StateStatus;
    data: AddYandexDocumentResponse & {sources?: FileSourceInfo[]};
    replacedSourceId?: string;
    error?: DataLensApiError | null;
};

/** Brief information on the Yandex document source before successfully obtaining all data on this source */
export type YadocSourceInfo = {
    type: 'yadocSourceInfo';
    status: StateStatus;
    fileId: string;
    data: FileSourceInfo;
    error?: DataLensApiError | null;
};

/** Full information on the Yandex document source. Available for editing */
export type YadocEditableSource = {
    type: 'yadocEditableSource';
    status: StateStatus;
    data: UpdateFileSourceResponse;
    error?: DataLensApiError | null;
};

/** Information on the source of an already created connection. Read-only */
export type YadocReadonlySource = {
    type: 'yadocReadonlySource';
    status: StateStatus;
    data: {
        file_id: string;
        first_line_is_header: boolean;
        id: string;
        status: StateStatus;
        title: string;
        spreadsheet_id: string;
        sheet_id: number;
        raw_schema: UpdateFileSourceResponse['source']['raw_schema'];
        preview: UpdateFileSourceResponse['source']['preview'];
    };
    error?: DataLensApiError | null;
};

export type YadocSource = YadocEditableSource | YadocReadonlySource;

export type YadocItem = UploadedYadoc | YadocSourceInfo | YadocEditableSource | YadocReadonlySource;

type YadocsActiveAddDocument = {
    type: 'dialog-add-document';
};

type YadocsActiveDialogSources = {
    type: 'dialog-sources';
    fileId: string;
    batch?: boolean;
};

export type YadocsActiveDialogRename = {
    type: 'dialog-rename';
    sourceId: string;
    value?: string;
};

export type YadocsActiveDialogReplace = {
    type: 'dialog-replace';
    sourceId: string;
    authorized: boolean;
    connectionId?: string;
    oauthToken?: string;
};

export type YadocsActiveDialog =
    | YadocsActiveAddDocument
    | YadocsActiveDialogSources
    | YadocsActiveDialogRename
    | YadocsActiveDialogReplace;
