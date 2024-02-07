import {ConnectorType} from '../../../constants';
import {ConnectionData} from '../../../types';

import {WorkbookId} from './common';

type BICounter = {
    id: string;
    name: string;
};

type BaseArgs = {
    connectionId: string;
};

type BaseConnectorItem = {
    conn_type: ConnectorType;
    backend_driven_form: boolean;
    hidden: boolean;
    title: string;
    alias?: string;
};

export type ConnectorItem = BaseConnectorItem & {
    includes?: BaseConnectorItem[];
};

export type ConnectorItemSection = {
    title: string;
    connectors: ConnectorItem[];
};

export type EnsureUploadRobotResponse = {
    svc_acct_id: string;
    svc_acct_key_id: string;
    svc_acct_private_key: string;
};

export type EnsureUploadRobotArgs = BaseArgs;

export type GetAvailableCountersResponse = {
    counters: BICounter[];
};

export type GetAvailableCountersArgs = BaseArgs;

export type DeleteConnectionResponse = unknown;

export type DeleteConnectionArgs = BaseArgs;

export type GetConnectorsResponse = {
    /** @deprecated use `sections` & `uncategorized` fields instead */
    result: ConnectorItem[];
    /** Represent groups of connectors */
    sections?: ConnectorItemSection[];
    /** Represent connectors out of groups. These one should be rendered before grouped connectors */
    uncategorized?: ConnectorItem[];
};

export type GetConnectionResponse = ConnectionData;

export type GetConnectionArgs = BaseArgs & WorkbookId;

export type CreateConnectionResponse = {
    id: string;
};

export type ConnectionErrorResponse = {
    code: string;
    message: string;
    details: {data: unknown};
};

export type CreateConnectionArgs = ConnectionData;

export type UpdateConnectionResponse = {};

export type UpdateConnectionArgs = BaseArgs & ConnectionData;

export type VerifyConnectionResponse = {};

export type VerifyConnectionArgs = BaseArgs & ConnectionData & WorkbookId;

export type VerifyConnectionParamsResponse = {};

export type VerifyConnectionParamsArgs = ConnectionData;

export type GetConnectionSourcesResponse = {
    sources: Record<string, string>[];
    freeform_sources: Record<string, string>[];
};

export type GetConnectionSourcesArgs = BaseArgs & WorkbookId;

export type GetConnectionSourceSchemaResponse = {
    raw_schema: Record<string, string>[];
};

export type GetConnectionSourceSchemaArgs = BaseArgs &
    WorkbookId & {
        source: {
            title: string;
            group: string[];
            id: string;
        };
    };
