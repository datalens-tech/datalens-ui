import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {Button, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {EntryIcon} from 'components/EntryIcon/EntryIcon';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {EntryScope, PLACE} from 'shared';
import type {DatalensGlobalState, EntryDialogues, MonacoTypes} from 'ui';
import {DL, NavigationMinimal, sdk} from 'ui';
import WorkbookNavigationMinimal from 'ui/components/WorkbookNavigationMinimal/WorkbookNavigationMinimal';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {ConnectionStatus} from 'ui/units/ql/constants';

import {ScreenEditorQA, TabQueryQA} from '../../../../../../shared';
import {registry} from '../../../../../registry';
import {drawPreview, performManualConfiguration} from '../../../store/actions/ql';
import {
    getChartType,
    getConnection,
    getConnectionStatus,
    getDefaultPath,
    getEntry,
    getParams,
    getPreviewData,
    getValid,
} from '../../../store/reducers/ql';
import type {QLConnectionEntry} from '../../../store/typings/ql';

import TabParams from './TabParams/TabParams';
import TabQuery from './TabQuery/TabQuery';

import './ScreenEditor.scss';

const b = block('ql-screen-editor');

type ScreenEditorStateProps = ReturnType<typeof makeMapStateToProps>;
type ScreenEditorDispatchProps = typeof mapDispatchToProps;

interface ScreenEditorProps {
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type ScreenEditorInnerProps = RouteComponentProps<{}> &
    ScreenEditorStateProps &
    ScreenEditorDispatchProps &
    ScreenEditorProps;

interface ScreenEditorState {
    isNavigationVisible: boolean;
    activeTab: string;
}

class ScreenEditor extends React.PureComponent<ScreenEditorInnerProps, ScreenEditorState> {
    decorations: string[] = [];
    navigationButtonRef: React.RefObject<HTMLDivElement>;
    navigationButtonNoConnectionRef: React.RefObject<HTMLDivElement>;
    monaco: typeof MonacoTypes | null = null;

    tabs = [
        {
            id: 'queryTab',
            title: <span data-qa={ScreenEditorQA.QueryTab}>{i18n('sql', 'label_query')}</span>,
        },
        {
            id: 'paramsTab',
            title: <span data-qa={ScreenEditorQA.ParamsTab}>{i18n('sql', 'label_params')}</span>,
        },
    ];

    breakpointsConfig = Object.assign({'139': 40}, DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG);

    constructor(props: ScreenEditorInnerProps) {
        super(props);

        this.navigationButtonRef = React.createRef();
        this.navigationButtonNoConnectionRef = React.createRef();

        this.state = {
            isNavigationVisible: false,
            activeTab: this.tabs[0].id,
        };
    }

    render() {
        const {chartType, defaultPath, paneSize, entryDialoguesRef, valid, entry} = this.props;

        const workbookId = entry?.workbookId || null;

        const {getPlaceSelectParameters} = registry.common.functions.getAll();
        const {getConnectionsByChartType} = registry.ql.functions.getAll();

        return (
            chartType && (
                <div className={b()}>
                    <div className={b('action-bar-top')} ref={this.navigationButtonRef}>
                        <AdaptiveTabs
                            className={b('action-bar-top_tabs')}
                            breakpointsConfig={this.breakpointsConfig}
                            items={this.tabs}
                            onSelectTab={this.setActiveTab}
                            activeTab={this.state.activeTab}
                        />
                        {this.renderConnectionBlock()}
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
                                placeSelectParameters={getPlaceSelectParameters([
                                    PLACE.ROOT,
                                    PLACE.FAVORITES,
                                    PLACE.CONNECTIONS,
                                ])}
                                includeClickableType={getConnectionsByChartType(chartType)}
                            />
                        )}
                    </div>
                    {this.state.activeTab === 'queryTab' && (
                        <TabQuery
                            paneSize={paneSize}
                            entryDialoguesRef={entryDialoguesRef}
                        ></TabQuery>
                    )}
                    {this.state.activeTab === 'paramsTab' && <TabParams></TabParams>}
                    <div className={b('action-bar-bottom')}>
                        <Button
                            disabled={!valid}
                            view="action"
                            size="l"
                            onClick={() => this.onClickButtonRun()}
                            key="button-run"
                            className={b('run-btn')}
                            qa="run-ql-script"
                        >
                            {i18n('sql', 'label_run')}
                        </Button>
                    </div>
                </div>
            )
        );
    }

    private renderConnectionBlock() {
        const {connection, connectionStatus} = this.props;

        if (connection) {
            return (
                <DropdownMenu
                    size="s"
                    switcherWrapperClassName={b('action-bar-top_connection-select-btn_more')}
                    renderSwitcher={() => (
                        <Button
                            className={b('action-bar-top_connection-select-btn')}
                            view="flat"
                            pin="brick-brick"
                            size="l"
                            qa={TabQueryQA.SelectConnection}
                        >
                            <EntryIcon entry={connection} size={24} className={b('entry-icon')} />
                            {connection.name}
                        </Button>
                    )}
                    items={[
                        {
                            action: () => {
                                this.toggleNavigation();
                            },
                            text: i18n('sql', 'button_change-connection'),
                        },
                        {
                            action: () => {
                                window.open(`${DL.ENDPOINTS.connections}/${connection?.entryId}`);
                            },
                            text: i18n('sql', 'button_to-connection'),
                        },
                    ]}
                />
            );
        } else if (connectionStatus === ConnectionStatus.Empty) {
            return (
                <div className={b('action-bar-top_connection-select-btn-wrapper')}>
                    <span>{i18n('sql', 'label_new-connection-text')}</span>
                    <Button
                        className={b('action-bar-top_connection-select-btn')}
                        view="flat"
                        pin="brick-brick"
                        size="l"
                        qa={TabQueryQA.SelectConnection}
                        onClick={() => {
                            this.toggleNavigation();
                        }}
                    >
                        {i18n('sql', 'label_select-connection')}
                    </Button>
                </div>
            );
        } else {
            // This means that connectionStatus === ConnectionStatus.Failed
            return (
                <div className={b('action-bar-top_connection-select-btn-wrapper')}>
                    <span>{i18n('sql', 'label_failed-connection-text')}</span>
                    <Button
                        className={b('action-bar-top_connection-select-btn')}
                        view="flat"
                        pin="brick-brick"
                        size="l"
                        qa={TabQueryQA.SelectConnection}
                        onClick={() => {
                            this.toggleNavigation();
                        }}
                    >
                        {i18n('sql', 'label_select-connection')}
                    </Button>
                </div>
            );
        }
    }

    private onClickButtonRun = () => {
        if (this.props.valid) {
            this.props.drawPreview();
        }
    };

    private setActiveTab = (newTabId: string) => {
        this.setState({
            activeTab: newTabId,
        });
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

        this.props.performManualConfiguration({connection});

        this.toggleNavigation(false);
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
        chartType: getChartType(state),
        connection: getConnection(state),
        connectionStatus: getConnectionStatus(state),
        defaultPath: getDefaultPath(state),
        params: getParams(state),
        valid: getValid(state),
        entry: getEntry(state),
        previewData: getPreviewData(state),
    };
};

const mapDispatchToProps = {
    performManualConfiguration,
    drawPreview,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<ScreenEditorInnerProps, ScreenEditorProps>(withRouter)(ScreenEditor));
