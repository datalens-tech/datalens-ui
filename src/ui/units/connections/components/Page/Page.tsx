import React from 'react';

import {Button, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import get from 'lodash/get';
import omit from 'lodash/omit';
import {connect} from 'react-redux';
import type {RouteChildrenProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {type ConnectorType, Feature} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {PageTitle, SlugifyUrl, URL_QUERY, Utils} from 'ui';
import type {FilterEntryContextMenuItems} from 'ui/components/EntryContextMenu';
import {SharedEntryIcon} from 'ui/components/SharedEntryIcon/SharedEntryIcon';
import {registry} from 'ui/registry';
import {
    closeDialog,
    openDialog,
    openDialogErrorWithTabs,
    openDialogSaveDraftChartAsActualConfirm,
} from 'ui/store/actions/dialog';
import type {DataLensApiError} from 'ui/typings';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {ErrorViewProps} from '../';
import {ErrorView, Router, WrappedLoader} from '../';
import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import {ActionPanel} from '../../../../components/ActionPanel';
import withErrorPage from '../../../../components/ErrorPage/withErrorPage';
import {FieldKey} from '../../constants';
import {
    getConnectionData,
    getConnectorSchema,
    getConnectors,
    setInitialState,
    setPageData,
    updateConnectionWithRevision,
} from '../../store';
import {getConnItemByType} from '../../utils';

import ConnPanelActions from './ConnPanelActions';
import {DescriptionButton, UnloadConfirmation} from './components';
import {ConnSettings} from './components/ConnSettings';
import {filterMenuItems} from './filterContextMenuItems';
import {useAdditionalContextMenuItems} from './useAdditionalContextMenuItems';
import {useApiErrors} from './useApiErrors';
import {getIsSharedConnection, isListPageOpened, isS3BasedConnForm} from './utils';

import './Page.scss';

const b = block('conn-page');
const i18n = I18n.keyset('connections.form');

type DispatchState = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type PageProps = DispatchProps &
    DispatchState &
    RouteChildrenProps<{id?: string; workbookId?: string; type?: ConnectorType}>;

type PageContentProps = Omit<DispatchState, 'entry' | 'loading'> & {
    type: ConnectorType;
    getConnectionData: (revId?: string) => void;
    getConnectors: () => void;
    getConnectorSchema: (type: ConnectorType) => void;
    openDialogErrorWithTabs: typeof openDialogErrorWithTabs;
    revId?: string;
};

const PageContent = (props: PageContentProps) => {
    const {
        type,
        apiErrors,
        flattenConnectors,
        groupedConnectors,
        connectionData,
        revId,
        getConnectionData,
    } = props;
    const {error, scope, details} = useApiErrors({apiErrors});
    const getConnectionDataHandler = React.useCallback(
        () => getConnectionData(revId),
        [revId, getConnectionData],
    );

    if (error) {
        let handler: NonNullable<ErrorViewProps['action']>['handler'];
        let content: React.ReactNode | undefined;

        switch (scope) {
            case 'connection': {
                if (details.includes('platform-permission-required')) {
                    content = (
                        <div style={{display: 'flex', columnGap: 10, marginTop: 20}}>
                            <Button view="action" onClick={getConnectionDataHandler}>
                                {i18n('button_retry')}
                            </Button>
                            <Button
                                view="outlined"
                                onClick={() => {
                                    props.openDialogErrorWithTabs({
                                        error: omit(error, 'details') as DataLensApiError,
                                        title: i18n('label_error-403-title'),
                                    });
                                }}
                            >
                                {i18n('button_details')}
                            </Button>
                        </div>
                    );
                } else {
                    handler = getConnectionDataHandler;
                }
                break;
            }
            case 'connectors': {
                handler = props.getConnectors;
                break;
            }
            case 'schema': {
                handler = () => props.getConnectorSchema(type);
            }
        }

        const action: ErrorViewProps['action'] = {handler, content};

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
        entry: originalEntry,
        connectionData,
        loading,
    } = props;
    const entryId = get(props.match?.params, 'id', '');
    const {extractEntryId} = registry.common.functions.getAll();
    const extractedEntryId = extractEntryId(entryId);
    const workbookId = get(props.match?.params, 'workbookId');
    const collectionId = get(props.match?.params, 'collectionId');
    const queryType = get(props.match?.params, 'type', '');
    const currentSearchParams = new URLSearchParams(location.search);
    const bindedWorkbookId = currentSearchParams.get(URL_QUERY.BINDED_WORKBOOK);
    const bindedDatasetId = currentSearchParams.get(URL_QUERY.BINDED_DATASET);
    const isSharedConnection = getIsSharedConnection(originalEntry);
    const isWorkbookSharedEntry = isSharedConnection && bindedWorkbookId && !bindedDatasetId;
    const isReadonly = isSharedConnection && (bindedWorkbookId || bindedDatasetId);

    const entry = isWorkbookSharedEntry
        ? {...originalEntry, workbookId: bindedWorkbookId, collectionId: null}
        : originalEntry;
    const connectorType = entry?.type || queryType;
    const connector = getConnItemByType({connectors: flattenConnectors, type: connectorType});
    const type = (connector?.conn_type || queryType) as ConnectorType;
    const listPageOpened = isListPageOpened(location.pathname);
    const s3BasedFormOpened = isS3BasedConnForm(connectionData, type);

    const isFakeEntry = entry && (entry as {fake?: boolean}).fake;

    const isExportSettingsFeatureEnabled = isEnabledFeature(Feature.EnableExportSettings);

    const revisionsSupported = connector?.history;
    const revId = currentSearchParams.get(URL_QUERY.REV_ID) ?? undefined;

    const showSettings = !connector?.backend_driven_form;
    let isShowCreateButtons = true;

    if (entry?.workbookId && !isFakeEntry) {
        isShowCreateButtons = Boolean(entry.permissions?.edit);
    }

    if (isSharedConnection && bindedDatasetId) {
        isShowCreateButtons = false;
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
        actions.setPageData({
            entryId: extractedEntryId,
            workbookId,
            collectionId,
            rev_id: revId,
            bindedWorkbookId,
            bindedDatasetId,
        });
    }, [
        actions,
        extractedEntryId,
        workbookId,
        revId,
        collectionId,
        bindedWorkbookId,
        bindedDatasetId,
    ]);

    const setActualVersion = React.useMemo(
        () =>
            revisionsSupported
                ? () => {
                      actions.openDialogSaveDraftChartAsActualConfirm({
                          onApply: () => {
                              actions.updateConnectionWithRevision();
                          },
                      });
                  }
                : undefined,
        [revisionsSupported, actions],
    );

    const filterEntryContextMenuItems: FilterEntryContextMenuItems = React.useCallback(
        ({items}) =>
            filterMenuItems({
                items,
                revisionsSupported,
                isSharedConnection,
                isWorkbookSharedEntry: Boolean(isWorkbookSharedEntry),
            }),
        [revisionsSupported, isSharedConnection, isWorkbookSharedEntry],
    );

    const additionalEntryContextMenuItems = useAdditionalContextMenuItems({
        entry: originalEntry,
        isFakeEntry,
        bindedWorkbookId,
        bindedDatasetId,
    });

    const lastCrumbAdditionalContent = React.useMemo(
        () =>
            isWorkbookSharedEntry ? (
                <SharedEntryIcon className={spacing({ml: 2})} isDelegated={entry?.isDelegated} />
            ) : undefined,
        [isWorkbookSharedEntry, entry],
    );

    const actionPanelCenterItems = React.useMemo(
        () =>
            isReadonly
                ? [
                      <Button
                          key="workbook-shared-entry-original-link"
                          view="normal-contrast"
                          onClick={() => {
                              history.push(location.pathname);
                          }}
                      >
                          {getSharedEntryMockText('workbook-shared-entry-original-link')}
                      </Button>,
                  ]
                : undefined,
        [isReadonly, history],
    );

    return (
        <React.Fragment>
            <PageTitle entry={entry} />
            <SlugifyUrl
                entryId={entry?.entryId}
                name={Utils.getEntryNameFromKey(entry?.key || '')}
                history={history}
            />
            <AccessRightsUrlOpen history={history} />
            <div className={b()}>
                {entry && (
                    <ActionPanel
                        className={b('action-panel', {readonly: Boolean(isReadonly)})}
                        entry={entry}
                        lastCrumbAdditionalContent={lastCrumbAdditionalContent}
                        centerItems={actionPanelCenterItems}
                        rightItems={[
                            showSettings && isExportSettingsFeatureEnabled && (
                                <ConnSettings
                                    className={spacing({mr: 2})}
                                    key="additional-actions"
                                    connectionId={extractedEntryId}
                                />
                            ),
                            <DescriptionButton
                                key="connection-description"
                                isS3BasedConnForm={s3BasedFormOpened}
                            />,
                            isShowCreateButtons && (
                                <ConnPanelActions
                                    key="conn-panel-actions"
                                    entryId={extractedEntryId}
                                    entryKey={(connectionData[FieldKey.Key] as string) || ''}
                                    s3BasedFormOpened={s3BasedFormOpened}
                                    workbookId={workbookId || entry?.workbookId || bindedWorkbookId}
                                />
                            ),
                        ]}
                        setActualVersion={setActualVersion}
                        filterEntryContextMenuItems={filterEntryContextMenuItems}
                        additionalEntryItems={additionalEntryContextMenuItems}
                    />
                )}
                {loading || !entry ? (
                    <WrappedLoader withHeightOffset={Boolean(entry)} />
                ) : (
                    <PageContent
                        type={type}
                        apiErrors={apiErrors}
                        flattenConnectors={flattenConnectors}
                        groupedConnectors={groupedConnectors}
                        connectionData={connectionData}
                        getConnectionData={actions.getConnectionData}
                        getConnectors={actions.getConnectors}
                        getConnectorSchema={actions.getConnectorSchema}
                        openDialogErrorWithTabs={actions.openDialogErrorWithTabs}
                        revId={revId}
                    />
                )}
            </div>
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
                getConnectionData,
                getConnectors,
                getConnectorSchema,
                openDialogErrorWithTabs,
                openDialogSaveDraftChartAsActualConfirm,
                updateConnectionWithRevision,
                openDialog,
                closeDialog,
            },
            dispatch,
        ),
    };
};

export const Page = compose<PageProps, {}>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(withErrorPage(PageComponent));
