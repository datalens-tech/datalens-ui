import React from 'react';

import {Button, RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DatalensGlobalState} from 'ui';
import {NavigationMinimal, sdk} from 'ui';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';
import {DL} from 'ui/constants/common';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import Utils from 'ui/utils/utils';

import {EntryScope, Feature, PLACE, QLChartType, ViewSetupQA} from '../../../../../../shared';
import type {GetEntryResponse} from '../../../../../../shared/schema';
import logger from '../../../../../libs/logger';
import {getSdk} from '../../../../../libs/schematic-sdk';
import {registry} from '../../../../../registry';
import {AppStatus} from '../../../constants';
import {performManualConfiguration, setError, setStatus} from '../../../store/actions/ql';
import {getDefaultPath, getEntry} from '../../../store/reducers/ql';
import type {QLConnectionEntry, QLEntry} from '../../../store/typings/ql';

import './ViewSetup.scss';

const b = block('ql-view-setup');

interface ViewSetupProps {
    entry: QLEntry | null;
    defaultPath: string;
    setStatus: (status: AppStatus) => void;
    setError: ({error}: {error: Error}) => void;
    performManualConfiguration: ({
        connection,
        chartType,
    }: {
        connection: QLConnectionEntry;
        chartType: QLChartType;
    }) => void;
}

type ViewSetupInnerProps = ViewSetupProps & RouteComponentProps<{}>;

interface ViewSetupState {
    title: string;
    chartType: QLChartType;
    isNavigationVisible: boolean;
    connection: QLConnectionEntry | null;
    showConnectionError: boolean;
}

class ViewSetupComponent extends React.PureComponent<ViewSetupInnerProps, ViewSetupState> {
    navigationButtonRef: React.RefObject<HTMLDivElement>;
    defaultMonitoringQLConnection: QLConnectionEntry | null = null;

    constructor(props: ViewSetupInnerProps) {
        super(props);

        this.navigationButtonRef = React.createRef();

        let initialChartType = QLChartType.Sql;

        const urlChartType = location.href.match(/\/new\/([^?]+)(\?.+)?/);
        if (urlChartType) {
            initialChartType = decodeURIComponent(urlChartType[1]) as QLChartType;
        }

        if (
            ![QLChartType.Sql, QLChartType.Promql, QLChartType.Monitoringql].includes(
                initialChartType,
            )
        ) {
            initialChartType = QLChartType.Sql;
        }

        if (
            initialChartType === QLChartType.Monitoringql &&
            isEnabledFeature(Feature.EnableCustomMonitoring)
        ) {
            const getDefaultMonitoringQLConnectionId = registry.ql.functions.get(
                'getDefaultMonitoringQLConnectionId',
            );

            const defaultMonitoringQLConnectionId = getDefaultMonitoringQLConnectionId(DL.ENV);

            this.fetchConnection(defaultMonitoringQLConnectionId).then(
                (connection: QLConnectionEntry | void) => {
                    if (connection) {
                        this.defaultMonitoringQLConnection = connection;

                        this.setState({
                            connection,
                            showConnectionError: false,
                        });
                    }
                },
            );
        }

        this.state = {
            isNavigationVisible: false,
            title: '',
            chartType: initialChartType,
            connection: null,
            showConnectionError: false,
        };
    }

