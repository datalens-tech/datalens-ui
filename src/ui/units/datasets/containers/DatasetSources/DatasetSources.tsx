import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {ConnectedProps} from 'react-redux';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import {createStructuredSelector} from 'reselect';
import type {
    CollectionId,
    DatasetAvatarRelation,
    DatasetComponentError,
    DatasetSource,
    DatasetSourceAvatar,
    WorkbookId,
} from 'shared';
import type {BaseSource} from 'shared/schema';
import {showToast} from 'store/actions/toaster';
import {SPLIT_PANE_RESIZER_CLASSNAME} from 'ui';
import type {DataLensApiError, SDK} from 'ui';
import {URL_QUERY} from 'ui/constants';
import {
    addAvatar,
    addAvatarPrototypes,
    addConnection,
    addRelation,
    addSource,
    clickConnection,
    deleteAvatar,
    deleteConnection,
    deleteSource,
    getSources,
    getSourcesListingOptions,
    openDialogParameterCreate,
    openDialogParameterEdit,
    replaceConnection,
    replaceSource,
    resetSourcesPagination,
    toggleSaveDataset,
    updateDatasetByValidation,
    updateRelation,
    updateSource,
} from 'units/datasets/store/actions/creators';
import {v1 as uuidv1} from 'uuid';

import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import DragAndDrop from '../../components/DragAndDrop/DragAndDrop';
import RelationDialog from '../../components/RelationDialog/RelationDialog';
import RelationsMap from '../../components/RelationsMap/RelationsMap';
import SelectSourcePrototypes from '../../components/SelectSourcePrototypes/SelectSourcePrototypes';
import SourceEditorDialog from '../../components/SourceEditorDialog/SourceEditorDialog';
import type {EditedSource} from '../../components/SourceEditorDialog/types';
import Veil from '../../components/Veil/Veil';
import {ComponentErrorType, DATASET_UPDATE_ACTIONS, JOIN_TYPES, TOAST_TYPES} from '../../constants';
import {getComponentErrorsByType} from '../../helpers/datasets';
import DatasetUtils, {getSourceListingValues} from '../../helpers/utils';
import {
    UISelector,
    componentErrorsSelector,
    connectionsSelector,
    currentDbNameSelector,
    datasetIdSelector,
    filteredRelationsSelector,
    filteredSourceAvatarsSelector,
    filteredSourcesSelector,
    freeformSourcesSelector,
    optionsSelector,
    selectedConnectionSelector,
    sortedSourcePrototypesSelector,
    sourceTemplateSelector,
    sourcesErrorSelector,
    sourcesPaginationSelector,
} from '../../store/selectors';
import type {ConnectionEntry, FreeformSource, SourcePrototype, Update} from '../../store/types';
import type {
    ConnectionEntryWithDelegation,
    UpdateDatasetByValidationProps,
} from '../../typings/redux';

import './DatasetSources.scss';

const b = block('dataset-sources');
const SOURCES_PANEL_MIN_SIZE = 256;
const SOURCES_PANEL_MAX_SIZE = 512;

interface OwnProps {
    sdk: SDK;
    workbookId: WorkbookId;
    collectionId: CollectionId;
    readonly: boolean;
    bindedWorkbookId?: WorkbookId;
}

type StateProps = ReturnType<typeof mapStateToProps>;
type ReduxProps = ConnectedProps<typeof connector>;
type Props = ReduxProps & OwnProps & StateProps;

interface State {
    connectionId: string | null;
    dragSource: DatasetSource | SourcePrototype | null;
    dropSource: DatasetSourceAvatar | null;
    relation?: DatasetAvatarRelation | null;
    source: DatasetSource | FreeformSource | null;
    validRelation: boolean;
    isUpdating: boolean;
    isLoadingConnectionInfo: boolean;
    isVisibleSourceEditorDialog: boolean;
    isVisibleRelationDialog: boolean;
}

type UpdateDatasetConfigParamsType = (typeof DATASET_UPDATE_ACTIONS)[Extract<
    keyof typeof DATASET_UPDATE_ACTIONS,
    | 'AVATAR_ADD'
    | 'AVATAR_DELETE'
    | 'RELATION_UPDATE'
    | 'SOURCE_ADD'
    | 'SOURCE_REPLACE'
    | 'CONNECTION_REPLACE'
    | 'SOURCE_UPDATE'
    | 'SOURCE_DELETE'
>];

