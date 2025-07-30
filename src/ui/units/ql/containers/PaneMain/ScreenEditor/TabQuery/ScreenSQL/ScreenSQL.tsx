import React from 'react';

import block from 'bem-cn-lite';
import {registerDatalensQLLanguage, setDatalensQLLanguageConfiguration} from 'libs/monaco';
import debounce from 'lodash/debounce';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {QlConfig} from 'shared/types/config/ql';
import type {DatalensGlobalState, EntryDialogues, MonacoProps, MonacoTypes} from 'ui';
import {EntryDialogName, EntryDialogResolveStatus, Monaco} from 'ui';
import {QL_LANGUAGE_ID} from 'ui/constants/index';
import {addEditHistoryPoint, resetEditHistoryUnit} from 'ui/store/actions/editHistory';
import {QL_EDIT_HISTORY_UNIT_ID} from 'ui/units/ql/constants';
import {prepareChartDataBeforeSave} from 'units/ql/modules/helpers';
import {
    drawPreview,
    fetchConnectionSourceSchema,
    setEntry,
    setQueryValue,
    updateChart,
} from 'units/ql/store/actions/ql';
import {
    getConnection,
    getConnectionSources,
    getConnectionSourcesSchemas,
    getDefaultPath,
    getEntry,
    getEntryNotChanged,
    getPreviewData,
    getQueryValue,
    getValid,
} from 'units/ql/store/reducers/ql';
import type {QLEntry} from 'units/ql/store/typings/ql';

import './ScreenSQL.scss';

const b = block('ql-screen-sql');

// A list of values that cannot be table names
// According to them, you definitely do not need to pull the handle to get the scheme
const RESERVED_NAMES = new Set(['group', 'where', 'sort', 'order', 'having']);

type ScreenSQLStateProps = ReturnType<typeof makeMapStateToProps>;
type ScreenSQLDispatchProps = typeof mapDispatchToProps;

interface ScreenSQLProps {
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type ScreenSQLInnerProps = RouteComponentProps<{}> &
    ScreenSQLStateProps &
    ScreenSQLDispatchProps &
    ScreenSQLProps;

interface ScreenSQLState {
    editor: MonacoTypes.editor.IStandaloneCodeEditor | null;
}

class ScreenSQL extends React.PureComponent<ScreenSQLInnerProps, ScreenSQLState> {
    monaco: typeof MonacoTypes | null = null;

    private updateAutocomplete = debounce(async () => {
        const {connectionSourcesSchemas, connectionSources} = this.props;

        const usedTablesNames = this.identifyTableNames();
        const tablesList = connectionSources;

        let fieldsList: Record<string, string>[] = [];

        usedTablesNames.forEach(async (tableName) => {
            if (connectionSourcesSchemas[tableName]) {
                fieldsList = [...fieldsList, ...connectionSourcesSchemas[tableName]];
            } else {
                const schema = await this.props.fetchConnectionSourceSchema({tableName});

                if (Array.isArray(schema)) {
                    fieldsList = [...fieldsList, ...schema];
                }
            }
        });

        setDatalensQLLanguageConfiguration(this.monaco!, fieldsList, tablesList);
    }, 200);

    constructor(props: ScreenSQLInnerProps) {
        super(props);

        this.state = {
            editor: null,
        };
    }

    componentDidUpdate(prevProps: ScreenSQLInnerProps) {
        const {paneSize, connection} = this.props;

        if (prevProps.paneSize !== paneSize) {
            this.onResize();
        }

        if (this.monaco && prevProps.connection !== connection) {
            setDatalensQLLanguageConfiguration(this.monaco, [], []);
        }
    }

    render = () => {
        const {queryValue} = this.props;

        return (
            <React.Fragment>
                <div className={b()}>
                    <Monaco
                        editorWillMount={this.editorWillMount}
                        editorDidMount={this.editorDidMount}
                        className={b('query-editor')}
                        language={QL_LANGUAGE_ID}
                        value={queryValue}
                        options={{
                            glyphMargin: true,
                            hideCursorInOverviewRuler: true,
                            lineNumbersMinChars: 1,
                            wordWrap: 'bounded',
                        }}
                        onChange={this.onQueryChange}
                    />
                </div>
            </React.Fragment>
        );
    };

