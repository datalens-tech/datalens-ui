import {SPLIT_PANE_RESIZER_CLASSNAME, URL_QUERY} from 'constants/common';

import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import omit from 'lodash/omit';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import SplitPane from 'react-split-pane';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {ErrorCode, ErrorContentTypes} from 'shared';
import {HOTKEYS_SCOPES} from 'ui/constants/misc';
import {withHotkeysContext} from 'ui/hoc/withHotkeysContext';
import {openDialogErrorWithTabs} from 'ui/store/actions/dialog';
import {initEditHistoryUnit} from 'ui/store/actions/editHistory';
import {selectIsRenameWithoutReload} from 'ui/store/selectors/entryContent';
import {
    addAvatar,
    addSource,
    changeAmountPreviewRows,
    closePreview,
    fetchDataset,
    fetchFieldTypes,
    initialFetchDataset,
    initializeDataset,
    openPreview,
    refreshSources,
    saveDataset,
    setAsideHeaderWidth,
    setEditHistoryState,
    togglePreview,
    updateDatasetByValidation,
} from 'units/datasets/store/actions/creators';
import CommonUtils from 'utils/utils';
import {v1 as uuidv1} from 'uuid';

import {AccessRightsUrlOpen} from '../../../../components/AccessRights/AccessRightsUrlOpen';
import ActionPanel from '../../../../components/ActionPanel/ActionPanel';
import EntryDialogues, {
    EntryDialogName,
} from '../../../../components/EntryDialogues/EntryDialogues';
import ErrorContent from '../../../../components/ErrorContent/ErrorContent';
import NavigationPrompt from '../../../../components/NavigationPrompt/NavigationPrompt';
import {PageTitle} from '../../../../components/PageTitle';
import {SlugifyUrl} from '../../../../components/SlugifyUrl';
import UIUtils from '../../../../utils/utils';
import ContainerLoader from '../../components/ContainerLoader/ContainerLoader';
import DatasetPanel from '../../components/DatasetPanel/DatasetPanel';
import DialogCreateDataset from '../../components/DialogCreateDataset/DialogCreateDataset';
import {
    DATASETS_EDIT_HISTORY_UNIT_ID,
    TAB_DATASET,
    TAB_SOURCES,
    VIEW_PREVIEW,
    getFakeEntry,
} from '../../constants';
import DatasetError from '../../containers/DatasetError/DatasetError';
import DatasetTabViewer from '../../containers/DatasetTabViewer/DatasetTabViewer';
import {getAutoCreatedYTDatasetKey} from '../../helpers/datasets';
import DatasetUtils from '../../helpers/utils';
import {
    UISelector,
    datasetErrorSelector,
    datasetKeySelector,
    datasetPermissionsSelector,
    datasetPreviewErrorSelector,
    datasetPreviewSelector,
    datasetSavingErrorSelector,
    datasetValidationErrorSelector,
    isDatasetChangedDatasetSelector,
    isDatasetRevisionMismatchSelector,
    isFavoriteDatasetSelector,
    isLoadingDatasetSelector,
    isSavingDatasetDisabledSelector,
    previewEnabledSelector,
    sourcePrototypesSelector,
    sourceTemplateSelector,
    workbookIdSelector,
} from '../../store/selectors';
import DatasetPreview from '../DatasetPreview/DatasetPreview';

import {ActionPanelRightItems} from './ActionPanelRightItems';

import './Dataset.scss';

const b = block('dataset');
const i18n = I18n.keyset('dataset.dataset-editor.modify');
const i18nError = I18n.keyset('component.view-error.view');
const RIGHT_PREVIEW_PANEL_MIN_SIZE = 500;
const BOTTOM_PREVIEW_PANEL_MIN_SIZE = 48;
const BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE = 200;

