import {I18n} from 'i18n';
import type {DataLensApiError} from 'ui/typings';
import {parseError} from 'ui/utils/errors/parse';

import {ConverterErrorCode} from '../constants';
import type {GSheetItem} from '../store';

const i18n = I18n.keyset('connections.gsheet.view');

const getErrorTitle = ({type, code}: {type: GSheetItem['type']; code: string}) => {
    switch (code) {
        case ConverterErrorCode.FILE_LIMIT_EXCEEDED: {
            return i18n('label_file-limit-exceeded');
        }
        case ConverterErrorCode.INVALID_LINK: {
            return i18n('label_invalid-link');
        }
        case ConverterErrorCode.NOT_FOUND: {
            return i18n('label_file-not-found');
        }
        case ConverterErrorCode.NO_DATA: {
            return i18n('label_empty-file');
        }
        case ConverterErrorCode.PERMISSION_DENIED: {
            return i18n('label_403-title');
        }
        case ConverterErrorCode.TOO_MANY_COLUMNS: {
            return i18n('label_too-many-columns');
        }
        case ConverterErrorCode.UNSUPPORTED_DOCUMENT: {
            return i18n('label_unsupported-document');
        }
    }

    // Defaults
    switch (type) {
        case 'uploadedGSheet': {
            return i18n('label_gsheet-uploading-failure');
        }
        default: {
            return i18n('label_source-info-failed');
        }
    }
};

const getErrorDescription = ({code}: {code?: string}) => {
    switch (code) {
        case ConverterErrorCode.PERMISSION_DENIED: {
            return i18n('label_403-not-authotized-description');
        }
        default: {
            return '';
        }
    }
};

// TODO: https://github.com/datalens-tech/datalens-ui/issues/375
export const getGSheetErrorData = ({
    type,
    error,
}: {
    type: GSheetItem['type'];
    error: DataLensApiError;
}) => {
    const {code} = parseError(error);
    const title = getErrorTitle({type, code});
    const description = getErrorDescription({code});

    return {title, description};
};
