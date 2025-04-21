import React from 'react';

import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Loader, Toaster} from '@gravity-ui/uikit';
import type {AxiosError} from 'axios';
import block from 'bem-cn-lite';
import type {History, Location} from 'history';
import {i18n} from 'i18n';
import isEqual from 'lodash/isEqual';
import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {compose} from 'recompose';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {isDraftVersion} from 'ui/utils/revisions';

import {
    DL,
    EntryDialogName,
    EntryDialogResolveStatus,
    EntryDialogues,
    ErrorContent,
    PageTitle,
    SPLIT_PANE_RESIZER_CLASSNAME,
    SlugifyUrl,
    URL_QUERY,
    Utils,
    sdk,
} from '../../../../';
import type {DatalensGlobalState} from '../../../../';
import {
    ChartSaveControlsQA,
    EntryUpdateMode,
    Feature,
    isUnreleasedVersion,
} from '../../../../../shared';
import type {ChartsConfig} from '../../../../../shared';
import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import withErrorPage from '../../../../components/ErrorPage/withErrorPage';
import type {RevisionEntry} from '../../../../components/Revisions/types';
import {HOTKEYS_SCOPES} from '../../../../constants/misc';
import {withHotkeysContext} from '../../../../hoc/withHotkeysContext';
import type {ChartKit} from '../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {registry} from '../../../../registry';
import {openDialogSaveDraftChartAsActualConfirm} from '../../../../store/actions/dialog';
import {
    addEditHistoryPoint,
    initEditHistoryUnit,
    resetEditHistoryUnit,
} from '../../../../store/actions/editHistory';
import {
    cleanRevisions,
    reloadRevisionsOnSave,
    setRevisionsMode,
} from '../../../../store/actions/entryContent';
import {RevisionsMode} from '../../../../store/typings/entryContent';
import {getUrlParamFromStr} from '../../../../utils';
import history from '../../../../utils/history';
import {isDraft, isEditMode} from '../../../dash/store/selectors/dashTypedSelectors';
import type {SetDefaultsArgs} from '../../actions';
import {resetWizardStore, setDefaults, setWizardStore} from '../../actions';
import {updateClientChartsConfig} from '../../actions/preview';
import {toggleViewOnlyMode} from '../../actions/settings';
import {receiveWidgetAndPrepareMetadata, updateWizardWidget} from '../../actions/widget';
import DialogNoRights from '../../components/Dialogs/DialogNoRights';
import {WIZARD_EDIT_HISTORY_UNIT_ID} from '../../constants';
import type {WizardGlobalState} from '../../reducers';
import {reloadWizardEntryByRevision, setActualWizardChart} from '../../reducers/revisions/reducers';
import {selectDataset} from '../../selectors/dataset';
import {
    selectConfig,
    selectConfigForSaving,
    selectConfigType,
    selectInitialPreviewHash,
    selectPreviewEntryId,
    selectPreviewHash,
} from '../../selectors/preview';
import {
    selectDefaultPath,
    selectIsDefaultsSet,
    selectIsFullscreen,
    selectSettings,
} from '../../selectors/settings';
import {selectVisualization} from '../../selectors/visualization';
import {
    selectExtraSettings,
    selectIsWidgetLoading,
    selectWidget,
    selectWidgetError,
    selectWidgetHash,
} from '../../selectors/widget';
import {getDefaultChartName, shouldComponentUpdateWithDeepComparison} from '../../utils/helpers';
import {mapClientConfigToChartsConfig} from '../../utils/mappers/mapClientToChartsConfig';
import {getAvailableVisualizations} from '../../utils/visualization';

import SectionDataset from './SectionDataset/SectionDataset';
import SectionPreview from './SectionPreview/SectionPreview';
import SectionVisualization from './SectionVisualization/SectionVisualization';
import WizardActionPanel from './WizardActionPanel/WizardActionPanel';

import './Wizard.scss';

const b = block('wizard');

