import React from 'react';

import {dateTimeUtc} from '@gravity-ui/date-utils';
import type {ButtonView} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {History, Location} from 'history';
import {I18n} from 'i18n';
import omit from 'lodash/omit';
import type {HotkeysContextType} from 'react-hotkeys-hook/dist/HotkeysProvider';
import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import {createStructuredSelector} from 'reselect';
import type {DatasetSource, DatasetSourceAvatar} from 'shared';
import {EntryScope, ErrorCode, ErrorContentTypes} from 'shared';
import type {GetEntryResponse, GetRevisionsEntry} from 'shared/schema';
import type {DataLensApiError, SDK} from 'ui';
import type {DialogUnlockProps} from 'ui/components/EntryDialogues/DialogUnlock';
import {SPLIT_PANE_RESIZER_CLASSNAME, URL_QUERY} from 'ui/constants/common';
import {HOTKEYS_SCOPES} from 'ui/constants/misc';
import {withHotkeysContext} from 'ui/hoc/withHotkeysContext';
import {
    openDialogErrorWithTabs,
    openDialogSaveDraftChartAsActualConfirm,
} from 'ui/store/actions/dialog';
import {initEditHistoryUnit} from 'ui/store/actions/editHistory';
import {
    addAvatar,
    addSource,
    closePreview,
    fetchFieldTypes,
    initialFetchDataset,
    initializeDataset,
    refreshSources,
    saveDataset,
    setActualDataset,
    setCurrentTab,
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
import {PageTitle} from '../../../../components/PageTitle';
import {SlugifyUrl} from '../../../../components/SlugifyUrl';
import UIUtils from '../../../../utils/utils';
import ContainerLoader from '../../components/ContainerLoader/ContainerLoader';
import DatasetPanel from '../../components/DatasetPanel/DatasetPanel';
import type {
    DialogCreateDatasetInNavigationProps,
    DialogCreateDatasetInWorkbookProps,
    DialogCreateDatasetProps,
} from '../../components/DialogCreateDataset/DialogCreateDataset';
import DialogCreateDataset from '../../components/DialogCreateDataset/DialogCreateDataset';
import type {DatasetTab} from '../../constants';
import {
    DATASETS_EDIT_HISTORY_UNIT_ID,
    DATASET_DATE_AVAILABLE_FORMAT,
    MIN_AVAILABLE_DATASET_REV_DATE,
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
    currentTabSelector,
    datasetCurrentRevIdSelector,
    datasetErrorSelector,
    datasetKeySelector,
    datasetPermissionsSelector,
    datasetPreviewErrorSelector,
    datasetPreviewSelector,
    datasetPublishedIdSelector,
    datasetSavingErrorSelector,
    datasetValidationErrorSelector,
    isDatasetRevisionMismatchSelector,
    isFavoriteDatasetSelector,
    isLoadingDatasetSelector,
    isRefetchingDatasetSelector,
    previewEnabledSelector,
    sourcePrototypesSelector,
    sourceTemplateSelector,
    workbookIdSelector,
} from '../../store/selectors';
import type {DatasetReduxState} from '../../store/types';
import type {DatasetEditor} from '../DatasetEditor/DatasetEditor';
import DatasetPreview from '../DatasetPreview/DatasetPreview';
import type {DatasetSources} from '../DatasetSources/DatasetSources';

import {ActionPanelRightItems} from './ActionPanelRightItems';

import './Dataset.scss';

const b = block('dataset');
const i18n = I18n.keyset('dataset.dataset-editor.modify');
const i18nError = I18n.keyset('component.view-error.view');
const i18nActionPanel = I18n.keyset('component.action-panel.view');
const i18nDialogRevisions = I18n.keyset('component.dialog-revisions.view');
const RIGHT_PREVIEW_PANEL_MIN_SIZE = 500;
const BOTTOM_PREVIEW_PANEL_MIN_SIZE = 48;
const BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE = 200;

type StateProps = ReturnType<typeof mapStateToProps>;

interface OwnProps {
    sdk: SDK;
    isAuto: boolean;
    isCreationProcess: boolean;
    datasetId: string;
    connectionId: string;
    ytPath?: string;
    workbookIdFromPath?: string;
    hotkeysContext?: HotkeysContextType;
    location: Location;
    history: History;
}

type ReduxProps = ConnectedProps<typeof connector>;
type Props = ReduxProps & OwnProps & StateProps;

type State = {
    isAuto: boolean;
    isVisibleDialogCreateDataset: boolean;
    viewId: string | null;
    progress: boolean;
    connectionId: string;
    connectionType: string;
    previewPanelSize: number | string;
};

class Dataset extends React.Component<Props, State> {
    static defaultProps = {
        isCreationProcess: false,
    };
    _datasetEditorRef = React.createRef<DatasetSources | DatasetEditor>();
    _askAccessRightsDialogRef = React.createRef<EntryDialogues>();

    constructor(props: Props) {
        super(props);

        this.state = {
            isAuto: this.props.isAuto,
            isVisibleDialogCreateDataset: false,
            viewId: null,
            progress: false,
            connectionId: '',
            connectionType: '',
            previewPanelSize: BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE,
        };

        this.props.initEditHistoryUnit<DatasetReduxState>({
            unitId: DATASETS_EDIT_HISTORY_UNIT_ID,
            setState: (args) => {
                this.props.setEditHistoryState(args);
            },
            options: {
                pathIgnoreList: ['/isLoading'],
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
            location,
        } = this.props;
        const currentSearchParams = new URLSearchParams(location.search);
        const revId = currentSearchParams.get(URL_QUERY.REV_ID) ?? undefined;

        fetchFieldTypes();

        if (isCreationProcess) {
            initializeDataset({connectionId});
        } else if (datasetId) {
            initialFetchDataset({datasetId, rev_id: revId});
        }

        this.props.hotkeysContext?.enableScope(HOTKEYS_SCOPES.DATASETS);
    }

    componentDidUpdate(prevProps: Props) {
        const {
            datasetId: prevDatasetId,
            datasetPreview: {view: prevView},
            ui: {isSourcesLoading: prevIsSourcesLoading},
            location: prevLocation,
        } = prevProps;
        const {
            currentTab,
            ytPath,
            datasetId,
            datasetPreview: {view: curView},
            ui: {isSourcesLoading},
            savingError,
            location,
            initialFetchDataset,
            publishedId,
            currentRevId,
        } = this.props;
        const {isAuto} = this.state;

        const currentSearchParams = new URLSearchParams(location.search);
        const prevSearchParams = new URLSearchParams(prevLocation.search);
        const revId = currentSearchParams.get(URL_QUERY.REV_ID) ?? undefined;
        const prevRevId = prevSearchParams.get(URL_QUERY.REV_ID) ?? undefined;
        const hasRevisionChanged = revId !== prevRevId;
        const isSavingUpdate = publishedId === currentRevId && !revId;

        if (datasetId && prevDatasetId !== datasetId) {
            initialFetchDataset({datasetId, rev_id: revId});
        }

        if (hasRevisionChanged && !isSavingUpdate) {
            initialFetchDataset({datasetId, rev_id: revId, isInitialFetch: false});
        }

        if (prevView !== curView) {
            let previewPanelSize: string | number =
                curView === VIEW_PREVIEW.RIGHT
                    ? RIGHT_PREVIEW_PANEL_MIN_SIZE
                    : BOTTOM_PREVIEW_PANEL_DEFAULT_SIZE;

            if (curView === VIEW_PREVIEW.FULL) {
                previewPanelSize = '100%';
            }

            this.setState({previewPanelSize});
        }

        // Before automatically creating a dataset, we are waiting for the sources to load
        if (prevIsSourcesLoading && !isSourcesLoading && isAuto && ytPath) {
            this.autoCreateYTDataset();
        }

        if (currentTab === TAB_SOURCES && prevIsSourcesLoading && !isSourcesLoading && !isAuto) {
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
    }

    async autoCreateYTDataset() {
        const {ytPath, isCreationProcess, history} = this.props;
        const {isAuto} = this.state;

        const sourceId = uuidv1();
        const avatarId = uuidv1();
        const source = {
            ...this.props.sourceTemplate,
            id: sourceId,
            parameters: {table_name: ytPath},
        } as DatasetSource;
        const avatar = {
            id: avatarId,
            is_root: true,
            title: DatasetUtils.getSourceTitle(source),
            source_id: sourceId,
        } as DatasetSourceAvatar;

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

        if (datasetSourcesRef && 'addAvatarOnMapAutoIfNeeds' in datasetSourcesRef) {
            datasetSourcesRef.addAvatarOnMapAutoIfNeeds(sourcePrototypes);
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

        this._askAccessRightsDialogRef.current?.open?.({
            dialog: EntryDialogName.Unlock,
            dialogProps: {
                entry: {
                    entryId: datasetId,
                } as DialogUnlockProps['entry'],
            },
        });
    };

    getErrorMessageByCode = ({
        status,
        data = {},
    }: {
        status: number | null | string;
        data: {message?: string; code?: string};
    }) => {
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
                                view: 'outlined' as ButtonView,
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

    getEntry(): GetEntryResponse & {fake?: boolean} {
        const {
            isCreationProcess,
            datasetId,
            isFavorite,
            datasetKey,
            datasetPermissions,
            publishedId,
            currentRevId,
        } = this.props;
        const workbookId = this.getWorkbookId();

        if (isCreationProcess) {
            const searchParams = new URLSearchParams(location.search);
            const searchCurrentPath = searchParams.get(URL_QUERY.CURRENT_PATH);

            return getFakeEntry(EntryScope.Dataset, workbookId, searchCurrentPath!);
        }

        return {
            workbookId,
            isFavorite,
            publishedId,
            revId: currentRevId,
            entryId: datasetId,
            key: datasetKey,
            scope: 'dataset',
            permissions: datasetPermissions,
        } as GetEntryResponse;
    }

    switchTab = (currentTab: DatasetTab) => {
        this.props.setCurrentTab({currentTab});
    };

    openDialogFieldEditor = () => {
        const datasetEditorRef = this._datasetEditorRef.current;

        if (datasetEditorRef && 'openDialogFieldEditor' in datasetEditorRef) {
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

    createDatasetInNavigation: DialogCreateDatasetInNavigationProps['onApply'] = (key) => {
        const {isCreationProcess, history} = this.props;
        return this.props.saveDataset({key, history, isCreationProcess, isErrorThrows: true});
    };

    createDatasetInWorkbook: DialogCreateDatasetInWorkbookProps['onApply'] = ({name}) => {
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
        return this.props.workbookIdFromPath || this.props.workbookId;
    }

    refreshSources = () => {
        this.props.refreshSources();
        this.props.updateDatasetByValidation({
            updatePreview: true,
            compareContent: true,
        });
    };

    getRightItems = () => {
        const {isCreationProcess, history} = this.props;

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
            error: omit(datasetError, 'details') as DataLensApiError,
        });
    };

    setActualVersionHandler = () => {
        const {history} = this.props;
        this.props.openDialogSaveDraftInstanceAsActualConfirm({
            onApply: () => {
                this.props.setActualDataset({history});
            },
        });
    };

    renderErrorContent() {
        const {sdk, datasetError} = this.props;
        const {status, requestId, traceId, message, code} =
            UIUtils.parseErrorResponse(datasetError);
        const {type, title, action} = this.getErrorMessageByCode({
            status,
            data: {message, code},
        });

        return (
            <React.Fragment>
                <ErrorContent
                    type={type}
                    title={title}
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
            currentTab,
        } = this.props;
        const {previewPanelSize} = this.state;

        const isRightView = view === VIEW_PREVIEW.RIGHT;
        const mods = {[VIEW_PREVIEW.RIGHT]: isRightView};
        const previewPanelStyles: React.CSSProperties = {};

        let minSize = 0;
        const isSourceOrDatasetTab = currentTab === TAB_SOURCES || currentTab === TAB_DATASET;

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
                    //This props not exist in interface, but it works
                    //@ts-ignore
                    pane1ClassName={b('content-panel', mods)}
                    pane2ClassName={b('preview-panel', mods)}
                    pane2Style={previewPanelStyles}
                    allowResize={view !== VIEW_PREVIEW.FULL}
                >
                    <DatasetTabViewer
                        ref={this._datasetEditorRef}
                        tab={currentTab}
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
        const DATASET_DISABLED_DATE = dateTimeUtc({input: MIN_AVAILABLE_DATASET_REV_DATE});
        const formattedMinDatasetDate = DATASET_DISABLED_DATE?.format(
            DATASET_DATE_AVAILABLE_FORMAT,
        );
        const description = `${i18nActionPanel('label_history-changes-date-limit-dataset')} ${formattedMinDatasetDate ?? ''}`;

        const getRevisionRowExtendedProps = (item: GetRevisionsEntry) => {
            const updatedTime = dateTimeUtc({input: item.updatedAt});
            const disabled =
                (updatedTime?.isValid() && updatedTime?.isBefore(DATASET_DISABLED_DATE)) ?? false;
            const disabledText = disabled
                ? i18nDialogRevisions('label_status-tooltip-disable')
                : '';
            return {
                disabled,
                disabledText,
            };
        };

        return (
            <React.Fragment>
                <ActionPanel
                    entry={this.getEntry()}
                    rightItems={this.getRightItems()}
                    setActualVersion={this.setActualVersionHandler}
                    expandablePanelDescription={description}
                    getRevisionRowExtendedProps={getRevisionRowExtendedProps}
                />
                <DatasetPanel
                    isCreationProcess={this.props.isCreationProcess}
                    tab={this.props.currentTab}
                    previewEnabled={this.props.previewEnabled}
                    refreshSources={this.refreshSources}
                    switchTab={this.switchTab}
                    togglePreview={this.props.togglePreview}
                    openDialogFieldEditor={this.openDialogFieldEditor}
                />
            </React.Fragment>
        );
    }

    renderContent() {
        const {isRefetchingDataset} = this.props;
        const {isVisibleDialogCreateDataset} = this.state;
        const workbookId = this.getWorkbookId();

        const dialogProps = {
            creationScope: workbookId ? 'workbook' : 'navigation',
            visible: isVisibleDialogCreateDataset,
            onApply: workbookId ? this.createDatasetInWorkbook : this.createDatasetInNavigation,
            onClose: this.closeDialogCreateDataset,
        } as DialogCreateDatasetProps;

        return (
            <div className={b()}>
                {this.renderControls()}
                {isRefetchingDataset ? this.renderLoader() : this.renderPanels()}
                <DialogCreateDataset {...dialogProps} />
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
        const entry = this.getEntry();

        return (
            <React.Fragment>
                <PageTitle entry={entry} />
                {!entry.fake && (
                    <React.Fragment>
                        <SlugifyUrl
                            entryId={entry.entryId}
                            name={CommonUtils.getEntryNameFromKey(entry.key)}
                            history={this.props.history}
                        />
                        <AccessRightsUrlOpen history={this.props.history} />
                    </React.Fragment>
                )}
                {this.renderBody()}
                <DatasetError />
            </React.Fragment>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    datasetKey: datasetKeySelector,
    datasetPermissions: datasetPermissionsSelector,
    datasetError: datasetErrorSelector,
    previewError: datasetPreviewErrorSelector,
    savingError: datasetSavingErrorSelector,
    validationError: datasetValidationErrorSelector,
    datasetPreview: datasetPreviewSelector,
    isLoading: isLoadingDatasetSelector,
    isRefetchingDataset: isRefetchingDatasetSelector,
    publishedId: datasetPublishedIdSelector,
    currentRevId: datasetCurrentRevIdSelector,
    isFavorite: isFavoriteDatasetSelector,
    isDatasetRevisionMismatch: isDatasetRevisionMismatchSelector,
    previewEnabled: previewEnabledSelector,
    sourcePrototypes: sourcePrototypesSelector,
    sourceTemplate: sourceTemplateSelector,
    ui: UISelector,
    workbookId: workbookIdSelector,
    currentTab: currentTabSelector,
});
const mapDispatchToProps = {
    fetchFieldTypes,
    initializeDataset,
    initialFetchDataset,
    saveDataset,
    closePreview,
    togglePreview,
    updateDatasetByValidation,
    refreshSources,
    addSource,
    addAvatar,
    openDialogSaveDraftInstanceAsActualConfirm: openDialogSaveDraftChartAsActualConfirm,
    openDialogErrorWithTabs,
    initEditHistoryUnit,
    setEditHistoryState,
    setCurrentTab,
    setActualDataset,
};
const connector = connect(mapStateToProps, mapDispatchToProps);

export default withHotkeysContext(connector(Dataset));
