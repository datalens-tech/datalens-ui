import React from 'react';

import block from 'bem-cn-lite';
import {PageTitle} from 'components/PageTitle';
import ViewError from 'components/ViewError/ViewError';
import ViewLoader from 'components/ViewLoader/ViewLoader';
import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {cleanRevisions, setRevisionsMode} from 'store/actions/entryContent';
import {RevisionsMode} from 'store/typings/entryContent';
import type {DatalensGlobalState} from 'ui';
import {EntryDialogues, URL_QUERY} from 'ui';
import {HOTKEYS_SCOPES} from 'ui/constants/misc';
import {withHotkeysContext} from 'ui/hoc/withHotkeysContext';
import {initEditHistoryUnit, resetEditHistoryUnit} from 'ui/store/actions/editHistory';
import type {WizardGlobalState} from 'ui/units/wizard/reducers';
import Grid from 'units/ql/components/Grid/Grid';
import {AppStatus, QL_EDIT_HISTORY_UNIT_ID} from 'units/ql/constants';
import {initializeApplication, resetQLStore, setQLStore} from 'units/ql/store/actions/ql';
import {getAppError, getAppStatus, getConnection, getEntry} from 'units/ql/store/reducers/ql';
import type {QLConnectionEntry, QLEntry, QLState} from 'units/ql/store/typings/ql';
import {resetWizardStore, setWizardStore} from 'units/wizard/actions';
import {getUrlParamFromStr} from 'utils';

import {registry} from '../../../../registry';

import {QLActionPanel} from './QLActionPanel/QLActionPanel';

import './QL.scss';

const b = block('ql');

type DispatchProps = typeof mapDispatchToProps;

interface QLProps {
    appStatus: string;
    connection: QLConnectionEntry | null;
    error: Error | null;
    entry: QLEntry | null;
    size: number;
}

type QLInnerProps = QLProps &
    RouteComponentProps<{qlEntryId?: string; workbookId?: string}> &
    DispatchProps & {
        hotkeysContext?: HotkeysContextType;
    };

class QL extends React.PureComponent<QLInnerProps> {
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    private hotkeysAreaRef: React.RefObject<HTMLDivElement>;

    constructor(props: QLInnerProps) {
        super(props);

        this.entryDialoguesRef = React.createRef();
        this.hotkeysAreaRef = React.createRef();

        this.props.initEditHistoryUnit<{ql: QLState; wizard: WizardGlobalState}>({
            unitId: QL_EDIT_HISTORY_UNIT_ID,
            setState: ({state}) => {
                const {ql, wizard} = state;

                this.props.setQLStore({
                    store: ql,
                });

                this.props.setWizardStore({
                    store: wizard,
                });
            },
            options: {
                pathIgnoreList: ['/preview/highchartsWidget', '/preview/filters'],
            },
        });
    }

    componentDidMount() {
        const {history, location, match} = this.props;

        this.hotkeysAreaRef?.current?.addEventListener('mouseenter', this.enableQLScope);
        this.hotkeysAreaRef?.current?.addEventListener('mouseleave', this.disableQLScope);

        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.QL);

        this.props.initializeApplication({location, history, match});
    }

    componentDidUpdate(prevProps: QLInnerProps) {
        const {history, location, match} = this.props;

        const {extractEntryId} = registry.common.functions.getAll();
        const prevEntryId = extractEntryId(prevProps.match.params.qlEntryId);
        const currentEntryId = extractEntryId(match.params.qlEntryId);

        const currentRevId = getUrlParamFromStr(location.search, URL_QUERY.REV_ID);
        const prevRevId = getUrlParamFromStr(prevProps.location.search, URL_QUERY.REV_ID);

        const hasQlEntryChanged = prevEntryId !== currentEntryId;
        const hasRevisionChanged = prevRevId !== currentRevId;

        if (hasRevisionChanged && !hasQlEntryChanged) {
            this.props.resetQLStore();

            this.props.initializeApplication({
                location,
                history,
                match,
            });
        }

        if (hasQlEntryChanged) {
            this.props.cleanRevisions();
            this.props.setRevisionsMode(RevisionsMode.Closed);

            if (currentRevId) {
                const searchParams = new URLSearchParams(location.search);
                searchParams.delete(URL_QUERY.REV_ID);
                searchParams.delete(URL_QUERY.UNRELEASED);
                history.replace({
                    ...location,
                    search: `?${searchParams.toString()}`,
                });
            }

            this.props.resetEditHistoryUnit({
                unitId: QL_EDIT_HISTORY_UNIT_ID,
            });

            this.props.resetQLStore();
            this.props.resetWizardStore();

            this.props.initializeApplication({
                location,
                history,
                match,
            });
        }
    }

    componentWillUnmount() {
        this.props.resetQLStore();
        this.props.resetWizardStore();

        this.props.resetEditHistoryUnit({
            unitId: QL_EDIT_HISTORY_UNIT_ID,
        });

        this.props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.QL);

        this.hotkeysAreaRef?.current?.removeEventListener('mouseenter', this.enableQLScope);
        this.hotkeysAreaRef?.current?.removeEventListener('mouseleave', this.disableQLScope);
    }

    render() {
        const {entry, ...routeProps} = this.props;

        return (
            <React.Fragment>
                <PageTitle entry={entry} />
                <QLActionPanel
                    {...routeProps}
                    entry={entry}
                    entryDialoguesRef={this.entryDialoguesRef}
                />
                {this.renderContent()}
            </React.Fragment>
        );
    }

    private renderContent() {
        const {appStatus, history, location, match} = this.props;

        const ViewSetup = registry.ql.components.get('QlUnconfiguredChartView');

        switch (appStatus) {
            case AppStatus.Loading:
                return <ViewLoader size="l" />;

            case AppStatus.Failed:
                return (
                    <ViewError
                        retry={() => {
                            this.props.initializeApplication({location, history, match});
                        }}
                        error={this.props.error}
                    />
                );

            case AppStatus.Unconfigured:
                return <ViewSetup />;

            case AppStatus.Ready:
            default:
                return this.renderGrid();
        }
    }

    private renderGrid() {
        const {size} = this.props;

        return (
            <React.Fragment>
                <EntryDialogues ref={this.entryDialoguesRef} />
                <div className={b('content')} ref={this.hotkeysAreaRef}>
                    <Grid entryDialoguesRef={this.entryDialoguesRef} size={size} />
                </div>
            </React.Fragment>
        );
    }

    private enableQLScope = () => {
        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.QL);
    };

    private disableQLScope = () => {
        this.props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.QL);
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        appStatus: getAppStatus(state),
        connection: getConnection(state),
        error: getAppError(state),
        entry: getEntry(state),
    };
};

const mapDispatchToProps = {
    initEditHistoryUnit,
    resetEditHistoryUnit,
    initializeApplication,
    setQLStore,
    resetQLStore,
    setWizardStore,
    resetWizardStore,
    cleanRevisions,
    setRevisionsMode,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<QLInnerProps, QLProps>(withRouter)(withHotkeysContext(QL)));