const SPLIT_PANE_MIN_SIZE = 256;
const SPLIT_PANE_MAX_SIZE = 512;

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type OwnProps = {
    asideHeaderSize: number;
    history: History;
    match: {
        isExact: boolean;
        path: string;
        url: string;
        params: Record<string, string>;
    };
    location: Location;
    hotkeysContext?: HotkeysContextType;
};

interface Props extends OwnProps, StateProps, DispatchProps {}

interface State {
    dialogNoRightsVisible: boolean;
    dialogSettingsVisible: boolean;
    editButtonLoading: boolean;
}

class Wizard extends React.Component<Props, State> {
    private toaster: Toaster;
    private entryDialoguesRef: React.RefObject<EntryDialogues>;
    private hotkeysAreaRef: React.RefObject<HTMLDivElement>;

    private chartKitRef: React.RefObject<ChartKit> = React.createRef<ChartKit>();

    constructor(props: Props) {
        super(props);

        const {isDefaultsSet} = props;

        if (!isDefaultsSet) {
            const {extractEntryId} = registry.common.functions.getAll();
            const entryId = extractEntryId(window.location.pathname);

            const revId = getUrlParamFromStr(this.props.location.search, URL_QUERY.REV_ID);
            const unreleased = isUnreleasedVersion(this.props.location.search);

            const params: SetDefaultsArgs = {entryId, unreleased};
            if (revId) {
                params.revId = revId;
            }

            if (props.match.params.workbookId) {
                params.routeWorkbookId = props.match.params.workbookId;
            }

            this.props.setDefaults(params);
        }

        this.toaster = new Toaster();

        this.entryDialoguesRef = React.createRef();
        this.hotkeysAreaRef = React.createRef();

        this.state = {
            editButtonLoading: false,
            dialogNoRightsVisible: false,
            dialogSettingsVisible: false,
        };

        this.props.initEditHistoryUnit<WizardGlobalState>({
            unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
            setState: ({state}) => {
                this.props.setWizardStore({
                    store: state,
                });
            },
            options: {
                pathIgnoreList: [
                    '/preview/highchartsWidget',
                    '/preview/filters',
                    '/visualization/layers',
                ],
            },
        });
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.unloadConfirmation);

