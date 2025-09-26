import isEmpty from 'lodash/isEmpty';

import type {DatasetField, FieldUISettings} from '../types';

export const getFieldUISettings = ({field}: {field: DatasetField | undefined}) => {
    const value = field?.ui_settings;
    let result: FieldUISettings | null = null;
    try {
        if (value) {
            result = JSON.parse(value);
        }
    } catch (e) {
        console.error('Incorrect ui_settings value', e);
    }

    return result;
};

export const isFieldWithDisplaySettings = ({field}: {field: DatasetField}) => {
    const settings = getFieldUISettings({field});

    return !isEmpty(settings?.numberFormatting);
};