class Dataset extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuto: this.props.isAuto,
            isVisibleDialogCreateDataset: false,
            viewId: null,
            progress: false,
            connectionId: '',
            connectionType: '',
            tab: this.props.tab,
            propsDatasetCreationDialog: {},
            previewPanelSize: BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE,
        };

        this.props.initEditHistoryUnit({
            unitId: DATASETS_EDIT_HISTORY_UNIT_ID,
            setState: ({state}) => {
                this.props.setEditHistoryState({state});
            },
            options: {
                pathIgnoreList: [],
            },
        });
    }

    componentDidMount() {
        const {
            datasetId,
            connectionId,
            isCreationProcess,
            initialFetchDataset,
            initializeDataset,
            fetchFieldTypes,
        } = this.props;

        fetchFieldTypes();

        if (isCreationProcess) {
            initializeDataset({connectionId});
        } else if (datasetId) {
            initialFetchDataset({datasetId});
        }

        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.DATASETS);
        window.addEventListener('beforeunload', this.confirmClosePage);
    }

    componentDidUpdate(prevProps) {
        const {
            datasetId: prevDatasetId,
            datasetPreview: {view: prevView},
            asideHeaderData: {size: prevSize} = {},
            ui: {isSourcesLoading: prevIsSourcesLoading},
        } = prevProps;
        const {
            tab,
            ytPath,
            datasetId,
            datasetPreview: {view: curView},
            asideHeaderData: {size: curSize} = {},
            ui: {isSourcesLoading},
            savingError,
        } = this.props;
        const {isAuto} = this.state;

        if (datasetId && prevDatasetId !== datasetId) {
            this.props.initialFetchDataset({datasetId});
        }

        if (prevView !== curView) {
            let previewPanelSize =
                curView === VIEW_PREVIEW.RIGHT
                    ? RIGHT_PREVIEW_PANEL_MIN_SIZE
                    : BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE;

            if (curView === VIEW_PREVIEW.FULL) {
                previewPanelSize = '100%';
            }

            this.setState({previewPanelSize});
        }

        // The moment when the side cap's resize ends
        if (curSize && prevSize !== curSize) {
            this.props.setAsideHeaderWidth(curSize);
        }

        // Before automatically creating a dataset, we are waiting for the sources to load
        if (prevIsSourcesLoading && !isSourcesLoading && isAuto && ytPath) {
            this.autoCreateYTDataset();
        }

        if (tab === TAB_SOURCES && prevIsSourcesLoading && !isSourcesLoading && !isAuto) {
            this.addInitialAvatar();
        }

        // If something went wrong when trying to automatically create a dataset,
        // we give the user control over further work
        if (isAuto && savingError) {
            this.setState({isAuto: false});
        }
    }

    componentWillUnmount() {
        this.props.hotkeysContext?.disableScope(HOTKEYS_SCOPES.DATASETS);
        window.removeEventListener('beforeunload', this.confirmClosePage);
    }

    _datasetEditorRef = React.createRef();
    _askAccessRightsDialogRef = React.createRef();

    async autoCreateYTDataset() {
        const {ytPath, isCreationProcess, history} = this.props;
        const {isAuto} = this.state;

        const sourceId = uuidv1();
        const avatarId = uuidv1();
        const source = {
            ...this.props.sourceTemplate,
            id: sourceId,
            parameters: {table_name: ytPath},
        };
        const avatar = {
            id: avatarId,
            is_root: true,
            title: DatasetUtils.getSourceTitle(source),
            source_id: sourceId,
        };

        this.props.addSource({source});
        this.props.addAvatar({avatar});

        await this.props.updateDatasetByValidation({
            updatePreview: false,
            validateEnabled: true,
        });

        if (this.props.validationError) {
            this.setState({isAuto: false});
        } else {
            this.props.saveDataset({
                isAuto,
                isCreationProcess,
                key: getAutoCreatedYTDatasetKey(ytPath),
                history,
            });
        }
    }

    addInitialAvatar = () => {
        const {sourcePrototypes} = this.props;
        const datasetSourcesRef = this._datasetEditorRef.current;

        if (datasetSourcesRef) {
            datasetSourcesRef.addAvatarOnMapAutoIfNeeds(sourcePrototypes);
        }
    };

    confirmClosePage = (event) => {
        const {isDatasetChanged} = this.props;

        if (isDatasetChanged) {
            // eslint-disable-next-line no-param-reassign
            event.returnValue = true;
        }
    };

    openCreationWidgetPage = () => {
        const {datasetId} = this.props;

        DatasetUtils.openCreationWidgetPage({datasetId, workbookId: this.getWorkbookId()});
    };

    openDialogCreateDataset = () => {
        this.setState({isVisibleDialogCreateDataset: true});
    };

    closeDialogCreateDataset = () => {
        this.setState({isVisibleDialogCreateDataset: false});
    };

    askAccessRights = () => {
        const {datasetId} = this.props;

        this._askAccessRightsDialogRef.current.open({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                entry: {
                    entryId: datasetId,
                },
            },
        });
    };

    getErrorMessageByCode = ({status, data = {}}) => {
        const {message, code} = data;
        switch (status) {
            case 400:
                switch (message) {
                    case 'NO_CONNECTION':
                        return {
                            type: 'error',
                            title: i18n('label_error-400-no-connection-title'),
                        };
                    default:
                        return {
                            type: 'error',
                            title: i18n('label_error-400-title'),
                        };
                }
            case 403:
            case ErrorContentTypes.NO_ACCESS:
                if (code === ErrorCode.PlatformPermissionRequired) {
                    return {
                        type: 'no-access',
                        title: i18n('label_error-403-title'),
                        action: {
                            text: i18nError('button_details'),
                            handler: this.openDialogDetails,
                            buttonProps: {
                                view: 'outlined',
                            },
                        },
                    };
                } else {
                    return {
                        type: 'no-access',
                        title: i18n('label_error-403-title'),
                        action: {
                            text: i18n('button_ask-access-rights'),
                            handler: this.askAccessRights,
                        },
                    };
                }
            case 404:
            case ErrorContentTypes.NOT_FOUND:
                return {
                    type: 'not-found',
                    title: i18n('label_error-404-title'),
                };
            case 500:
            case ErrorContentTypes.ERROR:
            default:
                return {
                    type: 'error',
                    title: i18n('label_error-500-title'),
                };
        }
    };

    getEntry() {
        const {isCreationProcess, datasetId, isFavorite, datasetKey, datasetPermissions} =
            this.props;

        const workbookId = this.getWorkbookId();

        if (isCreationProcess) {
            const searchParams = new URLSearchParams(location.search);
            const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);

            return getFakeEntry('dataset', workbookId, searchCurrentPath);
        }

        return {
            workbookId,
            isFavorite,
            entryId: datasetId,
            key: datasetKey,
            scope: 'dataset',
            permissions: datasetPermissions,
        };
    }

    switchTab = (tab) => {
        this.setState({
            tab,
        });
    };

    openDialogFieldEditor = () => {
        const datasetEditorRef = this._datasetEditorRef.current;

        if (datasetEditorRef) {
            datasetEditorRef.openDialogFieldEditor();
        }
    };

    closeDatasetPreview = () => {
        const datasetEditorRef = this._datasetEditorRef.current;

        if (datasetEditorRef) {
            datasetEditorRef.forceUpdate();
        }

        this.props.closePreview();
    };

    /**
     * @param {string} key
     * @returns {Promise}
     */
    createDatasetInNavigation = (key) => {
        const {isCreationProcess, history} = this.props;
        return this.props.saveDataset({key, history, isCreationProcess, isErrorThrows: true});
    };

    /**
     * @param {object} data
     * @param {string} data.name
     * @returns {Promise}
     */
    createDatasetInWorkbook = ({name}) => {
        const {isCreationProcess, history} = this.props;
        return this.props.saveDataset({
            name,
            history,
            isCreationProcess,
            workbookId: this.getWorkbookId(),
            isErrorThrows: true,
        });
    };

    getWorkbookId() {
        return this.props.match.params.workbookId || this.props.workbookId;
    }

    refreshSources = () => {
        this.props.refreshSources();
        this.props.updateDatasetByValidation({
            updatePreview: true,
            compareContent: true,
        });
    };

    getRightItems = () => {
        const {isCreationProcess} = this.props;

        return (
            <ActionPanelRightItems
                isCreationProcess={isCreationProcess}
                onClickCreateWidgetButton={this.openCreationWidgetPage}
                onClickSaveDatasetButton={() =>
                    isCreationProcess
                        ? this.openDialogCreateDataset()
                        : this.props.saveDataset({isCreationProcess, history})
                }
            />
        );
    };

    openDialogDetails = () => {
        const {datasetError} = this.props;

        this.props.openDialogErrorWithTabs({
            title: datasetError.details.title,
            error: omit(datasetError, 'details'),
        });
    };

    renderErrorContent() {
        const {sdk, datasetError} = this.props;
        const {status, requestId, traceId, message, code} =
            UIUtils.parseErrorResponse(datasetError);
        const {type, title, description, action} = this.getErrorMessageByCode({
            status,
            data: {message, code},
        });

        return (
            <React.Fragment>
                <ErrorContent
                    type={type}
                    title={title}
                    description={description}
                    reqId={requestId}
                    traceId={traceId}
                    action={action}
                />
                <EntryDialogues ref={this._askAccessRightsDialogRef} sdk={sdk} />
            </React.Fragment>
        );
    }

    renderPanels() {
        const {
            sdk,
            datasetId,
            datasetPreview: {view, isVisible},
        } = this.props;
        const {tab, previewPanelSize} = this.state;

        const isRightView = view === VIEW_PREVIEW.RIGHT;
        const mods = {[VIEW_PREVIEW.RIGHT]: isRightView};
        const previewPanelStyles = {};

        let minSize = 0;
        const isSourceOrDatasetTab = tab === TAB_SOURCES || tab === TAB_DATASET;

        if (isVisible && isSourceOrDatasetTab) {
            minSize = isRightView ? RIGHT_PREVIEW_PANEL_MIN_SIZE : BOTTOM_PREVIEW_PANEL_MIN_SIZE;
        } else {
            previewPanelStyles.display = 'none';
            mods[VIEW_PREVIEW.RIGHT] = false;
        }

        return (
            <div className={b('panels')}>
                <SplitPane
                    resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                    split={isRightView ? 'vertical' : 'horizontal'}
                    // Setting the size parameter works only during
                    // initial initialization or changing the split parameter
                    size={previewPanelSize}
                    minSize={minSize}
                    primary={'second'}
                    pane1ClassName={b('content-panel', mods)}
                    pane2ClassName={b('preview-panel', mods)}
                    pane2Style={previewPanelStyles}
                    allowResize={view !== VIEW_PREVIEW.FULL}
                >
                    <DatasetTabViewer
                        ref={this._datasetEditorRef}
                        tab={tab}
                        sdk={sdk}
                        datasetId={datasetId}
                        workbookId={this.getWorkbookId()}
                    />
                    <DatasetPreview closePreview={this.closeDatasetPreview} />
                </SplitPane>
            </div>
        );
    }

    renderControls() {
        const {isCreationProcess, previewEnabled} = this.props;

        return (
            <React.Fragment>
                <ActionPanel entry={this.getEntry()} rightItems={this.getRightItems()} />
                <DatasetPanel
                    isCreationProcess={isCreationProcess}
                    tab={this.state.tab}
                    previewEnabled={previewEnabled}
                    refreshSources={this.refreshSources}
                    switchTab={this.switchTab}
                    togglePreview={this.props.togglePreview}
                    openDialogFieldEditor={this.openDialogFieldEditor}
                />
            </React.Fragment>
        );
    }

    renderContent() {
        const {isVisibleDialogCreateDataset} = this.state;
        const workbookId = this.getWorkbookId();

        return (
            <div className={b()}>
                {this.renderControls()}
                {this.renderPanels()}
                <DialogCreateDataset
                    creationScope={workbookId ? 'workbook' : 'navigation'}
                    visible={isVisibleDialogCreateDataset}
                    onApply={
                        workbookId ? this.createDatasetInWorkbook : this.createDatasetInNavigation
                    }
                    onClose={this.closeDialogCreateDataset}
                />
            </div>
        );
    }

    renderLoader() {
        const text = this.state.isAuto
            ? i18n('label_dataset-auto-creation-process')
            : i18n('label_loading-dataset');

        return (
            <div className={b('loader')}>
                <ContainerLoader text={text} textSize="m" />
            </div>
        );
    }

    renderBody() {
        const {datasetError, isLoading} = this.props;
        const {isAuto} = this.state;

        if (isLoading || isAuto) {
            return this.renderLoader();
        }

        if (datasetError) {
            return this.renderErrorContent();
        }

        return this.renderContent();
    }

    render() {
        const {history, isDatasetRevisionMismatch, isRenameWithoutReload, savingDatasetDisabled} =
            this.props;
        const saveButtonDisabled = savingDatasetDisabled || isDatasetRevisionMismatch;
        const entry = this.getEntry();

        return (
            <React.Fragment>
                <PageTitle entry={entry} />
                {!entry.fake && (
                    <React.Fragment>
                        <SlugifyUrl
                            entryId={entry.entryId}
                            name={CommonUtils.getEntryNameFromKey(entry.key)}
                            history={history}
                        />
                        <AccessRightsUrlOpen history={history} />
                    </React.Fragment>
                )}
                {this.renderBody()}
                <DatasetError />
                <NavigationPrompt when={!saveButtonDisabled && !isRenameWithoutReload} />
            </React.Fragment>
        );
    }
}