        this.hotkeysAreaRef?.current?.addEventListener('mouseenter', this.enableWizardScope);
        this.hotkeysAreaRef?.current?.addEventListener('mouseleave', this.disableWizardScope);

        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.WIZARD);
    }

    shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
        return (
            shouldComponentUpdateWithDeepComparison({
                nextProps,
                currentProps: this.props,
                deepComparePropKey: 'widget',
            }) || !isEqual(this.state, nextState)
        );
    }

    componentDidUpdate(prevProps: Props) {
        const {match, asideHeaderSize, isFullscreen} = this.props;

        if (
            (prevProps.asideHeaderSize !== asideHeaderSize ||
                prevProps.isFullscreen !== isFullscreen) &&
            this.chartKitRef.current !== null &&
            typeof this.chartKitRef.current.reflow !== 'undefined'
        ) {
            this.chartKitRef.current.reflow();
        }

        const {extractEntryId} = registry.common.functions.getAll();
        const oldEntryId = extractEntryId(prevProps.match.url);
        const newEntryId = extractEntryId(match.url);

        const hasWizardEntryChanged = oldEntryId !== newEntryId;

        const revId = getUrlParamFromStr(this.props.location.search, URL_QUERY.REV_ID);
        const prevRevId = getUrlParamFromStr(prevProps.location.search, URL_QUERY.REV_ID);

        const hasRevisionChanged = revId !== prevRevId;

        if (hasRevisionChanged && !hasWizardEntryChanged) {
            const entryId = newEntryId;
            const params: SetDefaultsArgs = {entryId};
            if (revId) {
                params.revId = revId;
            }
            this.props.reloadWizardEntryByRevision(params);
        }

        if (hasWizardEntryChanged) {
            this.props.cleanRevisions();
            this.props.setRevisionsMode(RevisionsMode.Closed);

            this.props.resetWizardStore();

            this.props.resetEditHistoryUnit({
                unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
            });

            const entryId = newEntryId;
            const params: SetDefaultsArgs = {entryId};
            if (revId) {
                const searchParams = new URLSearchParams(location.search);
                searchParams.delete(URL_QUERY.REV_ID);
                searchParams.delete(URL_QUERY.UNRELEASED);
                history.replace({
                    ...location,
                    search: `?${searchParams.toString()}`,
                });
            }
            this.props.setDefaults(params);
        }
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.unloadConfirmation);

        this.props.resetWizardStore();

        this.props.resetEditHistoryUnit({
            unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
        });

        this.props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.WIZARD);

        this.hotkeysAreaRef?.current?.removeEventListener('mouseenter', this.enableWizardScope);
        this.hotkeysAreaRef?.current?.removeEventListener('mouseleave', this.disableWizardScope);
    }

    render() {
        const {widgetError} = this.props;

        if (widgetError) {
            return this.renderError();
        }

        return this.renderApp();
    }

    unloadConfirmation = (event: BeforeUnloadEvent) => {
        const {previewHash, widgetHash, initialPreviewHash} = this.props;
        const widgetChanged = previewHash !== widgetHash && previewHash !== initialPreviewHash;

        if (widgetChanged) {
            const message = i18n('wizard', 'toast_unsaved');
            (event || window.event).returnValue = message;
            return message;
        }

        return null;
    };

    openSaveAsWidgetDialog = async (convert = false) => {
        const {dataset, visualization, extraSettings, defaultPath, widget, configForSaving} =
            this.props;

        const resultConfig = mapClientConfigToChartsConfig(configForSaving);

        const data: ChartsConfig & {convert: boolean} = {
            ...resultConfig,
            convert,
        };

        const path = widget && !widget.fake ? widget.key.replace(/[^/]+$/, '') : defaultPath;
        const initName =
            widget && !widget.fake
                ? i18n('wizard', 'label_widget-name-copy', {
                      name: Utils.getEntryNameFromKey(widget.key, true),
                  })
                : extraSettings?.title || getDefaultChartName({dataset, visualization});

        const result = await this.entryDialoguesRef.current!.open({
            dialog: EntryDialogName.CreateWizardChart,
            dialogProps: {
                data,
                initName,
                initDestination: path,
                workbookId: widget.workbookId,
            },
        });

        if (!result || result.status === EntryDialogResolveStatus.Close) {
            return;
        }

        if (result.status === EntryDialogResolveStatus.Success && Boolean(convert)) {
            window.open(`${DL.ENDPOINTS.editor}/${result.data!.entryId}`, '_self');

            return;
        }

        this.props.receiveWidgetAndPrepareMetadata({
            ...result,
            isWidgetWasSaved: true,
        });

        this.props.resetEditHistoryUnit({
            unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
        });
    };

    openSaveWidgetDialog = async (mode?: EntryUpdateMode) => {
        const {widget, configForSaving} = this.props;

        // Are we updating an existing one or saving a new one?
        if (widget && !widget.fake) {
            // Updating an existing one
            this.props.updateWizardWidget({entry: widget, config: configForSaving, mode});

            this.props.updateClientChartsConfig({
                isInitialPreview: true,
                withoutRerender: true,
            });

            await this.props.reloadRevisionsOnSave(true);

            this.props.resetEditHistoryUnit({
                unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
            });

            this.props.addEditHistoryPoint({
                newState: this.props.wizardState,
                unitId: WIZARD_EDIT_HISTORY_UNIT_ID,
            });
        } else {
            // Saving a new one
            this.openSaveAsWidgetDialog();
        }
    };

    openNoRightsDialog = () => {
        this.setState({
            dialogNoRightsVisible: true,
        });
    };

    openSettingsDialog = () => {
        this.setState({
            dialogSettingsVisible: true,
        });
    };

    openRequestWidgetAccessRightsDialog = () => {
        const {widget} = this.props;
        const {entryDialoguesRef} = this;

        entryDialoguesRef.current!.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                entry: {
                    ...widget,
                    entryId: widget.entryId,
                },
            },
        });
    };

    handleSetActualVersion = () => {
        const {widget} = this.props;
        const isDraftEntry = isDraftVersion(widget as RevisionEntry);

        if (isDraftEntry) {
            this.props.setActualWizardChart(true);
        } else {
            this.props.openDialogSaveDraftChartAsActualConfirm({
                onApply: () => this.props.setActualWizardChart(),
            });
        }
    };

    handleSaveDraftClick = () => {
        this.openSaveWidgetDialog(EntryUpdateMode.Save);
    };

    handleSavePublishClick = () => {
        this.openSaveWidgetDialog(EntryUpdateMode.Publish);
    };

    handleSplitPaneSizeChange = () => {
        if (
            this.chartKitRef.current !== null &&
            typeof this.chartKitRef.current.reflow !== 'undefined'
        ) {
            this.chartKitRef.current.reflow();
        }
    };

    getErrorInfo = ({code}: AxiosError<any>) => {
        switch (code as number | string) {
            case 403:
            case 'no-access':
                return {
                    type: 'no-access',
                    title: i18n('wizard', 'label_error-widget-no-access'),
                };
            case 404:
            case 'not-found':
                return {
                    type: 'not-found',
                    title: i18n('wizard', 'label_error-widget-not-found'),
                };
            case 500:
            case 'error':
            default:
                return {
                    type: 'error',
                    title: i18n('wizard', 'label_error-widget-unknown-error'),
                };
        }
    };

    getSaveMenuItems = (): DropdownMenuItemMixed<() => void>[] => {
        return [
            {
                action: () => this.openSaveAsWidgetDialog(true),
                text: i18n('wizard', 'button_save-as-editor-script'),
                hidden: !isEnabledFeature(Feature.EnableSaveAsEditorScript),
                qa: ChartSaveControlsQA.SaveAsEditorScript,
            },
        ];
    };

    renderError() {
        const {widgetError} = this.props;

        const {type, title} = this.getErrorInfo(widgetError!);

        return <ErrorContent className={b('error-content')} type={type} title={title} />;
    }

    renderApp() {
        const {widget, isFullscreen, isWidgetLoading, config, configType} = this.props;

        const fullscreen = isFullscreen ? ' fullscreen-mode' : '';
        const hidden = isFullscreen ? ' hidden' : '';
        const {entryDialoguesRef, toaster} = this;

        return (
            <div className={`${b()}${fullscreen}`}>
                {!isWidgetLoading && (
                    <>
                        <DialogNoRights
                            visible={this.state.dialogNoRightsVisible}
                            onClose={() => {
                                this.setState({
                                    dialogNoRightsVisible: false,
                                });
                            }}
                            onAccessRights={() => {
                                this.openRequestWidgetAccessRightsDialog();
                            }}
                            onSaveAs={() => {
                                this.openSaveAsWidgetDialog();
                            }}
                        />
                        <EntryDialogues ref={entryDialoguesRef} />
                        {Boolean(widget) && !widget.fake && (
                            <React.Fragment>
                                <SlugifyUrl
                                    entryId={widget.entryId}
                                    name={Utils.getEntryNameFromKey(widget.key)}
                                    history={this.props.history}
                                />
                                <AccessRightsUrlOpen history={this.props.history} />
                            </React.Fragment>
                        )}
                    </>
                )}
                <div
                    className={b('hotkeyes-area')}
                    ref={this.hotkeysAreaRef}
                    key={'wizard-hotkeyes-area'}
                >
                    <PageTitle entry={widget} />
                    <WizardActionPanel
                        config={config}
                        configType={configType}
                        entry={widget}
                        onSaveCallback={this.openSaveWidgetDialog}
                        onNoRightsDialogCallback={this.openNoRightsDialog}
                        onSetActualVersionCallback={this.handleSetActualVersion}
                        dropdownItems={this.getSaveMenuItems()}
                        onSaveAsNewClick={this.openSaveAsWidgetDialog}
                        onSaveAsDraftClick={this.handleSaveDraftClick}
                        onSaveAndPublishClick={this.handleSavePublishClick}
                        chartKitRef={this.chartKitRef}
                    />
                    <div className={`columns columns_aside-${getIsAsideHeaderEnabled()}`}>
                        <SplitPane
                            resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                            className="top-pane"
                            split="vertical"
                            minSize={SPLIT_PANE_MIN_SIZE}
                            maxSize={SPLIT_PANE_MAX_SIZE}
                            onChange={this.handleSplitPaneSizeChange}
                        >
                            <div className={`column data-column${hidden}`}>
                                {isWidgetLoading ? (
                                    <div className={b('loader')}>
                                        <Loader size={'l'} />
                                    </div>
                                ) : (
                                    <SectionDataset
                                        workbookId={widget.workbookId as string}
                                        entryDialoguesRef={entryDialoguesRef}
                                        toaster={toaster}
                                        sdk={sdk}
                                    />
                                )}
                            </div>
                            {isWidgetLoading ? (
                                <div className={b('loader')}>
                                    <Loader size={'l'} />
                                </div>
                            ) : (
                                <SplitPane
                                    resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                                    split="vertical"
                                    minSize={SPLIT_PANE_MIN_SIZE}
                                    maxSize={SPLIT_PANE_MAX_SIZE}
                                    onChange={this.handleSplitPaneSizeChange}
                                >
                                    <div className={`column visual-column${hidden}`}>
                                        <SectionVisualization
                                            availableVisualizations={getAvailableVisualizations()}
                                        />
                                    </div>
                                    <div className="column preview-column">
                                        <SectionPreview chartKitRef={this.chartKitRef} />
                                    </div>
                                </SplitPane>
                            )}
                        </SplitPane>
                    </div>
                </div>
            </div>
        );
    }

    private enableWizardScope = () => {
        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.WIZARD);
    };

    private disableWizardScope = () => {
        this.props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.WIZARD);
    };
}

