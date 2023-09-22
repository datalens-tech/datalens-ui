import React from 'react';

import block from 'bem-cn-lite';
import {get} from 'lodash';
import {connect} from 'react-redux';
import {RouteChildrenProps, withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {Dispatch, bindActionCreators} from 'redux';
import {ConnectorType, extractEntryId} from 'shared';
import {DatalensGlobalState, PageTitle, SlugifyUrl, Utils} from 'ui';

import {ErrorView, ErrorViewProps, Router, WrappedLoader} from '../';
import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import {ActionPanel} from '../../../../components/ActionPanel';
import withErrorPage from '../../../../components/ErrorPage/withErrorPage';
import {FieldKey} from '../../constants';
import {getConnectorSchema, getConnectors, setInitialState, setPageData} from '../../store';
import {getConnItemByType} from '../../utils';

import ConnPanelActions from './ConnPanelActions';
import {UnloadConfirmation} from './components';
import {useApiErrors} from './useApiErrors';
import {isListPageOpened, isS3BasedConnForm} from './utils';

import './Page.scss';

const b = block('conn-page');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type PageProps = DispatchProps &
    DispatchState &
    RouteChildrenProps<{id?: string; workbookId?: string; type?: ConnectorType}>;

type PageContentProps = Omit<DispatchState, 'entry'> & {
    type: ConnectorType;
    getConnectors: () => void;
    getConnectorSchema: (type: ConnectorType) => void;
};

const PageContent = (props: PageContentProps) => {
    const {
        type,
        apiErrors,
        flattenConnectors,
        groupedConnectors,
        connectionData,
        loading,
        getConnectors: getConnectorsHandler,
        getConnectorSchema: getConnectorSchemaHandler,
    } = props;
    const {error, scope} = useApiErrors({apiErrors});

    if (loading) {
        return <WrappedLoader />;
    }

    if (error) {
        let handler: NonNullable<ErrorViewProps['action']>['handler'];

        if (scope === 'connectors') {
            handler = getConnectorsHandler;
        } else if (scope === 'schema') {
            handler = () => getConnectorSchemaHandler(type);
        }

        const action: ErrorViewProps['action'] = {handler};

        return <ErrorView error={error} scope={scope} action={action} />;
    }

    return (
        <Router
            flattenConnectors={flattenConnectors}
            groupedConnectors={groupedConnectors}
            connectionData={connectionData}
        />
    );
};

const PageComponent = (props: PageProps) => {
    const {
        history,
        actions,
        apiErrors,
        flattenConnectors,
        groupedConnectors,
        entry,
        connectionData,
        loading,
    } = props;
    const entryId = get(props.match?.params, 'id', '');
    const extractedEntryId = extractEntryId(entryId);
    const workbookId = get(props.match?.params, 'workbookId');
    const queryType = get(props.match?.params, 'type', '');
    const connector = getConnItemByType({connectors: flattenConnectors, type: queryType});
    const type = (connector?.conn_type || queryType) as ConnectorType;
    const listPageOpened = isListPageOpened(location.pathname);
    const s3BasedFormOpened = isS3BasedConnForm(connectionData, type);

    let isShowCreateButtons = true;

    if (entry?.workbookId && !(entry as {fake?: boolean}).fake) {
        isShowCreateButtons = Boolean(entry.permissions?.edit);
    }

    React.useEffect(() => {
        return () => {
            actions.setInitialState();
        };
    }, [actions]);

    React.useEffect(() => {
        if (listPageOpened) {
            actions.setInitialState();
        }
    }, [actions, type, listPageOpened]);

    React.useEffect(() => {
        actions.setPageData({entryId: extractedEntryId, workbookId});
    }, [actions, extractedEntryId, workbookId]);

    return (
        <React.Fragment>
            <PageTitle entry={entry} />
            <SlugifyUrl
                entryId={entry?.entryId}
                name={Utils.getEntryNameFromKey(entry?.key || '')}
                history={history}
            />
            <AccessRightsUrlOpen history={history} />
            {entry && (
                <React.Fragment>
                    <ActionPanel
                        entry={entry}
                        rightItems={
                            isShowCreateButtons && (
                                <ConnPanelActions
                                    entryId={extractedEntryId}
                                    entryKey={(connectionData[FieldKey.Key] as string) || ''}
                                    s3BasedFormOpened={s3BasedFormOpened}
                                    workbookId={workbookId || entry?.workbookId}
                                />
                            )
                        }
                    />
                    <div className={b()}>
                        <PageContent
                            type={type}
                            apiErrors={apiErrors}
                            flattenConnectors={flattenConnectors}
                            groupedConnectors={groupedConnectors}
                            connectionData={connectionData}
                            loading={loading}
                            getConnectors={actions.getConnectors}
                            getConnectorSchema={actions.getConnectorSchema}
                        />
                    </div>
                </React.Fragment>
            )}
            <UnloadConfirmation />
        </React.Fragment>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        apiErrors: state.connections.apiErrors,
        connectionData: state.connections.connectionData,
        entry: state.connections.entry,
        flattenConnectors: state.connections.flattenConnectors,
        groupedConnectors: state.connections.groupedConnectors,
        loading: state.connections.ui.pageLoading,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        actions: bindActionCreators(
            {
                setPageData,
                setInitialState,
                getConnectors,
                getConnectorSchema,
            },
            dispatch,
        ),
    };
};

export const Page = compose<PageProps, {}>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(withErrorPage(PageComponent));
