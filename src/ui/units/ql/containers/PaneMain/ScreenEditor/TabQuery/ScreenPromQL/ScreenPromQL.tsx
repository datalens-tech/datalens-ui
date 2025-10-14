import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import {Ellipsis, Eye, EyeSlash, Xmark} from '@gravity-ui/icons';
import {Button, DropdownMenu, Icon, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import copyToClipboard from 'clipboard-copy';
import {Collapse} from 'components/Collapse/Collapse';
import {i18n} from 'i18n';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {QLConfigQuery, QlConfig, QlConfigParam} from 'shared/types/config/ql';
import type {DatalensGlobalState, EntryDialogues, MonacoTypes} from 'ui';
import {EntryDialogName, EntryDialogResolveStatus, Monaco} from 'ui';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';
import {addEditHistoryPoint, resetEditHistoryUnit} from 'ui/store/actions/editHistory';
import {QL_EDIT_HISTORY_UNIT_ID} from 'ui/units/ql/constants';

import {TabQueryQA} from '../../../../../../../../shared';
import {EditableText} from '../../../../../../../components/EditableText/EditableText';
import {prepareChartDataBeforeSave} from '../../../../../modules/helpers';
import {
    addParamInQuery,
    addQuery,
    drawPreview,
    duplicateQuery,
    removeParamInQuery,
    removeQuery,
    removeQueryAndRedraw,
    setEntry,
    updateChart,
    updateParamInQuery,
    updateQuery,
    updateQueryAndRedraw,
} from '../../../../../store/actions/ql';
import {
    getChartType,
    getDefaultPath,
    getEntry,
    getEntryNotChanged,
    getExtraSettings,
    getPreviewData,
    getQueries,
    getValid,
} from '../../../../../store/reducers/ql';
import type {QLEntry} from '../../../../../store/typings/ql';
import {isQlAutoExecuteChartEnabled} from '../../../../../utils/chart-settings';

import './ScreenPromQL.scss';

const b = block('ql-screen-promql');

type TabQueryStateProps = ReturnType<typeof makeMapStateToProps>;
type TabQueryDispatchProps = typeof mapDispatchToProps;

interface TabQueryProps {
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type TabQueryInnerProps = RouteComponentProps<{}> &
    TabQueryStateProps &
    TabQueryDispatchProps &
    TabQueryProps;

interface TabQueryProps {
    paneSize: number;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

interface TabQueryState {
    editors: Record<string, MonacoTypes.editor.IStandaloneCodeEditor>;
    activeTabs: Record<number, string>;
    oldQueries: QLConfigQuery[];
}

class TabQuery extends React.PureComponent<TabQueryInnerProps, TabQueryState> {
    tabs = [
        {
            id: 'queryTab',
            title: i18n('sql', 'label_query'),
        },
        {
            id: 'paramsTab',
            title: i18n('sql', 'label_params'),
        },
    ];

    breakpointsConfig = Object.assign({'139': 40}, DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG);

    constructor(props: TabQueryInnerProps) {
        super(props);

        this.state = {
            editors: {},
            activeTabs: {},
            oldQueries: props.queries,
        };
    }

    componentDidUpdate(prevProps: TabQueryProps) {
        const {paneSize} = this.props;

        if (prevProps.paneSize !== paneSize) {
            this.onResize();
        }
    }

    render = () => {
        const {queries} = this.props;
        const {activeTabs} = this.state;

        return (
            <React.Fragment>
                <div className={b()}>
                    {queries.map((query, queryIndex) => {
                        const activeTab = activeTabs[queryIndex];

                        return (
                            <div className={b('query-row')} key={`query-${queryIndex}`}>
                                <Collapse
                                    arrowPosition="left"
                                    defaultIsExpand={true}
                                    className={b('query-row-collapse')}
                                    title={
                                        <div className={b('query-row-header')}>
                                            <EditableText
                                                text={query.queryName}
                                                textClassName={b('query-row-title')}
                                                onInputApply={(queryName) => {
                                                    if (queryName === query.queryName) {
                                                        return;
                                                    }
                                                    this.props.updateQueryAndRedraw({
                                                        query: {...query, queryName},
                                                        index: queryIndex,
                                                    });
                                                }}
                                            />
                                        </div>
                                    }
                                    toolbar={
                                        <React.Fragment>
                                            <AdaptiveTabs
                                                className={b('query-row-tabs')}
                                                breakpointsConfig={this.breakpointsConfig}
                                                items={this.tabs}
                                                onSelectTab={(newTabId: string) => {
                                                    this.setActiveTab(newTabId, queryIndex);
                                                }}
                                                activeTab={activeTab || 'queryTab'}
                                                size={'m'}
                                            />
                                            <DropdownMenu
                                                size="s"
                                                renderSwitcher={({onClick, onKeyDown}) => (
                                                    <Button
                                                        view="flat-secondary"
                                                        size="s"
                                                        key="button-query-more"
                                                        className={b('query-more-btn')}
                                                        onClick={onClick}
                                                        onKeyDown={onKeyDown}
                                                    >
                                                        <Icon size={14} data={Ellipsis} />
                                                    </Button>
                                                )}
                                                items={[
                                                    {
                                                        action: () => {
                                                            this.onClickButtonDuplicateQuery({
                                                                queryIndex,
                                                            });
                                                        },
                                                        text: i18n('sql', 'label_duplicate'),
                                                    },
                                                    {
                                                        action: () => {
                                                            const text = query.value;
                                                            return copyToClipboard(text);
                                                        },
                                                        text: i18n('sql', 'label_copy-as-text'),
                                                    },
                                                    {
                                                        action: () => {
                                                            this.onClickButtonRemoveQuery({
                                                                queryIndex,
                                                            });
                                                        },
                                                        text: i18n('sql', 'label_delete'),
                                                        theme: 'danger',
                                                    },
                                                ]}
                                            />
                                            <Button
                                                view="flat-secondary"
                                                size="s"
                                                onClick={() =>
                                                    this.onClickButtonHideQuery({query, queryIndex})
                                                }
                                                key="button-hide-query"
                                                className={b('hide-query-btn')}
                                            >
                                                <Icon
                                                    size={16}
                                                    data={query.hidden ? EyeSlash : Eye}
                                                />
                                            </Button>
                                        </React.Fragment>
                                    }
                                >
                                    {(typeof activeTab === 'undefined' ||
                                        activeTab === 'queryTab') && (
                                        <div className={b('editor-wrapper')}>
                                            <Monaco
                                                editorDidMount={(editor, monaco) => {
                                                    this.editorDidMount(editor, monaco, queryIndex);
                                                }}
                                                className={b('query-editor')}
                                                language={'sql'}
                                                value={query.value}
                                                options={{
                                                    glyphMargin: true,
                                                    hideCursorInOverviewRuler: true,
                                                    lineNumbersMinChars: 1,
                                                    wordWrap: 'on',
                                                    automaticLayout: true,
                                                }}
                                                onChange={(newQueryValue) => {
                                                    this.onEditQuery({
                                                        query: {...query, value: newQueryValue},
                                                        queryIndex,
                                                    });
                                                }}
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'paramsTab' && (
                                        <React.Fragment>
                                            {query.params.map(
                                                (param: QlConfigParam, paramIndex: number) => {
                                                    if (typeof param.defaultValue !== 'string') {
                                                        return null;
                                                    }

                                                    return (
                                                        <div
                                                            key={`query-${queryIndex}-param-${paramIndex}`}
                                                        >
                                                            <TextInput
                                                                view="normal"
                                                                size="m"
                                                                className={b('query-param-name')}
                                                                placeholder={i18n(
                                                                    'sql',
                                                                    'label_placeholder-name',
                                                                )}
                                                                value={param.name}
                                                                onUpdate={(name: string) => {
                                                                    const newParam = {...param};

                                                                    newParam.name = name;

                                                                    this.onEditParamInQuery({
                                                                        param: newParam,
                                                                        queryIndex,
                                                                        paramIndex,
                                                                    });
                                                                }}
                                                                autoFocus={true}
                                                            />
                                                            <TextInput
                                                                className={b(
                                                                    'query-param-default-value',
                                                                )}
                                                                placeholder={i18n(
                                                                    'sql',
                                                                    'label_placeholder-default-value',
                                                                )}
                                                                value={param.defaultValue}
                                                                onUpdate={(
                                                                    defaultValue: string,
                                                                ) => {
                                                                    const newParam = {...param};

                                                                    newParam.defaultValue =
                                                                        defaultValue;

                                                                    this.onEditParamInQuery({
                                                                        param: newParam,
                                                                        queryIndex,
                                                                        paramIndex,
                                                                    });
                                                                }}
                                                                autoFocus={true}
                                                            />
                                                            <Button
                                                                view="flat-secondary"
                                                                size="m"
                                                                onClick={() =>
                                                                    this.onClickButtonRemoveParamInQuery(
                                                                        {
                                                                            queryIndex,
                                                                            paramIndex,
                                                                        },
                                                                    )
                                                                }
                                                                key="button-remove-param"
                                                                className={b(
                                                                    'query-remove-param-btn',
                                                                )}
                                                                title={i18n(
                                                                    'sql',
                                                                    'label_delete-param',
                                                                )}
                                                            >
                                                                <Icon data={Xmark} size={24} />
                                                            </Button>
                                                        </div>
                                                    );
                                                },
                                            )}
                                            <Button
                                                view="normal"
                                                size="s"
                                                onClick={() =>
                                                    this.onClickButtonAddParamInQuery({queryIndex})
                                                }
                                                key="button-add-param"
                                                className={b('add-param-btn')}
                                            >
                                                {i18n('sql', 'button_add-param')}
                                            </Button>
                                        </React.Fragment>
                                    )}
                                </Collapse>
                            </div>
                        );
                    })}
                    <Button
                        view="normal"
                        size="m"
                        onClick={() => this.onClickButtonAddQuery()}
                        key="button-run"
                        className={b('add-query-btn')}
                        qa={TabQueryQA.AddPromQLQueryBtn}
                    >
                        {i18n('sql', 'label_add-query')}
                    </Button>
                </div>
            </React.Fragment>
        );
    };

    private editorDidMount = (
        editor: MonacoTypes.editor.IStandaloneCodeEditor,
        monaco: typeof MonacoTypes,
        queryIndex: number,
    ) => {
        const {editors} = this.state;

        const queryEditorIndex = `query_${queryIndex}`;

        this.setState({
            editors: {
                ...editors,
                [queryEditorIndex]: editor,
            },
        });

        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            const {entryNotChanged} = this.props;

            if (!entryNotChanged) {
                this.onSaveCommand();
            }
        });

        editor.onDidBlurEditorWidget(() => {
            const isSomeQueryChanged = this.state.oldQueries.some((query, index) => {
                const updatedQuery = this.props.queries[index];
                return query.value !== updatedQuery.value;
            });
            if (
                isQlAutoExecuteChartEnabled(
                    this.props.extraSettings?.qlAutoExecuteChart,
                    this.props.chartType,
                ) &&
                isSomeQueryChanged
            ) {
                this.onRunCommand();
                this.setState({oldQueries: this.props.queries});
            }
        });

        // eslint-disable-next-line no-bitwise
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            this.onRunCommand();
        });
    };

    private onEditQuery = ({query, queryIndex}: {query: QLConfigQuery; queryIndex: number}) => {
        this.props.updateQuery({query, index: queryIndex});
    };

    private onClickButtonAddParamInQuery = ({queryIndex}: {queryIndex: number}) => {
        this.props.addParamInQuery({queryIndex});
    };

    private onEditParamInQuery = ({
        param,
        queryIndex,
        paramIndex,
    }: {
        param: QlConfigParam;
        queryIndex: number;
        paramIndex: number;
    }) => {
        this.props.updateParamInQuery({param, queryIndex, paramIndex});
    };

    private onClickButtonRemoveParamInQuery = ({
        queryIndex,
        paramIndex,
    }: {
        queryIndex: number;
        paramIndex: number;
    }) => {
        this.props.removeParamInQuery({queryIndex, paramIndex});
    };

    private onClickButtonAddQuery = () => {
        this.props.addQuery();
    };

    private onClickButtonRemoveQuery = ({queryIndex}: {queryIndex: number}) => {
        if (
            isQlAutoExecuteChartEnabled(
                this.props.extraSettings?.qlAutoExecuteChart,
                this.props.chartType,
            )
        ) {
            this.props.removeQueryAndRedraw({index: queryIndex});
        } else {
            this.props.removeQuery({index: queryIndex});
        }
    };

    private onClickButtonHideQuery = ({
        query,
        queryIndex,
    }: {
        query: QLConfigQuery;
        queryIndex: number;
    }) => {
        this.props.updateQueryAndRedraw({
            query: {...query, hidden: !query.hidden},
            index: queryIndex,
        });
    };

    private onClickButtonDuplicateQuery = ({queryIndex}: {queryIndex: number}) => {
        this.props.duplicateQuery({index: queryIndex});
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
                initName: 'hello world',
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
        const {entry, previewData} = this.props;

        if (!previewData || !entry) {
            return;
        }

        const preparedChartData = prepareChartDataBeforeSave(previewData);

        // Updating an existing one or saving a new one?
        if (entry.fake) {
            // Saving a new one
            this.openSaveAsWidgetDialog(preparedChartData);
        } else {
            // Updating an existing one
            this.props.updateChart(preparedChartData);

            this.props.resetEditHistoryUnit({
                unitId: QL_EDIT_HISTORY_UNIT_ID,
            });

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
        Object.values(this.state.editors).forEach(
            (editor: MonacoTypes.editor.IStandaloneCodeEditor) => {
                editor.layout();
            },
        );
    }

    private setActiveTab = (newTabId: string, queryIndex: number) => {
        const newActiveTabs = {...this.state.activeTabs};

        newActiveTabs[queryIndex] = newTabId;

        this.setState({
            activeTabs: newActiveTabs,
        });
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        defaultPath: getDefaultPath(state),
        queries: getQueries(state),
        entry: getEntry(state),
        previewData: getPreviewData(state),
        entryNotChanged: getEntryNotChanged(state),
        extraSettings: getExtraSettings(state),
        valid: getValid(state),
        chartType: getChartType(state),

        // Note, that QL uses QL store and Wizard store, because QL and Wizard use same visualization section
        qlState: state.ql,
        wizardState: state.wizard,
    };
};

const mapDispatchToProps = {
    drawPreview,
    updateChart,
    addQuery,
    updateQuery,
    duplicateQuery,
    removeQuery,
    setEntry,
    addParamInQuery,
    updateParamInQuery,
    removeParamInQuery,
    updateQueryAndRedraw,
    removeQueryAndRedraw,
    resetEditHistoryUnit,
    addEditHistoryPoint,
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<TabQueryInnerProps, TabQueryProps>(withRouter)(TabQuery));