type UpdateDatasetConfigParams = {
    type: UpdateDatasetConfigParamsType;
    update?: {
        source?: DatasetSource | FreeformSource;
        avatar?: DatasetSourceAvatar;
        relation?: DatasetAvatarRelation | null;
        sourceId?: string;
        connection?: ConnectionEntryWithDelegation;
        newConnection?: ConnectionEntryWithDelegation;
        avatarId?: string;
    };
    updatePreview?: boolean;
    validateEnabled?: boolean;
};

export class DatasetSources extends React.Component<Props, State> {
    state = {
        connectionId: null,
        dragSource: null,
        dropSource: null,
        relation: null,
        source: null,
        validRelation: true,
        isUpdating: false,
        isLoadingConnectionInfo: false,
        isVisibleSourceEditorDialog: false,
        isVisibleRelationDialog: false,
    };

    isUnmounted = false;

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    get relationsErrors() {
        return getComponentErrorsByType(
            this.props.componentErrors!,
            ComponentErrorType.AvatarRelation,
        );
    }

    get isDisabledDropSource() {
        const {
            options: {source_avatars: {max, items = []} = {}},
        } = this.props;

        if (max === undefined) {
            return false;
        }

        return items.length >= max;
    }

    _showToast = ({
        name,
        title,
        error,
    }: {
        name: string;
        title: string;
        error?: DataLensApiError;
    }) => {
        let type = 'info';
        if (error) {
            type = 'error';
        }

        this.props.showToast({
            name,
            title,
            error,
            withReport: type === 'error',
        });
    };

    updateSelectedSource = (source: BaseSource) => {
        this.setState({source});
    };

    openSourceEditorDialog = (source: BaseSource) => {
        this.setState({
            isVisibleSourceEditorDialog: true,
            source,
        });
    };

    closeSourceEditorDialog = () => {
        this.setState({
            isVisibleSourceEditorDialog: false,
            source: null,
        });
    };

    editSource = (source: BaseSource) => {
        this.openSourceEditorDialog(source);
    };

    addSource = () => {
        const freeformSource = this.props.freeformSources[0];

        if (freeformSource) {
            this.openSourceEditorDialog(freeformSource);
        } else {
            logger.logError('DatasetSources.addSource: there is no freeformSources to add');
        }
    };

    openRelationDialog = ({relationId}: {relationId: string}) => {
        const relation = this.props.relations.find(({id}) => id === relationId);
        const isRelationWithError = Boolean(this.relationsErrors.find(({id}) => id === relationId));

        this.setState({
            isVisibleRelationDialog: true,
            relation,
            validRelation: !isRelationWithError,
        });
    };

    closeRelationDialog = () => {
        this.setState({
            isVisibleRelationDialog: false,
            relation: null,
        });
    };

    saveSource = (source: EditedSource) => {
        let nextUpdate;

        if ('id' in source && source.id) {
            const update = {
                source,
            };

            nextUpdate = this.updateDatasetConfig({
                type: DATASET_UPDATE_ACTIONS.SOURCE_UPDATE,
                update,
            });
        } else {
            nextUpdate = this.addAvatar(source);
        }

        return nextUpdate;
    };

