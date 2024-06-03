import React from 'react';

import {get} from 'lodash';
import type {RouteComponentProps} from 'react-router-dom';
import {Redirect, Route, Switch} from 'react-router-dom';
import {ConnectorType} from 'shared';
import {ConnectorAlias} from 'ui/constants';
import {registry} from 'ui/registry';

import {ChOverYT, ConnectorForm, ConnectorsList, File, GSheetsV2, Yadocs} from '../';
import type {ConnectorItem, GetConnectorsResponse} from '../../../../../shared/schema';
import {FieldKey} from '../../constants';
import type {FormDict} from '../../typings';
import {getConnItemByType} from '../../utils';
import {WrappedLoader} from '../WrappedLoader/WrappedLoader';

type RouterProps = {
    flattenConnectors: ConnectorItem[];
    groupedConnectors: GetConnectorsResponse;
    connectionData: FormDict;
};

type ConnListRouteProps = RouteComponentProps<{workbookId?: string}>;

type NewFormRouteProps = RouteComponentProps<{
    connectorType: ConnectorType;
    workbookId?: string;
}>;

type ExistedFormRouteProps = RouteComponentProps<{
    connectionId: string;
    workbookId?: string;
}>;

const getDefaultPath = (workbookId?: string) => {
    return workbookId ? `/workbooks/${workbookId}/connections/new` : '/connections/new';
};

// This component strongly relies on `connector.alias` field
const MetaConnector = (props: {connector?: ConnectorItem}) => {
    const {connector} = props;

    if (!connector || !connector.includes?.length) {
        return null;
    }

    switch (connector.alias) {
        case ConnectorAlias.CHYT: {
            return <ChOverYT connectors={connector.includes} />;
        }
    }

    return null;
};

const Connector = (props: {type: ConnectorType} | {connector: ConnectorItem}) => {
    const type = 'connector' in props ? props.connector.conn_type : props.type;

    if ('connector' in props && type === ConnectorType.__Meta__) {
        return <MetaConnector connector={props.connector} />;
    }

    switch (type) {
        case ConnectorType.File:
            return <File />;
        case ConnectorType.GsheetsV2:
            return <GSheetsV2 />;
        case ConnectorType.Yadocs:
            return <Yadocs />;
    }

    return <ConnectorForm type={type} />;
};

export const Router = ({flattenConnectors, groupedConnectors, connectionData}: RouterProps) => {
    return (
        <React.Suspense fallback={<WrappedLoader />}>
            <Switch>
                <Route
                    path={['/workbooks/:workbookId/connections/new', '/connections/new']}
                    render={() => (
                        <Switch>
                            <Route
                                exact
                                path={[
                                    '/workbooks/:workbookId/connections/new',
                                    '/connections/new',
                                ]}
                                render={(props: ConnListRouteProps) => {
                                    const workbookId = get(props.match.params, 'workbookId');
                                    return (
                                        <ConnectorsList
                                            flattenConnectors={flattenConnectors}
                                            groupedConnectors={groupedConnectors}
                                            workbookId={workbookId}
                                        />
                                    );
                                }}
                            />
                            <Route
                                path={[
                                    '/workbooks/:workbookId/connections/new/:connectorType',
                                    '/connections/new/:connectorType',
                                ]}
                                render={(props: NewFormRouteProps) => {
                                    const type = get(props.match.params, 'connectorType');
                                    const connector = getConnItemByType({
                                        connectors: flattenConnectors,
                                        type,
                                    });
                                    const workbookId = get(props.match.params, 'workbookId');

                                    if (connector) {
                                        return <Connector connector={connector} />;
                                    }

                                    return <Redirect to={getDefaultPath(workbookId)} />;
                                }}
                            />
                        </Switch>
                    )}
                />
                <Route
                    path={[
                        '/workbooks/:workbookId/connections/:connectionId',
                        '/connections/:connectionId',
                    ]}
                    render={(props: ExistedFormRouteProps) => {
                        const connectionId = get(props.match.params, 'connectionId');
                        const workbookId = get(props.match.params, 'workbookId');
                        const type = connectionData?.[FieldKey.DbType] as ConnectorType;
                        const {extractEntryId} = registry.common.functions.getAll();

                        const extractedId = extractEntryId(connectionId);

                        if (!extractedId) {
                            return <Redirect to={getDefaultPath(workbookId)} />;
                        }

                        return <Connector type={type} />;
                    }}
                />
            </Switch>
        </React.Suspense>
    );
};
