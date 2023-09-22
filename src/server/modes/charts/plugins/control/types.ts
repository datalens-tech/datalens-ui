import {DatasetFieldType} from '../../../../../shared';

export type ControlShared = {
    title: string;
    source: {
        fieldName: string;
        datasetId: string;
        fieldType: string;
        showTitle: boolean;
        isRange: boolean;
        multiselectable: boolean;
        elementType: string;
        datasetFieldId: string;
        datasetFieldType: DatasetFieldType;
        acceptableValues:
            | {
                  value: string;
                  title: string;
              }[]
            | {
                  from: string;
                  to: string;
              };
        defaultValue: any;
    };
    sourceType: 'dataset' | 'manual';
    type: 'control_dash';
    param: string;
    uiControl?: UIControl;
    content: {
        title: string;
        value: string;
    }[];
};

export type UIControl = {
    label: string;
    multiselect: boolean;
    content: {
        title: string;
        value: string;
    }[];
    param: string;
    type?: string;
    minDate?: string;
    maxDate?: string;
};
