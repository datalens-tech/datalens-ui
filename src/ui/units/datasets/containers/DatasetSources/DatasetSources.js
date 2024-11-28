import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import SplitPane from 'react-split-pane';
import {compose} from 'recompose';
import {createStructuredSelector} from 'reselect';
import {showToast} from 'store/actions/toaster';
import {SPLIT_PANE_RESIZER_CLASSNAME} from 'ui';
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
    replaceConnection,
    replaceSource,
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
import Veil from '../../components/Veil/Veil';
import {ComponentErrorType, DATASET_UPDATE_ACTIONS, JOIN_TYPES, TOAST_TYPES} from '../../constants';
import {getComponentErrorsByType} from '../../helpers/datasets';
import DatasetUtils from '../../helpers/utils';
import {
    UISelector,
    componentErrorsSelector,
    connectionsSelector,
    filteredRelationsSelector,
    filteredSourceAvatarsSelector,
    filteredSourcesSelector,
    freeformSourcesSelector,
    optionsSelector,
    selectedConnectionSelector,
    sourcePrototypesSelector,
    sourceTemplateSelector,
    sourcesErrorSelector,
} from '../../store/selectors';

import './DatasetSources.scss';

const b = block('dataset-sources');
const SOURCES_PANEL_MIN_SIZE = 256;
const SOURCES_PANEL_MAX_SIZE = 512;

class DatasetSources extends React.Component {
    state = {
        connectionId: null,
        dragSource: null,
        dropSource: null,
        relation: null,
        source: null,
        validRelation: true,
        isUpdating: false,
        isVisibleSourceEditorDialog: false,
        isVisibleRelationDialog: false,
    };

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    isUnmounted = false;

    get relationsErrors() {
        return getComponentErrorsByType(
            this.props.componentErrors,
            ComponentErrorType.AvatarRelation,
        );
    }

    get isDisabledDropSource() {
        const {
            options: {source_avatars: {max, items = []} = {}},
        } = this.props;

        return items.length >= max;
    }