const mapStateToProps = (state: DatalensGlobalState, ownProps: OwnProps) => {
    const {workbookId} = ownProps.match.params || {};

    let widget = selectWidget(state);

    if (widget.fake && workbookId) {
        widget = {
            ...widget,
            workbookId,
        };
    }

    return {
        settings: selectSettings(state),
        extraSettings: selectExtraSettings(state),
        config: selectConfig(state),
        configForSaving: selectConfigForSaving(state),
        configType: selectConfigType(state),
        widget,
        dataset: selectDataset(state),
        visualization: selectVisualization(state),
        widgetError: selectWidgetError(state),
        isFullscreen: selectIsFullscreen(state),
        isWidgetLoading: selectIsWidgetLoading(state),
        isDefaultsSet: selectIsDefaultsSet(state),
        defaultPath: selectDefaultPath(state),
        widgetHash: selectWidgetHash(state),
        previewHash: selectPreviewHash(state),
        previewEntryId: selectPreviewEntryId(state),
        isParentDashWasChanged: isDraft(state) && isEditMode(state),
        initialPreviewHash: selectInitialPreviewHash(state),
        wizardState: state.wizard,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            resetWizardStore,
            setWizardStore,
            setDefaults,
            receiveWidgetAndPrepareMetadata,
            toggleViewOnlyMode,
            updateClientChartsConfig,
            setRevisionsMode,
            cleanRevisions,
            setActualWizardChart,
            updateWizardWidget,
            reloadRevisionsOnSave,
            reloadWizardEntryByRevision,
            openDialogSaveDraftChartAsActualConfirm,
            initEditHistoryUnit,
            resetEditHistoryUnit,
            addEditHistoryPoint,
        },
        dispatch,
    );
};

export default compose<Props, State>(
    withRouter,
    connect(mapStateToProps, mapDispatchToProps),
)(withErrorPage(withHotkeysContext(Wizard)));