Dataset.propTypes = {
    ui: PropTypes.object.isRequired,
    sdk: PropTypes.object.isRequired,
    isCreationProcess: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isFavorite: PropTypes.bool.isRequired,
    isAuto: PropTypes.bool.isRequired,
    previewEnabled: PropTypes.bool.isRequired,
    isDatasetChanged: PropTypes.bool.isRequired,
    isDatasetRevisionMismatch: PropTypes.bool.isRequired,
    isRenameWithoutReload: PropTypes.bool,
    savingDatasetDisabled: PropTypes.bool.isRequired,
    fetchFieldTypes: PropTypes.func.isRequired,
    initializeDataset: PropTypes.func.isRequired,
    initialFetchDataset: PropTypes.func.isRequired,
    fetchDataset: PropTypes.func.isRequired,
    openPreview: PropTypes.func.isRequired,
    closePreview: PropTypes.func.isRequired,
    togglePreview: PropTypes.func.isRequired,
    updateDatasetByValidation: PropTypes.func.isRequired,
    saveDataset: PropTypes.func.isRequired,
    changeAmountPreviewRows: PropTypes.func.isRequired,
    refreshSources: PropTypes.func.isRequired,
    setAsideHeaderWidth: PropTypes.func.isRequired,
    openDialogErrorWithTabs: PropTypes.func.isRequired,
    initEditHistoryUnit: PropTypes.func.isRequired,
    tab: PropTypes.string,
    datasetId: PropTypes.string,
    connectionId: PropTypes.string,
    datasetKey: PropTypes.string,
    ytPath: PropTypes.string,
    datasetError: PropTypes.object,
    validationError: PropTypes.object,
    savingError: PropTypes.object,
    selectedConnection: PropTypes.object,
    sourceTemplate: PropTypes.object,
    sourcePrototypes: PropTypes.array,
    datasetPreview: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    asideHeaderData: PropTypes.shape({
        size: PropTypes.number.isRequired,
    }),
    datasetPermissions: PropTypes.object,
};

