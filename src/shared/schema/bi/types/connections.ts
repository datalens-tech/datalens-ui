import type {ConnectorType} from '../../../constants';
import type {
    ConnectionData,
    ConnectionTypedQueryApiRequest,
    ConnectionTypedQueryApiResponse,
    EntryAnnotationArgs,
    TransferNotification,
} from '../../../types';

import type {WorkbookIdArg} from './common';

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
    /**
     * Controls the behavior of connector's list item in the list.
     *
     * 1. `free` - connector **is** shown in the list and **is** available for creation
     * 2. `hidden` - connector **is not** shown in the list and **is** available for creation
     * 3. `uncreatable` - connector **is not** shown in the list and **is not** available for creation
     */
    visibility_mode: 'free' | 'hidden' | 'uncreatable';
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

export type GetConnectionArgs = BaseArgs & WorkbookIdArg;

export type CreateConnectionResponse = {
    id: string;
};

export type ConnectionErrorResponse = {
    code: string;
    message: string;
    details: {data: unknown};
};

export type CreateConnectionArgs = ConnectionData & {annotation: EntryAnnotationArgs};

export type UpdateConnectionResponse = {};

export type UpdateConnectionArgs = BaseArgs & ConnectionData & {annotation: EntryAnnotationArgs};

export type VerifyConnectionResponse = {};

export type VerifyConnectionArgs = BaseArgs & ConnectionData & WorkbookIdArg;

export type VerifyConnectionParamsResponse = {};

export type VerifyConnectionParamsArgs = ConnectionData;

export type GetConnectionSourcesResponse = {
    sources: Record<string, string>[];
    freeform_sources: Record<string, string>[];
};

export type GetConnectionSourcesArgs = BaseArgs & WorkbookIdArg;

export type GetConnectionSourceSchemaResponse = {
    raw_schema: Record<string, string>[];
};

export type GetConnectionSourceSchemaArgs = BaseArgs &
    WorkbookIdArg & {
        source: {
            title: string;
            group: string[];
            id: string;
        };
    };

export type GetConnectionTypedQueryDataArgs = BaseArgs &
    WorkbookIdArg & {body: ConnectionTypedQueryApiRequest};

export type GetConnectionTypedQueryDataResponse = ConnectionTypedQueryApiResponse;

export type GetConnectionTypedQueryErrorResponse = {
    status: number;
    message: string;
    code: string;
    details?: {
        title?: string;
        description?: string;
        db_message?: string;
    };
    requestId: string;
};

export type ConnectorIconView = 'standard' | 'nav';

type ConnectorIconDataMap = Record<ConnectorIconView, string>;

export type ConnectorIconData = {conn_type: string} & (
    | {
          /** Indicates that icons data store in base64 format. */
          type: 'data';
          /** Map of links to sources on s3 or icons in base64 format. */
          data: ConnectorIconDataMap;
      }
    | {
          /** Indicates that icons data store as links on cdn. */
          type: 'url';
          /** Map of links to sources on s3 or icons in base64 format. */
          url: ConnectorIconDataMap;
      }
);

export type ListConnectorIconsResponse = {
    icons: ConnectorIconData[];
};

export type ExportConnectionArgs = {
    usMasterToken: string;
    connectionId: string;
    workbookId?: string | null;
};

export type ExportConnectionResponse = {
    connection: ConnectionData;
    notifications: TransferNotification[];
};

export type ImportConnectionResponse = {
    id: string;
    notifications: TransferNotification[];
};

export type ImportConnectionArgs = {
    usMasterToken: string;
    workbookId: string;
    connection: ConnectionData;
};
