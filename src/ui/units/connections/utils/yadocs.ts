import {I18n} from 'i18n';
import type {DataLensApiError} from 'ui/typings';
import {parseError} from 'ui/utils/errors/parse';

import {ConverterErrorCode} from '../constants';
import type {YadocItem} from '../store';

const i18nGSheet = I18n.keyset('connections.gsheet.view');
const i18nYadocs = I18n.keyset('connections.yadocs.view');

const getErrorTitle = ({type, code}: {type: YadocItem['type']; code: string}) => {
    switch (code) {
        case ConverterErrorCode.FILE_LIMIT_EXCEEDED: {
            return i18nGSheet('label_file-limit-exceeded');
        }
        case ConverterErrorCode.INVALID_LINK: {
            return i18nGSheet('label_invalid-link');
        }
        case ConverterErrorCode.NOT_FOUND: {
            return i18nGSheet('label_file-not-found');
        }
        case ConverterErrorCode.NO_DATA: {
            return i18nGSheet('label_empty-file');
        }
        case ConverterErrorCode.PERMISSION_DENIED: {
            return i18nGSheet('label_403-title');
        }
        case ConverterErrorCode.TOO_MANY_COLUMNS: {
            return i18nGSheet('label_too-many-columns');
        }
        case ConverterErrorCode.UNSUPPORTED_DOCUMENT: {
            return i18nGSheet('label_unsupported-document');
        }
    }

    // Defaults
    switch (type) {
        case 'uploadedYadoc': {
            return i18nGSheet('label_gsheet-uploading-failure');
        }
        default: {
            return i18nGSheet('label_source-info-failed');
        }
    }
};

const getErrorDescription = ({code}: {code?: string}) => {
    switch (code) {
        case ConverterErrorCode.PERMISSION_DENIED: {
            return i18nYadocs('label_403-not-authotized-description');
        }
        default: {
            return '';
        }
    }
};

// TODO: https://github.com/datalens-tech/datalens-ui/issues/375
export const getYadocErrorData = ({
    type,
    error,
}: {
    type: YadocItem['type'];
    error: DataLensApiError;
}) => {
    const {code} = parseError(error);
    const title = getErrorTitle({type, code});
    const description = getErrorDescription({code});

    return {title, description};
};
