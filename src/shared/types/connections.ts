import {ConnectionQueryTypeValues} from '../constants';

export type ConnectionData = Record<
    string,
    string | number | boolean | unknown[] | null | undefined | ConnectionOptions
>;

export type ConnectionOptions = {
    allow_dashsql_usage: boolean;
    allow_dataset_usage: boolean;
    allow_typed_query_usage: boolean;
    query_types: ConnectionQueryType[];
};

export type ConnectionQueryType = {
    query_type: ConnectionQueryTypeValues;
    query_type_label: string;
    allow_selector: boolean;
    required_parameters: ConnectionRequiredParameter[];
};

export type ConnectionRequiredParameter = {
    name: string;
    data_type: string;
};

export type ConnectionQueryContent = {
    query: string;
};
