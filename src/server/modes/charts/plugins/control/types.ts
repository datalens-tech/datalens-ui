import {
    type ConnectionQueryContent,
    ConnectionQueryTypeValues,
    DashTabItemControlElementType,
    DashTabItemControlSourceType,
    DatasetFieldType,
} from '../../../../../shared';

export type ControlShared = {
    title: string;
    source: {
        fieldName: string;
        datasetId: string;
        fieldType: string;
        showTitle: boolean;
        isRange: boolean;
        multiselectable: boolean;
        elementType: DashTabItemControlElementType;
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
        required?: boolean;
        connectionId?: string;
        connectionQueryType?: ConnectionQueryTypeValues;
        connectionQueryContent?: ConnectionQueryContent;
    };
    sourceType: DashTabItemControlSourceType;
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
    required?: boolean;
};
