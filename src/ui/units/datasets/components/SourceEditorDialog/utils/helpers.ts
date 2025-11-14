import {DL} from '../../../../../';
import {I18n} from '../../../../../../i18n';
import type {FormValidationError} from '../../../helpers/validation';
import {VALIDATION_ERROR} from '../../../helpers/validation';
import type {FreeformSource, TranslatedItem} from '../../../store/types';
import type {InputFormItemProps} from '../components';
import type {EditedSource} from '../types';

const i18n = I18n.keyset('dataset.sources-tab.modify');
const i18nValidation = I18n.keyset('dataset.validation');

const TABLE_NAME_INPUT = 'table_name';
const DIRECTORY_PATH_INPUT = 'directory_path';
const RANGE_FROM_INPUT = 'range_from';
const RANGE_TO_INPUT = 'range_to';
export const TITLE_INPUT = 'title';
export const TABLE_NAMES_INPUT = 'table_names';
export const BASE_TITLE_FORM_OPTIONS: Pick<
    InputFormItemProps,
    'name' | 'input_type' | 'title' | 'required' | 'default'
> = {
    name: TITLE_INPUT,
    input_type: 'text',
    default: '',
    title: i18n('label_title'),
    required: true,
};

const getActualPath = (path: string) => {
    let actualPath = path;

    try {
        const url = new URL(path);

        const pathParam = url.searchParams.get('path');

        if (pathParam) {
            actualPath = pathParam;
        }
    } catch {}

    return actualPath;
};

const getTableName = (path: string) => {
    let tableName = path;

    if (path) {
        const match = path.match(/[^/]+$/);

        if (match) {
            tableName = match[0];
        }
    }

    return tableName;
};

const getListTitle = (tableNames: string[] = []) => {
    return tableNames.length ? `(${tableNames.join(',')})` : '';
};

const getRangeTitle = (path = '', rangeFrom = '', rangeTo = '') => {
    if (!path && !rangeFrom && !rangeTo) {
        return '';
    }

    let agrsString = `${path}`;

    if (rangeTo) {
        agrsString += `, ${rangeFrom}, ${rangeTo}`;
    } else if (rangeFrom) {
        agrsString += `, ${rangeFrom}`;
    }

    return `(${agrsString})`;
};

export const getPaths = (pathString = '') => {
    return pathString.split(/[\n\r]/g).filter(Boolean);
};

export const getTranslate = (item: TranslatedItem | string) => {
    if (typeof item === 'object') {
        const lang = (DL.USER_LANG || 'ru') as keyof TranslatedItem;
        return item[lang];
    }

    return item;
};

export const getErrorText = (errors: FormValidationError[], key: string) => {
    const errorType = errors.find(({name}) => name === key)?.type;

    switch (errorType) {
        // TYPE_ERROR in this case is equivalent to the absence of a value,
        // because sometimes a field with a null value can come from the backup
        case VALIDATION_ERROR.REQUIRED:
        case VALIDATION_ERROR.TYPE_ERROR: {
            return i18nValidation('label_required-field-error');
        }
        case VALIDATION_ERROR.HAS_DUPLICATES: {
            return i18nValidation('label_duplicated_paths_error');
        }
        case VALIDATION_ERROR.HAS_DUPLICATED_TITLES: {
            return i18nValidation('label_duplicated_titles_error');
        }
        default: {
            return '';
        }
    }
};

export const getUpdatedInputName = (update: Record<string, string>) => {
    return Object.keys(update)[0];
};

export const getSelectedFreeformSourceByType = (
    type: string,
    freeformSources: FreeformSource[],
) => {
    return freeformSources.find(({source_type}) => source_type === type);
};

export const getInitialSelectedFreeformSource = (
    source: EditedSource,
    freeformSources: FreeformSource[],
) => {
    if ('id' in source) {
        return getSelectedFreeformSourceByType(source.source_type, freeformSources);
    }

    return freeformSources[0];
};

export const getPreparedSource = (
    source: EditedSource,
    selectedFreeformSource: FreeformSource,
): EditedSource => {
    const parameters = selectedFreeformSource.form.reduce(
        (acc, {name}) => {
            acc[name] = source.parameters[name] || '';
            return acc;
        },
        {} as EditedSource['parameters'],
    );

    return {...source, parameters};
};

export const getUpdatedSource = (
    source: EditedSource,
    update: {[k: string]: string},
): EditedSource => {
    const nextSource = {...source};

    if (TITLE_INPUT in update) {
        nextSource.title = update.title;
    } else {
        const inputName = getUpdatedInputName(update);
        const inputValue = update[inputName];

        switch (inputName) {
            case TABLE_NAME_INPUT: {
                nextSource.title = getTableName(inputValue);
                nextSource.parameters = {
                    ...nextSource.parameters,
                    [TABLE_NAME_INPUT]: getActualPath(inputValue),
                };

                break;
            }
            case TABLE_NAMES_INPUT: {
                const tablesPaths = getPaths(inputValue);
                const tableNamesNext = tablesPaths.map(getTableName);

                nextSource.title = getListTitle(tableNamesNext);
                nextSource.parameters = {
                    ...nextSource.parameters,
                    [TABLE_NAMES_INPUT]: getActualPath(inputValue),
                };

                break;
            }
            case DIRECTORY_PATH_INPUT: {
                const rangeFrom = nextSource.parameters[RANGE_FROM_INPUT];
                const rangeTo = nextSource.parameters[RANGE_TO_INPUT];
                const actualPath = getActualPath(inputValue);
                const directoryNameNext = getTableName(actualPath);

                nextSource.title = getRangeTitle(directoryNameNext, rangeFrom, rangeTo);
                nextSource.parameters = {
                    ...nextSource.parameters,
                    [DIRECTORY_PATH_INPUT]: getActualPath(inputValue),
                };

                break;
            }
            case RANGE_FROM_INPUT: {
                const rangeTo = nextSource.parameters[RANGE_TO_INPUT];
                const directoryPath = nextSource.parameters[DIRECTORY_PATH_INPUT];
                const directoryName = getTableName(directoryPath);

                nextSource.title = getRangeTitle(directoryName, inputValue, rangeTo);
                nextSource.parameters = {
                    ...nextSource.parameters,
                    [RANGE_FROM_INPUT]: inputValue,
                };

                break;
            }
            case RANGE_TO_INPUT: {
                const rangeFrom = nextSource.parameters[RANGE_FROM_INPUT];
                const directoryPath = nextSource.parameters[DIRECTORY_PATH_INPUT];
                const directoryName = getTableName(directoryPath);

                nextSource.title = getRangeTitle(directoryName, rangeFrom, inputValue);
                nextSource.parameters = {
                    ...nextSource.parameters,
                    [RANGE_TO_INPUT]: inputValue,
                };

                break;
            }
            default: {
                nextSource.parameters = {
                    ...nextSource.parameters,
                    ...update,
                };
            }
        }
    }

    return nextSource;
};

export const mergeSources = (
    source: EditedSource,
    freeformSource: FreeformSource,
): EditedSource => ({
    ...source,
    ...freeformSource,
    title: source.title,
    parameters: {...source.parameters},
});