    render() {
        const {defaultPath, entry} = this.props;
        const {chartType, connection, showConnectionError} = this.state;
        const workbookId = entry?.workbookId || null;

        const chartTypesList = [{value: QLChartType.Sql, text: 'SQL', key: 'SQL'}];

        if (isEnabledFeature(Feature.QLPrometheus)) {
            chartTypesList.push({value: QLChartType.Promql, text: 'Prometheus', key: 'Prometheus'});
        }

        if (isEnabledFeature(Feature.QLMonitoring)) {
            chartTypesList.push({
                value: QLChartType.Monitoringql,
                text: 'Monitoring',
                key: 'Monitoring',
            });
        }

        const {getPlaceSelectParameters} = registry.common.functions.getAll();
        const {getConnectionsByChartType} = registry.ql.functions.getAll();

        return (
            <div className={b()}>
                <div className={b('form')}>
                    <span className={b('form-header')}>{i18n('sql', 'label_create-ql-chart')}</span>
                    <div className={b('form-row')}>
                        <span className={b('form-label')}>{i18n('sql', 'label_chart-type')}</span>
                        <RadioButton
                            value={chartType}
                            onUpdate={this.onChartTypeUpdate}
                            className={b('chart-type-select')}
                        >
                            {chartTypesList.map((chartTypeConfig) => {
                                return (
                                    <RadioButton.Option
                                        key={chartTypeConfig.key}
                                        value={chartTypeConfig.value}
                                    >
                                        <span>{chartTypeConfig.text}</span>
                                    </RadioButton.Option>
                                );
                            })}
                        </RadioButton>
                    </div>
                    <div className={b('form-row')} ref={this.navigationButtonRef}>
                        <span className={b('form-label')}>{i18n('sql', 'label_connection')}</span>
                        {connection ? (
                            <div className={b('connection-select-btn-wrapper')}>
                                <Button
                                    className={b('connection-select-btn')}
                                    width={'auto'}
                                    onClick={() => {
                                        this.toggleNavigation();
                                    }}
                                    disabled={
                                        chartType === QLChartType.Monitoringql &&
                                        isEnabledFeature(Feature.EnableCustomMonitoring)
                                    }
                                >
                                    <div className={b('connection-select-btn-content')}>
                                        <EntryIcon
                                            entry={connection}
                                            size={24}
                                            className={b('entry-icon')}
                                        />
                                        {connection.name}
                                    </div>
                                </Button>
                            </div>
                        ) : (
                            <FieldWrapper
                                error={
                                    showConnectionError
                                        ? i18n('sql', 'error_select-connection')
                                        : undefined
                                }
                                className={b('connection-select-btn-wrapper', {error: true})}
                            >
                                <Button
                                    onClick={() => {
                                        this.toggleNavigation();
                                    }}
                                    disabled={
                                        chartType === QLChartType.Monitoringql &&
                                        isEnabledFeature(Feature.EnableCustomMonitoring)
                                    }
                                    qa={ViewSetupQA.SelectConnection}
                                    className={b('connection-select-btn')}
                                >
                                    {i18n('sql', 'label_select-connection')}
                                </Button>
                            </FieldWrapper>
                        )}
                        {workbookId ? (
                            <WorkbookNavigationMinimal
                                anchor={this.navigationButtonRef}
                                visible={this.state.isNavigationVisible}
                                onClose={this.onNavigationClose}
                                onEntryClick={this.onNavigationEntryClick}
                                workbookId={workbookId}
                                scope={EntryScope.Connection}
                                includeClickableType={getConnectionsByChartType(chartType)}
                            />
                        ) : (
                            <NavigationMinimal
                                sdk={sdk}
                                anchor={this.navigationButtonRef}
                                visible={this.state.isNavigationVisible}
                                onClose={this.onNavigationClose}
                                onEntryClick={this.onNavigationEntryClick}
                                clickableScope="connection"
                                scope="connection"
                                startFrom={defaultPath}
                                ignoreWorkbookEntries={true}
                                placeSelectParameters={getPlaceSelectParameters([
                                    PLACE.ROOT,
                                    PLACE.FAVORITES,
                                    PLACE.CONNECTIONS,
                                ])}
                                includeClickableType={getConnectionsByChartType(chartType)}
                            />
                        )}
                    </div>
                    <div className={b('form-buttons')}>
                        <Button
                            className={b('create-btn')}
                            view="action"
                            size="l"
                            qa={ViewSetupQA.ViewSetupCreate}
                            onClick={this.onCreateClick}
                        >
                            {i18n('sql', 'label_create')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    private fetchConnection(connectionId: string) {
        return getSdk()
            .sdk.us.getEntry({entryId: connectionId})
            .then((loadedConnectionEntry?: GetEntryResponse) => {
                if (!loadedConnectionEntry) {
                    throw new Error(i18n('sql', 'error_failed-to-load-default-connection'));
                }

                const connection: QLConnectionEntry = loadedConnectionEntry as QLConnectionEntry;

                connection.name = Utils.getEntryNameFromKey(connection.key);

                return connection;
            })
            .catch((error: Error) => {
                logger.logError('ql: setup failed', error);

                this.props.setError({
                    error,
                });

                this.props.setStatus(AppStatus.Failed);
            });
    }

    private onChartTypeUpdate = (newChartType: string) => {
        this.setState({
            chartType: newChartType as QLChartType,
        });

        if (
            newChartType === QLChartType.Monitoringql &&
            isEnabledFeature(Feature.EnableCustomMonitoring)
        ) {
            if (this.defaultMonitoringQLConnection === null) {
                const getDefaultMonitoringQLConnectionId = registry.ql.functions.get(
                    'getDefaultMonitoringQLConnectionId',
                );

                const defaultMonitoringQLConnectionId = getDefaultMonitoringQLConnectionId(DL.ENV);

                this.fetchConnection(defaultMonitoringQLConnectionId).then(
                    (connection: QLConnectionEntry | void) => {
                        if (connection) {
                            this.defaultMonitoringQLConnection = connection;

                            this.setState({
                                connection,
                                showConnectionError: false,
                            });
                        }
                    },
                );
            } else {
                this.setState({
                    connection: this.defaultMonitoringQLConnection,
                    showConnectionError: false,
                });
            }
        } else {
            this.setState({
                connection: null,
                showConnectionError: false,
            });
        }
    };

    private onCreateClick = () => {
        const {connection, chartType} = this.state;

        if (!connection || !chartType) {
            this.setState({
                showConnectionError: true,
            });
        } else {
            this.props.performManualConfiguration({connection, chartType});
        }
    };

    private toggleNavigation = (value?: boolean) => {
        const isNavigationVisible = value || !this.state.isNavigationVisible;

        this.setState({
            isNavigationVisible,
        });
    };

    private onNavigationEntryClick = async (newConnection: {entryId: string}) => {
        const connection = {
            ...newConnection,
            data: null,
            public: false,
            revId: '',
            tenantId: '',
            unversionedData: null,
        } as QLConnectionEntry;

        this.toggleNavigation(false);

        this.setState({
            connection,
        });
    };

    private onNavigationClose = () => {
        const {isNavigationVisible} = this.state;

        if (isNavigationVisible) {
            this.toggleNavigation(false);
        }
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        defaultPath: getDefaultPath(state),
        entry: getEntry(state),
    };
};

const mapDispatchToProps = {
    performManualConfiguration,
    setStatus,
    setError,
};

const ViewSetupComponentConnected = connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<ViewSetupInnerProps, ViewSetupProps>(withRouter)(ViewSetupComponent));

const ViewSetup: React.FC = () => {
    return <ViewSetupComponentConnected />;
};

export default ViewSetup;
