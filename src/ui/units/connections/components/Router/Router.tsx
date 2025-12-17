import React from 'react';

import {get} from 'lodash';
import type {RouteComponentProps} from 'react-router-dom';
import {Redirect, Route, Switch} from 'react-router-dom';
import {ConnectorType, Feature} from 'shared';
import {ConnectorAlias, URL_QUERY} from 'ui/constants';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

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

const getDefaultPath = ({
    workbookId,
    collectionId,
}: {
    workbookId?: string;
    collectionId?: string;
}) => {
    if (workbookId) {
        return `/workbooks/${workbookId}/connections/new`;
    } else if (collectionId && isEnabledFeature(Feature.EnableSharedEntries)) {
        return `/collections/${collectionId}/connections/new`;
    } else {
        return '/connections/new';
    }
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

type ConnectorProps = {
    readonly: boolean;
} & ({type: ConnectorType} | {connector: ConnectorItem});

const Connector = (props: ConnectorProps) => {
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

    return <ConnectorForm readonly={props.readonly} type={type} />;
};

type Routes = 'newList' | 'newType' | 'exist';
const getPaths = (type: Routes) => {
    const routes: string[] = [];
    switch (type) {
        case 'newList':
            routes.push('/workbooks/:workbookId/connections/new', '/connections/new');
            if (isEnabledFeature(Feature.EnableSharedEntries)) {
                routes.push('/collections/:collectionId/connections/new');
            }
            break;
        case 'newType':
            routes.push(
                '/workbooks/:workbookId/connections/new/:connectorType',
                '/connections/new/:connectorType',
            );
            if (isEnabledFeature(Feature.EnableSharedEntries)) {
                routes.push('/collections/:collectionId/connections/new/:connectorType');
            }
            break;
        case 'exist':
            routes.push(
                '/workbooks/:workbookId/connections/:connectionId',
                '/connections/:connectionId',
            );
            if (isEnabledFeature(Feature.EnableSharedEntries)) {
                routes.push('/collections/:collectionId/connections/:connectionId');
            }
            break;
    }
    return routes;
};

export const Router = ({flattenConnectors, groupedConnectors, connectionData}: RouterProps) => {
    return (
        <React.Suspense fallback={<WrappedLoader />}>
            <Switch>
                <Route
                    path={getPaths('newList')}
                    render={() => (
                        <Switch>
                            <Route
                                exact
                                path={getPaths('newList')}
                                render={(props: ConnListRouteProps) => {
                                    const workbookId = get(props.match.params, 'workbookId');
                                    const collectionId = get(props.match.params, 'collectionId');

                                    return (
                                        <ConnectorsList
                                            flattenConnectors={flattenConnectors}
                                            groupedConnectors={groupedConnectors}
                                            workbookId={workbookId}
                                            collectionId={collectionId}
                                        />
                                    );
                                }}
                            />
                            <Route
                                path={getPaths('newType')}
                                render={(props: NewFormRouteProps) => {
                                    const type = get(props.match.params, 'connectorType');
                                    const connector = getConnItemByType({
                                        connectors: flattenConnectors,
                                        type,
                                    });
                                    const workbookId = get(props.match.params, 'workbookId');
                                    const collectionId = get(props.match.params, 'collectionId');

                                    if (connector) {
                                        return <Connector readonly={false} connector={connector} />;
                                    }

                                    return (
                                        <Redirect to={getDefaultPath({workbookId, collectionId})} />
                                    );
                                }}
                            />
                        </Switch>
                    )}
                />
                <Route
                    path={getPaths('exist')}
                    render={(props: ExistedFormRouteProps) => {
                        const connectionId = get(props.match.params, 'connectionId');
                        const workbookId = get(props.match.params, 'workbookId');
                        const collectionId = get(props.match.params, 'collectionId');
                        const bindedWorkbookId = new URLSearchParams(props.location.search).get(
                            URL_QUERY.BINDED_WOKRBOOK,
                        );
                        const type = connectionData?.[FieldKey.DbType] as ConnectorType;
                        const {extractEntryId} = registry.common.functions.getAll();

                        const extractedId = extractEntryId(connectionId);

                        if (!extractedId) {
                            return <Redirect to={getDefaultPath({workbookId, collectionId})} />;
                        }
                        return <Connector readonly={Boolean(bindedWorkbookId)} type={type} />;
                    }}
                />
            </Switch>
        </React.Suspense>
    );
};
