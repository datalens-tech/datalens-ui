import type {SelectOption} from '@gravity-ui/uikit';
import type {Field as TField} from 'shared';
import {DATASET_FIELD_TYPES} from 'shared';

export const getDialogFieldSelectItems = ({
    arr,
    generateTitle,
    generateValue,
    generateQa,
}: {
    arr: string[];
    generateTitle: (value: string) => string;
    generateValue?: (value: string) => string;
    generateQa?: (value: string) => string;
}): SelectOption[] => {
    return arr.map((value): SelectOption => {
        const selectorValue = generateValue ? generateValue(value) : value;
        const qa = generateQa ? generateQa(value) : value;
        return {
            value: selectorValue,
            content: generateTitle(value),
            qa,
        };
    });
};

export const isOneOfPropChanged = <T extends Record<string, any>>(
    obj1: T,
    obj2: T,
    props: (keyof T)[],
) => {
    return props.some((key) => obj1[key] !== obj2[key]);
};

export const getFormattingDataType = (item: TField, cast: DATASET_FIELD_TYPES | undefined) => {
    const data_type = item.data_type as unknown as DATASET_FIELD_TYPES;

    if (cast && Object.values(DATASET_FIELD_TYPES).includes(data_type) && cast !== data_type) {
        return cast as unknown as DATASET_FIELD_TYPES;
    }

    return item.data_type;
};
