import type {ConnectionQueryTypeValues} from '../../constants';
import type {ConnectionQueryContent} from '../connections';

export type ConnectionTypedQueryApiRequest = {
    query_type: ConnectionQueryTypeValues;
    query_content: ConnectionQueryContent;
    parameters: ConnectionTypedQueryParameter[];
};

export type ConnectionTypedQueryContent = {
    query: string;
};
export type ConnectionTypedQueryParameter = {
    name: string;
    data_type: string;
    value: string;
};

export type ConnectionTypedQueryApiResponse = {
    query_type: ConnectionQueryTypeValues;
    data: {
        headers: ConnectionTypedQueryApiDataHeader[];
        rows: ConnectionTypedQueryApiDataRow[];
    };
    debug_info: ConnectionTypedQueryApiDataDebug;
};

export type ConnectionTypedQueryApiDataHeader = {
    name: string;
    data_type: string;
};

export type ConnectionTypedQueryApiDataRow = Array<string | number | null | boolean>;
export type ConnectionTypedQueryApiDataDebug = {};