    private identifyTableNames = () => {
        const {queryValue} = this.props;

        const selectRegex = /from[^\w]+([\w.]+)/gim;
        const tableNames = [];

        let match;

        while ((match = selectRegex.exec(queryValue)) !== null) {
            const tableName = match[1].toLowerCase();

            if (RESERVED_NAMES.has(tableName)) {
                continue;
            }

            tableNames.push(tableName);
        }

        return tableNames;
    };

    private onQueryChange = (newQueryValue: string) => {
        this.props.setQueryValue(newQueryValue);

        this.updateAutocomplete();
    };

    private editorWillMount: MonacoProps['editorWillMount'] = (monaco) => {
        this.monaco = monaco;

        registerDatalensQLLanguage(monaco);

        setDatalensQLLanguageConfiguration(this.monaco, [], []);

        this.updateAutocomplete();
    };

    private editorDidMount: MonacoProps['editorDidMount'] = (editor) => {
        this.setState({
            editor,
        });

        const {monaco} = this;

        if (monaco !== null) {
            // eslint-disable-next-line no-bitwise
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
                const {entryNotChanged} = this.props;

                if (!entryNotChanged) {
                    this.onSaveCommand();
                }
            });

            // eslint-disable-next-line no-bitwise
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                this.onRunCommand();
            });
        }
    };

    private openSaveAsWidgetDialog = async (preparedChartData: QlConfig) => {
        const {entry, defaultPath, location, history, entryDialoguesRef} = this.props;

        if (!entryDialoguesRef) {
            return;
        }

        const path = entry && !entry.fake ? entry.key.replace(/[^/]+$/, '') : defaultPath;

        const result = await entryDialoguesRef.current?.open({
            dialog: EntryDialogName.CreateQLChart,
            dialogProps: {
                data: preparedChartData,
                initName: 'New chart',
                initDestination: path,
                workbookId: entry?.workbookId,
            },
        });

        if (!result || !result.data || result.status === EntryDialogResolveStatus.Close) {
            return;
        }

        history.replace(`${location.pathname.replace(/\/$/, '')}/${result.data.entryId}`);

        result.data.data = {
            shared: JSON.parse(result.data.data.shared),
        };

        this.props.setEntry({entry: result.data as QLEntry});

        this.props.resetEditHistoryUnit({
            unitId: QL_EDIT_HISTORY_UNIT_ID,
        });

        this.props.addEditHistoryPoint({
            newState: {ql: this.props.qlState, wizard: this.props.wizardState},
            unitId: QL_EDIT_HISTORY_UNIT_ID,
        });
    };

    private onSaveCommand = () => {
        const {entry, chartData} = this.props;

        if (!chartData || !entry) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(chartData);

        // Updating an existing one or saving a new one?
        if (entry.fake) {
            // Saving a new one
            this.openSaveAsWidgetDialog(preparedChartData);
        } else {
            // Updating an existing one
            this.props.updateChart(preparedChartData);

            this.props.addEditHistoryPoint({
                newState: {ql: this.props.qlState, wizard: this.props.wizardState},
                unitId: QL_EDIT_HISTORY_UNIT_ID,
            });
        }
    };

    private onRunCommand = () => {
        if (this.props.valid) {
            this.props.drawPreview();
        }
    };

    private onResize() {
        if (this.state.editor) {
            this.state.editor.layout();
        }
    }
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        defaultPath: getDefaultPath(state),
        queryValue: getQueryValue(state),
        entry: getEntry(state),
        chartData: getPreviewData(state),
        entryNotChanged: getEntryNotChanged(state),
        valid: getValid(state),
        connection: getConnection(state),
        connectionSources: getConnectionSources(state),
        connectionSourcesSchemas: getConnectionSourcesSchemas(state),
        previewData: getPreviewData(state),

        // Note, that QL uses QL store and Wizard store, because QL and Wizard use same visualization section
        qlState: state.ql,
        wizardState: state.wizard,
    };
};

const mapDispatchToProps = {
    setQueryValue,
    drawPreview,
    updateChart,
    setEntry,
    fetchConnectionSourceSchema,
    resetEditHistoryUnit,
    addEditHistoryPoint,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<ScreenSQLInnerProps, ScreenSQLProps>(withRouter)(ScreenSQL));