    deleteSource = ({id}: {id: string}) => {
        const update = {sourceId: id};

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.SOURCE_DELETE,
            update,
        });
    };

    addAvatarOnMapAutoIfNeeds = (preparedSources: SourcePrototype[] = []) => {
        const {avatars, freeformSources, sourceLoadingError, sourcesPagination} = this.props;
        const isNeededToAddNewSource =
            freeformSources.length &&
            !preparedSources.length &&
            !sourceLoadingError &&
            !sourcesPagination.searchValue;
        const isNeededToAddPreparedSourceAvatar =
            preparedSources.length === 1 && !freeformSources.length && !avatars.length;

        if (isNeededToAddNewSource) {
            this.addSource();
        } else if (isNeededToAddPreparedSourceAvatar) {
            const preparedSource = preparedSources[0];

            if (preparedSource) {
                this.addAvatar(preparedSource);
            }
        }
    };

    selectConnection = async ({
        entryId,
        isDelegated,
        collectionId: connCollectionId,
    }: {
        entryId: string;
        isDelegated?: boolean;
        collectionId?: CollectionId;
    }) => {
        try {
            const {
                workbookId,
                bindedWorkbookId,
                datasetId,
                collectionId: datasetCollectionId,
            } = this.props;
            this.setState({isLoadingConnectionInfo: true});
            const bindedDatasetId =
                bindedWorkbookId || (datasetCollectionId && connCollectionId)
                    ? datasetId
                    : undefined;
            const connection = (await getSdk().sdk.us.getEntry({
                entryId,
                workbookId: workbookId || bindedWorkbookId,
                bindedDatasetId,
                includePermissionsInfo: true,
            })) as ConnectionEntry;

            await this.props.addConnection({
                connection: {...connection, isDelegated},
            });
            this.setState({isLoadingConnectionInfo: false});

            this.clickConnection(entryId);
        } catch (error) {
            this.setState({isLoadingConnectionInfo: false});
            if (error !== null) {
                logger.logError('DatasetSources: selectConnection failed', error);
            }
            this._showToast({
                error,
                name: TOAST_TYPES.SELECT_CONNECTION,
                title: i18n('dataset.notifications.view', 'toast_select-connection-failure'),
            });
        }
    };

    clickConnection = async (connectionId: string) => {
        const {
            sourcePrototypes,
            sourcesPagination,
            workbookId,
            selectedConnection: {
                entryId: selectedConnId,
                collectionId: selectedConnCollectionId,
            } = {},
            resetSourcesPagination,
            bindedWorkbookId,
        } = this.props;

        if (connectionId === selectedConnId) {
            return sourcePrototypes;
        }

        this.props.clickConnection({connectionId});

        resetSourcesPagination();
        const isSharedConnection = Boolean(selectedConnCollectionId);
        const {sourceListing, currentDbName} = await this.props.getSourcesListingOptions({
            connectionId,
            isSharedConnection,
            workbookId,
            bindedWorkbookId,
        });

        const {serverPagination, dbNameRequiredForSearch} = getSourceListingValues(sourceListing);

        return this.props.getSources({
            connectionId,
            workbookId,
            bindedWorkbookId,
            isSharedConnection,
            limit: serverPagination ? sourcesPagination.limit : undefined,
            currentDbName: dbNameRequiredForSearch ? currentDbName : undefined,
        });
    };

    deleteConnection = ({connectionId}: {connectionId: string}) => {
        const {connections, selectedConnection: {entryId: selectedConnId} = {}} = this.props;
        const selectedConnDeleted = connectionId === selectedConnId;
        const nextConn = connections.find(({entryId}) => entryId !== connectionId);

        this.props.deleteConnection({connectionId});

        if (selectedConnDeleted && nextConn) {
            this.clickConnection(nextConn.entryId);
        }
    };

    retryToGetSources = async () => {
        const {
            selectedConnection: {entryId, collectionId: selectedConnCollectionId} = {},
            workbookId,
            sourcesPagination,
            resetSourcesPagination,
            getSourcesListingOptions,
            bindedWorkbookId,
        } = this.props;

        if (!entryId) {
            return;
        }

        resetSourcesPagination();
        const isSharedConnection = Boolean(selectedConnCollectionId);

        const {sourceListing, currentDbName} = await getSourcesListingOptions({
            connectionId: entryId,
            isSharedConnection,
            workbookId,
            bindedWorkbookId,
        });

        const {serverPagination, dbNameRequiredForSearch} = getSourceListingValues(sourceListing);

        this.props.getSources({
            connectionId: entryId,
            workbookId,
            bindedWorkbookId,
            isSharedConnection,
            limit: serverPagination ? sourcesPagination.limit : undefined,
            currentDbName: dbNameRequiredForSearch ? currentDbName : undefined,
        });
    };

    updateDatasetByValidation = (data: UpdateDatasetByValidationProps) => {
        this.setState({isUpdating: true});
        const {workbookId, bindedWorkbookId} = this.props;
        return this.props
            .updateDatasetByValidation({...data, workbookId, bindedWorkbookId})
            .finally(() => {
                if (this.isUnmounted) {
                    return;
                }

                this.setState({isUpdating: false});
            });
    };

    updateDatasetConfig = ({
        type,
        update = {},
        updatePreview = false,
        validateEnabled = true,
    }: UpdateDatasetConfigParams): Promise<{
        updates?: Update[];
        sourceErrors: DatasetComponentError[];
    }> => {
        this.props.toggleSaveDataset({enable: !validateEnabled});

        switch (type) {
            case DATASET_UPDATE_ACTIONS.AVATAR_ADD: {
                const {source, avatar, relation} = update;

                if (source) {
                    this.props.addSource({source: source as DatasetSource});
                }

                this.props.addAvatar({avatar: avatar!});

                if (relation) {
                    this.props.addRelation({relation});
                }

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.AVATAR_DELETE: {
                const {avatarId} = update;

                this.props.deleteAvatar({avatarId: avatarId!});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.RELATION_UPDATE: {
                const {relation} = update;

                this.props.updateRelation({relation: relation!});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_ADD: {
                const {source} = update;

                this.props.addSource({source: source as DatasetSource});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_REPLACE: {
                const {source, avatar} = update;

                this.props.replaceSource({
                    source: source as DatasetSource,
                    avatar: avatar!,
                });

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.CONNECTION_REPLACE: {
                const {connection, newConnection} = update;

                this.setState({isLoadingConnectionInfo: true});

                return this.props
                    .replaceConnection({
                        connection: connection!,
                        newConnection,
                    })
                    .then(() => {
                        this.setState({isLoadingConnectionInfo: false});
                        return this.updateDatasetByValidation({
                            updatePreview,
                            validateEnabled,
                        });
                    });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_UPDATE: {
                const {source} = update;

                this.props.updateSource({source: source as DatasetSource});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_DELETE: {
                const {sourceId} = update;

                this.props.deleteSource({sourceId: sourceId!});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
        }
    };

    getExistedSource = (source: DatasetSource | BaseSource | SourcePrototype) => {
        const {sources} = this.props;
        const {parameter_hash: parameterHash} = source;

        return sources.find(({parameter_hash: hash}) => hash === parameterHash);
    };

    shapeUpdateAddInitialAvatar = (initialItem: DatasetSource | BaseSource | SourcePrototype) => {
        const avatarId = uuidv1();
        let update;

        const title = DatasetUtils.getSourceTitle(initialItem);
        const source = this.getExistedSource(initialItem);

        if (source) {
            const {id: sourceId} = source;

            update = {
                avatar: {
                    id: avatarId,
                    is_root: true,
                    title,
                    source_id: sourceId,
                } as DatasetSourceAvatar,
            };
        } else {
            const sourceId = uuidv1();

            update = {
                source: {
                    id: sourceId,
                    ...initialItem,
                },
                avatar: {
                    id: avatarId,
                    is_root: true,
                    title,
                    source_id: sourceId,
                } as DatasetSourceAvatar,
            };
        }

        return update;
    };

    formAvatarTitle = (source: DatasetSource) => {
        const {avatars} = this.props;

        return DatasetUtils.formAvatarTitle({
            avatars,
            source,
        });
    };

    shapeUpdateAddAvatar = (
        leftItem: DatasetSourceAvatar,
        rightItem: DatasetSource | SourcePrototype | FreeformSource,
    ) => {
        const {id: leftAvatarId} = leftItem;
        const {id: rightItemId} = rightItem as DatasetSource;

        const rightAvatarId = uuidv1();
        const relationId = uuidv1();
        let update = {};

        const title = this.formAvatarTitle(rightItem as DatasetSource);

        if (rightItemId) {
            return {
                avatar: {
                    id: rightAvatarId,
                    title,
                    source_id: rightItemId,
                },
                relation: {
                    id: relationId,
                    left_avatar_id: leftAvatarId,
                    right_avatar_id: rightAvatarId,
                    join_type: JOIN_TYPES.INNER,
                    conditions: [],
                },
            };
        } else {
            const source = this.getExistedSource(rightItem);

            if (source) {
                const {id: rightSourceId} = source;

                update = {
                    avatar: {
                        id: rightAvatarId,
                        title,
                        source_id: rightSourceId,
                    },
                    relation: {
                        id: relationId,
                        left_avatar_id: leftAvatarId,
                        right_avatar_id: rightAvatarId,
                        join_type: JOIN_TYPES.INNER,
                        conditions: [],
                    },
                };
            } else {
                const rightSourceId = uuidv1();

                update = {
                    source: {
                        id: rightSourceId,
                        ...rightItem,
                    },
                    avatar: {
                        id: rightAvatarId,
                        title,
                        source_id: rightSourceId,
                    },
                    relation: {
                        id: relationId,
                        left_avatar_id: leftAvatarId,
                        right_avatar_id: rightAvatarId,
                        join_type: JOIN_TYPES.INNER,
                        conditions: [],
                    },
                };
            }

            return update;
        }
    };

    addInitialAvatarOnMap = ({
        initialItem,
    }: {
        initialItem: DatasetSource | BaseSource | SourcePrototype;
    }) => {
        const update = this.shapeUpdateAddInitialAvatar(initialItem);

        return this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_ADD,
            update,
        });
    };

    addAvatarOnMap = ({
        leftItem,
        rightItem,
    }: {
        leftItem: DatasetSourceAvatar;
        rightItem: DatasetSource | SourcePrototype | FreeformSource;
    }) => {
        const update = this.shapeUpdateAddAvatar(leftItem, rightItem);

        return this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_ADD,
            update,
        });
    };

    deleteAvatar = ({id}: {id: string}) => {
        const update = {avatarId: id};

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_DELETE,
            update,
        });
    };

    updateRelation = ({relation}: {relation?: DatasetAvatarRelation} = {}) => {
        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.RELATION_UPDATE,
            update: {relation},
        });

        this.closeRelationDialog();
    };

    getRootAvatar = () => {
        const {avatars} = this.props;

        return avatars.find(({is_root: isRoot}) => isRoot);
    };

    addAvatar = (
        dragSource: DatasetSource | SourcePrototype | FreeformSource,
        dropSource?: DatasetSourceAvatar,
    ) => {
        const {avatars} = this.props;
        const {connection_id: connectionId} = dragSource;
        let update;

        if (connectionId && !dropSource) {
            if (avatars.length) {
                const rootAvatar = this.getRootAvatar();

                if (rootAvatar) {
                    update = this.addAvatarOnMap({
                        leftItem: rootAvatar,
                        rightItem: dragSource,
                    });
                }
            } else {
                update = this.addInitialAvatarOnMap({
                    initialItem: dragSource,
                });
            }
        } else if (dropSource) {
            update = this.addAvatarOnMap({
                leftItem: dropSource,
                rightItem: dragSource,
            });
        }

        return update;
    };

    onDrop = (
        dropSource: DatasetSourceAvatar,
        dragSource: DatasetSource | SourcePrototype | FreeformSource,
    ) => {
        this.addAvatar(dragSource, dropSource);
    };

    replaceSource = (dragSource: DatasetSource, dropAvatar: DatasetSourceAvatar) => {
        const update = {
            source: dragSource,
            avatar: dropAvatar,
        };

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.SOURCE_REPLACE,
            update,
        });
    };

    replaceConnection = async (
        connection: {id?: string},
        {entryId, isDelegated}: {entryId: string; isDelegated?: boolean},
    ) => {
        try {
            const newConnection = (await getSdk().sdk.us.getEntry({
                entryId,
                includePermissionsInfo: true,
            })) as ConnectionEntry;
            const update = {
                connection: connection as ConnectionEntryWithDelegation,
                newConnection: {...newConnection, isDelegated},
            };
            await this.updateDatasetConfig({
                type: DATASET_UPDATE_ACTIONS.CONNECTION_REPLACE,
                update,
                updatePreview: true,
            });
            this.clickConnection(entryId);
        } catch (error) {
            logger.logError('DatasetSources: replaceConnection failed', error);
            this._showToast({
                error,
                name: TOAST_TYPES.REPLACE_CONNECTION,
                title: i18n('dataset.notifications.view', 'toast_replace-connection-failure'),
            });
        }
    };

    openConnection = (connectionId?: string) => {
        if (connectionId) {
            const url = new URL(`/connections/${connectionId}`, window.location.origin);

            // open connection in readonly mode
            if (this.props.readonly && this.props.bindedWorkbookId) {
                url.searchParams.set(URL_QUERY.BINDED_WORKBOOK, this.props.bindedWorkbookId);
                url.searchParams.append(URL_QUERY.BINDED_DATASET, this.props.datasetId);
            } else if (this.props.workbookId && this.props.selectedConnection?.collectionId) {
                url.searchParams.set(URL_QUERY.BINDED_WORKBOOK, this.props.workbookId);
                url.searchParams.append(URL_QUERY.BINDED_DATASET, this.props.datasetId);
            } else if (this.props.collectionId && this.props.selectedConnection?.collectionId) {
                url.searchParams.set(URL_QUERY.BINDED_DATASET, this.props.datasetId);
            }

            window.open(url.pathname + url.search, '_blank', 'noopener');
        }
    };

    render() {
        const {
            ui,
            sdk,
            avatars,
            sources,
            relations,
            connections,
            options,
            selectedConnection,
            sourcePrototypes,
            freeformSources,
            sourceLoadingError,
            workbookId,
            collectionId,
            readonly,
            bindedWorkbookId,
        } = this.props;
        const {
            isVisibleSourceEditorDialog,
            isVisibleRelationDialog,
            isUpdating,
            source,
            relation,
            validRelation,
            isLoadingConnectionInfo,
        } = this.state;

        return (
            <DragAndDrop>
                <div className={b(null, 'dataset__tab')}>
                    <SplitPane
                        resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                        split="vertical"
                        minSize={SOURCES_PANEL_MIN_SIZE}
                        maxSize={SOURCES_PANEL_MAX_SIZE}
                        //This props not exist in interface, but it works
                        //@ts-ignore
                        pane1ClassName={b('sources-panel')}
                        pane2ClassName={b('relations-map-panel')}
                    >
                        <SelectSourcePrototypes
                            sdk={sdk}
                            isSourcesLoading={
                                ui.isSourcesLoading || ui.isSourcesListingOptionsLoading
                            }
                            isLoadingConnectionInfo={isLoadingConnectionInfo}
                            readonly={readonly}
                            bindedWorkbookId={bindedWorkbookId}
                            isDisabledAddSource={isUpdating}
                            isDisabledDropSource={this.isDisabledDropSource}
                            connections={connections}
                            selectedConnection={selectedConnection}
                            sourcePrototypes={sourcePrototypes}
                            freeformSources={freeformSources}
                            error={sourceLoadingError}
                            workbookId={workbookId}
                            collectionId={collectionId}
                            options={options}
                            onSelectConnection={this.selectConnection}
                            onClickConnection={this.clickConnection}
                            onClickConnectionDeleteButton={this.deleteConnection}
                            onClickEditSource={this.editSource}
                            onClickAddSource={this.addSource}
                            onDeleteSource={this.deleteSource}
                            openConnection={this.openConnection}
                            replaceConnection={this.replaceConnection}
                            getSources={this.retryToGetSources}
                        />
                        <RelationsMap
                            readonly={readonly}
                            avatars={avatars}
                            relations={relations}
                            relationsErrors={this.relationsErrors}
                            isDisabledDropSource={this.isDisabledDropSource}
                            onDrop={this.onDrop}
                            onDeleteAvatar={this.deleteAvatar}
                            openRelationDialog={this.openRelationDialog}
                            replaceSource={this.replaceSource}
                        />
                    </SplitPane>
                    {source && (
                        <SourceEditorDialog
                            source={source}
                            open={isVisibleSourceEditorDialog}
                            onClose={this.closeSourceEditorDialog}
                            onUpdate={this.updateSelectedSource}
                            onApply={this.saveSource}
                            onParamCreate={this.props.openDialogParameterCreate}
                            onParamEdit={this.props.openDialogParameterEdit}
                        />
                    )}
                    <RelationDialog
                        visible={isVisibleRelationDialog}
                        valid={validRelation}
                        avatars={avatars}
                        sources={sources}
                        relation={relation!}
                        options={options}
                        onClose={this.closeRelationDialog}
                        onSave={this.updateRelation}
                    />
                    {isUpdating && <Veil />}
                </div>
            </DragAndDrop>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    connections: connectionsSelector,
    componentErrors: componentErrorsSelector,
    sourcePrototypes: sortedSourcePrototypesSelector,
    sourceTemplate: sourceTemplateSelector,
    sources: filteredSourcesSelector,
    avatars: filteredSourceAvatarsSelector,
    relations: filteredRelationsSelector,
    sourceLoadingError: sourcesErrorSelector,
    selectedConnection: selectedConnectionSelector,
    options: optionsSelector,
    ui: UISelector,
    freeformSources: freeformSourcesSelector,
    sourcesPagination: sourcesPaginationSelector,
    currentDbName: currentDbNameSelector,
    datasetId: datasetIdSelector,
});
const mapDispatchToProps = {
    updateDatasetByValidation,
    getSources,
    addSource,
    updateSource,
    deleteSource,
    replaceSource,
    replaceConnection,
    addAvatar,
    deleteAvatar,
    addRelation,
    updateRelation,
    addConnection,
    deleteConnection,
    clickConnection,
    addAvatarPrototypes,
    toggleSaveDataset,
    showToast,
    openDialogParameterCreate,
    openDialogParameterEdit,
    resetSourcesPagination,
    getSourcesListingOptions,
};
const connector = connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true});

export default connector(DatasetSources);
