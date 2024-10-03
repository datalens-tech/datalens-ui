import {v1 as uuid} from 'uuid';

import {
    DUPLICATE_TITLE,
    EMPTY_SOURCE,
    EMPTY_TITLE,
    INVALID_ID,
    NEW_FIELD_PROPERTIES,
} from './constants';
import type {FieldEditorErrors, ModifiedDatasetField} from './typings';

// datalens/backend/lib/bi_core/bi_core/components/ids.py?rev=r9134456#L19
const ID_ALLOWED_CHARS = /^[a-z0-9_-]{1,36}$/;

const isTitleEmpty = (field: ModifiedDatasetField) => {
    const {title = ''} = field;

    return !title.replace(/\s/g, '');
};

const isTitleDuplicate = (field: ModifiedDatasetField, fields: ModifiedDatasetField[]) => {
    const {title: titleCurrent, guid: guidCurrent} = field;

    return fields.some(({title, guid}) => {
        if (guidCurrent === guid) {
            return false;
        }

        const titleCurrentPrepared = titleCurrent.trim();
        const titlePrepared = title.trim();

        return titleCurrentPrepared === titlePrepared;
    });
};

const isSourceEmpty = (field: ModifiedDatasetField) => {
    return !field.source;
};

const isInvalidId = (field: ModifiedDatasetField) => {
    return !ID_ALLOWED_CHARS.test(field.new_id || field.guid);
};

export const createInitialField = () => {
    const guid = uuid();

    return {
        ...NEW_FIELD_PROPERTIES,
        guid,
    } as ModifiedDatasetField;
};

export const createInitialErrors = (): FieldEditorErrors => {
    return {
        duplicateTitle: false,
        emptySource: false,
        emptyTitle: false,
        invalidId: false,
    };
};

export const getErrors = (
    field: ModifiedDatasetField,
    fields: ModifiedDatasetField[],
): FieldEditorErrors => {
    const {calc_mode: calcMode} = field;
    const errors = createInitialErrors();

    errors.duplicateTitle = isTitleDuplicate(field, fields);
    errors.emptyTitle = isTitleEmpty(field);
    errors.invalidId = isInvalidId(field);

    if (calcMode === 'direct') {
        errors.emptySource = isSourceEmpty(field);
    }

    return errors;
};

export const getErrorMessageKey = (reason: string | string[], errors: FieldEditorErrors) => {
    let key;

    if (Array.isArray(reason)) {
        // Even if an array of reasons is passed, there cannot be more than one match
        key = reason.filter((reasonItem) =>
            Boolean(errors[reasonItem as keyof FieldEditorErrors]),
        )[0];
    } else {
        const hasReason = Boolean(errors[reason as keyof FieldEditorErrors]);
        key = hasReason ? reason : '';
    }

    switch (key) {
        case DUPLICATE_TITLE:
            return 'label_field-already-exist';
        case EMPTY_SOURCE:
            return 'label_source-is-empty';
        case EMPTY_TITLE:
            return 'label_title-is-empty';
        case INVALID_ID:
            return 'label_invalid-id';
        default:
            return '';
    }
};

export const validateField = (field: ModifiedDatasetField, fields: ModifiedDatasetField[]) => {
    const errors = getErrors(field, fields);
    return Object.values(errors).every((value) => !value);
};

export const prepareField = (field: ModifiedDatasetField): ModifiedDatasetField => {
    const {title} = field;

    let fixedTitle: string = title.trim();

    if (fixedTitle === '' && field.formula) {
        fixedTitle = field.formula?.trim();

        if (fixedTitle.length > 100) {
            fixedTitle = `${fixedTitle.slice(0, 97)}...`;
        }
    }

    return {
        ...field,
        title: fixedTitle,
    };
};

export const getFieldEditorDocPath = (href: string) => {
    return href.replace(/^\/docs\//, '');
};
