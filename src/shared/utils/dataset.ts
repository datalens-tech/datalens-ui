import isEmpty from 'lodash/isEmpty';

import {isDimensionField} from '../modules/helpers';
import {type DatasetField, type FieldUISettings, isNumberField} from '../types';

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

export const isDisplaySettingsAvailable = ({field}: {field: DatasetField}) => {
    const isNumberFormattingAvailable = isNumberField(field);
    const isColoringAvailable = isDimensionField(field);

    return isNumberFormattingAvailable || isColoringAvailable;
};

export const isFieldWithDisplaySettings = ({field}: {field: DatasetField}) => {
    const settings = getFieldUISettings({field});

    return [settings?.numberFormatting, settings?.colors].some((d) => !isEmpty(d));
};
