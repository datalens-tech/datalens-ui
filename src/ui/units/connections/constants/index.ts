export * from './form';
export * from './validation';

export const ConverterErrorCode = {
    FILE_LIMIT_EXCEEDED: 'ERR.FILE.FILE_LIMIT_EXCEEDED',
    INVALID_LINK: 'ERR.FILE.INVALID_LINK',
    NOT_FOUND: 'ERR.FILE.NOT_FOUND',
    NO_DATA: 'ERR.FILE.NO_DATA',
    PERMISSION_DENIED: 'ERR.FILE.PERMISSION_DENIED',
    TOO_MANY_COLUMNS: 'ERR.FILE.TOO_MANY_COLUMNS',
    UNSUPPORTED_DOCUMENT: 'ERR.FILE.UNSUPPORTED_DOCUMENT',
};

// TODO: CHARTS-10647 i18n
export const i18n10647 = {
    button_add: 'Add',
    'label_duplicated-keys': 'Duplicated keys',
    'label_secret-value': 'Secret value',
};