    _showToast = ({name, title, error}) => {
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

    updateSelectedSource = (source) => {
        this.setState({source});
    };

    openSourceEditorDialog = (source) => {
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

    editSource = (source) => {
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

    openRelationDialog = ({relationId}) => {
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

    saveSource = (source) => {
        const {id: sourceId} = source;
        let nextUpdate;

        if (sourceId) {
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

    deleteSource = ({id}) => {
        const update = {sourceId: id};

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.SOURCE_DELETE,
            update,
        });
    };

    addAvatarOnMapAutoIfNeeds = (preparedSources = []) => {
        const {avatars, freeformSources, sourceLoadingError} = this.props;
        const isNeededToAddNewSource =
            freeformSources.length && !preparedSources.length && !sourceLoadingError;
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

    selectConnection = async ({entryId}) => {
        try {
            const connection = await getSdk().us.getEntry({entryId});

            this.props.addConnection({connection});

            this.clickConnection(entryId);
        } catch (error) {
            logger.logError('DatasetSources: selectConnection failed', error);
            this._showToast({
                error,
                name: TOAST_TYPES.SELECT_CONNECTION,
                title: i18n('dataset.notifications.view', 'toast_select-connection-failure'),
            });
        }
    };

    clickConnection = (connectionId) => {
        const {sourcePrototypes, selectedConnection: {entryId: selectedConnId} = {}} = this.props;

        if (connectionId === selectedConnId) {
            return sourcePrototypes;
        }

        this.props.clickConnection({connectionId});

        return this.props.getSources(connectionId, this.props.workbookId);
    };

    deleteConnection = ({connectionId}) => {
        const {connections, selectedConnection: {entryId: selectedConnId} = {}} = this.props;
        const selectedConnDeleted = connectionId === selectedConnId;
        const nextConn = connections.find(({entryId}) => entryId !== connectionId);

        this.props.deleteConnection({connectionId});

        if (selectedConnDeleted && nextConn) {
            this.clickConnection(nextConn.entryId);
        }
    };

    retryToGetSources = () => {
        const {selectedConnection: {entryId} = {}} = this.props;

        if (!entryId) {
            return;
        }

        this.props.getSources(entryId, this.props.workbookId);
    };

    updateDatasetByValidation = (data) => {
        this.setState({isUpdating: true});

        return this.props.updateDatasetByValidation(data).finally(() => {
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
        // eslint-disable-next-line consistent-return
    }) => {
        this.props.toggleSaveDataset({enable: !validateEnabled});

        switch (type) {
            case DATASET_UPDATE_ACTIONS.AVATAR_ADD: {
                const {source, avatar, relation} = update;

                if (source) {
                    this.props.addSource({source});
                }

                this.props.addAvatar({avatar});

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

                this.props.deleteAvatar({avatarId});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.RELATION_UPDATE: {
                const {relation} = update;

                this.props.updateRelation({relation});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_ADD: {
                const {source} = update;

                this.props.addSource({source});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_REPLACE: {
                const {source, avatar} = update;

                this.props.replaceSource({
                    source,
                    avatar,
                });

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.CONNECTION_REPLACE: {
                const {connection, newConnection} = update;

                this.props.replaceConnection({
                    connection,
                    newConnection,
                });

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_UPDATE: {
                const {source} = update;

                this.props.updateSource({source});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
            case DATASET_UPDATE_ACTIONS.SOURCE_DELETE: {
                const {sourceId} = update;

                this.props.deleteSource({sourceId});

                return this.updateDatasetByValidation({
                    updatePreview,
                    validateEnabled,
                });
            }
        }
    };

    getExistedSource = (source) => {
        const {sources} = this.props;
        const {parameter_hash: parameterHash} = source;

        return sources.find(({parameter_hash: hash}) => hash === parameterHash);
    };

    shapeUpdateAddInitialAvatar = (initialItem) => {
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
                },
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
                },
            };
        }

        return update;
    };

    formAvatarTitle = (source) => {
        const {avatars} = this.props;

        return DatasetUtils.formAvatarTitle({
            avatars,
            source,
        });
    };

    shapeUpdateAddAvatar = (leftItem, rightItem) => {
        const {id: leftAvatarId} = leftItem;
        const {id: rightItemId} = rightItem;

        const rightAvatarId = uuidv1();
        const relationId = uuidv1();
        let update = {};

        const title = this.formAvatarTitle(rightItem);

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

    addInitialAvatarOnMap = ({initialItem}) => {
        const update = this.shapeUpdateAddInitialAvatar(initialItem);

        return this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_ADD,
            update,
        });
    };

    addAvatarOnMap = ({leftItem, rightItem}) => {
        const update = this.shapeUpdateAddAvatar(leftItem, rightItem);

        return this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_ADD,
            update,
        });
    };

    deleteAvatar = ({id}) => {
        const update = {avatarId: id};

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.AVATAR_DELETE,
            update,
        });
    };

    updateRelation = ({relation} = {}) => {
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

    addAvatar = (dragSource, dropSource) => {
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

    onDrop = (dropSource, dragSource) => {
        this.addAvatar(dragSource, dropSource);
    };

    replaceSource = (dragSource, dropAvatar) => {
        const update = {
            source: dragSource,
            avatar: dropAvatar,
        };

        this.updateDatasetConfig({
            type: DATASET_UPDATE_ACTIONS.SOURCE_REPLACE,
            update,
        });
    };

    replaceConnection = async (connection, {entryId}) => {
        try {
            const newConnection = await getSdk().us.getEntry({entryId});

            const update = {connection, newConnection};
            this.updateDatasetConfig({
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

    openConnection = (connectionId) => {
        if (connectionId) {
            // eslint-disable-next-line
            window.open(`/connections/${connectionId}`, '_blank', 'noopener');
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
            sourceTemplate,
            freeformSources,
            sourceLoadingError,
            workbookId,
        } = this.props;
        const {
            isVisibleSourceEditorDialog,
            isVisibleRelationDialog,
            isUpdating,
            source,
            relation,
            validRelation,
        } = this.state;

        return (
            <DragAndDrop>
                <div className={b(null, 'dataset__tab')}>
                    <SplitPane
                        resizerClassName={SPLIT_PANE_RESIZER_CLASSNAME}
                        split="vertical"
                        minSize={SOURCES_PANEL_MIN_SIZE}
                        maxSize={SOURCES_PANEL_MAX_SIZE}
                        pane1ClassName={b('sources-panel')}
                        pane2ClassName={b('relations-map-panel')}
                    >
                        <SelectSourcePrototypes
                            sdk={sdk}
                            isSourcesLoading={ui.isSourcesLoading}
                            isDisabledAddSource={isUpdating}
                            isDisabledDropSource={this.isDisabledDropSource}
                            connections={connections}
                            selectedConnection={selectedConnection}
                            sourcePrototypes={sourcePrototypes}
                            sourceTemplate={sourceTemplate}
                            freeformSources={freeformSources}
                            error={sourceLoadingError}
                            workbookId={workbookId}
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
                            progress={isUpdating}
                            onClose={this.closeSourceEditorDialog}
                            onUpdate={this.updateSelectedSource}
                            onApply={this.saveSource}
                        />
                    )}
                    <RelationDialog
                        visible={isVisibleRelationDialog}
                        valid={validRelation}
                        avatars={avatars}
                        sources={sources}
                        relation={relation}
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

DatasetSources.propTypes = {
    sdk: PropTypes.object.isRequired,
    connections: PropTypes.array.isRequired,
    componentErrors: PropTypes.object.isRequired,
    getSources: PropTypes.func.isRequired,
    addSource: PropTypes.func.isRequired,
    updateSource: PropTypes.func.isRequired,
    replaceSource: PropTypes.func.isRequired,
    replaceConnection: PropTypes.func.isRequired,
    addAvatar: PropTypes.func.isRequired,
    addRelation: PropTypes.func.isRequired,
    deleteAvatar: PropTypes.func.isRequired,
    deleteConnection: PropTypes.func.isRequired,
    deleteSource: PropTypes.func.isRequired,
    updateRelation: PropTypes.func.isRequired,
    addConnection: PropTypes.func.isRequired,
    updateDatasetByValidation: PropTypes.func.isRequired,
    clickConnection: PropTypes.func.isRequired,
    addAvatarPrototypes: PropTypes.func.isRequired,
    toggleSaveDataset: PropTypes.func.isRequired,
    ui: PropTypes.object.isRequired,
    freeformSources: PropTypes.array.isRequired,
    avatars: PropTypes.array,
    sources: PropTypes.array,
    sourcePrototypes: PropTypes.array,
    sourceTemplate: PropTypes.object,
    relations: PropTypes.array,
    sourceLoadingError: PropTypes.object,
    selectedConnection: PropTypes.object,
    options: PropTypes.object,
    showToast: PropTypes.func.isRequired,
    workbookId: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
    connections: connectionsSelector,
    componentErrors: componentErrorsSelector,
    sourcePrototypes: sourcePrototypesSelector,
    sourceTemplate: sourceTemplateSelector,
    sources: filteredSourcesSelector,
    avatars: filteredSourceAvatarsSelector,
    relations: filteredRelationsSelector,
    sourceLoadingError: sourcesErrorSelector,
    selectedConnection: selectedConnectionSelector,
    options: optionsSelector,
    ui: UISelector,
    freeformSources: freeformSourcesSelector,
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
};

export default compose(connect(mapStateToProps, mapDispatchToProps, null, {forwardRef: true}))(
    DatasetSources,
);