Dataset.defaultProps = {
    isCreationProcess: false,
};

const mapStateToProps = createStructuredSelector({
    datasetKey: datasetKeySelector,
    datasetPermissions: datasetPermissionsSelector,
    datasetError: datasetErrorSelector,
    previewError: datasetPreviewErrorSelector,
    savingError: datasetSavingErrorSelector,
    validationError: datasetValidationErrorSelector,
    datasetPreview: datasetPreviewSelector,
    isDatasetChanged: isDatasetChangedDatasetSelector,
    isLoading: isLoadingDatasetSelector,
    isFavorite: isFavoriteDatasetSelector,
    savingDatasetDisabled: isSavingDatasetDisabledSelector,
    isDatasetRevisionMismatch: isDatasetRevisionMismatchSelector,
    previewEnabled: previewEnabledSelector,
    sourcePrototypes: sourcePrototypesSelector,
    sourceTemplate: sourceTemplateSelector,
    ui: UISelector,
    workbookId: workbookIdSelector,
    isRenameWithoutReload: selectIsRenameWithoutReload,
});
const mapDispatchToProps = {
    fetchFieldTypes,
    initializeDataset,
    initialFetchDataset,
    fetchDataset,
    saveDataset,
    openPreview,
    closePreview,
    togglePreview,
    updateDatasetByValidation,
    changeAmountPreviewRows,
    refreshSources,
    setAsideHeaderWidth,
    addSource,
    addAvatar,
    openDialogErrorWithTabs,
    initEditHistoryUnit,
    setEditHistoryState,
};

export default compose(connect(mapStateToProps, mapDispatchToProps))(
    withRouter(withHotkeysContext(Dataset)),
);
