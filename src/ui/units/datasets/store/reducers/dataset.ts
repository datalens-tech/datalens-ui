import _has from 'lodash/has';
import _xorBy from 'lodash/xorBy';
import type {DatasetAvatarRelation, DatasetField, DatasetSource, DatasetSourceAvatar} from 'shared';
import {DatasetSDK} from 'ui';
import {v1 as uuidv1} from 'uuid';

import {DATASET_UPDATE_ACTIONS} from '../../constants';
import DatasetUtils from '../../helpers/utils';
import {
    ADD_AVATAR_PROTOTYPES,
    ADD_AVATAR_TEMPLATE,
    ADD_CONNECTION,
    ADD_FIELD,
    ADD_OBLIGATORY_FILTER,
    AVATAR_ADD,
    AVATAR_DELETE,
    BATCH_DELETE_FIELDS,
    BATCH_UPDATE_FIELDS,
    CHANGE_AMOUNT_PREVIEW_ROWS,
    CLEAR_PREVIEW,
    CLICK_CONNECTION,
    CLOSE_PREVIEW,
    CONNECTION_REPLACE,
    DATASET_FETCH_FAILURE,
    DATASET_FETCH_REQUEST,
    DATASET_FETCH_SUCCESS,
    DATASET_INITIAL_FETCH_FAILURE,
    DATASET_INITIAL_FETCH_REQUEST,
    DATASET_INITIAL_FETCH_SUCCESS,
    DATASET_SAVE_FAILURE,
    DATASET_SAVE_REQUEST,
    DATASET_SAVE_SUCCESS,
    DATASET_VALIDATE_FAILURE,
    DATASET_VALIDATE_REQUEST,
    DATASET_VALIDATE_SUCCESS,
    DELETE_CONNECTION,
    DELETE_FIELD,
    DELETE_OBLIGATORY_FILTER,
    DUPLICATE_FIELD,
    EDITOR_SET_FILTER,
    EDITOR_SET_ITEMS_TO_DISPLAY,
    FIELD_TYPES_FETCH_SUCCESS,
    INITIALIZE_DATASET,
    OPEN_PREVIEW,
    PREVIEW_DATASET_FETCH_FAILURE,
    PREVIEW_DATASET_FETCH_REQUEST,
    PREVIEW_DATASET_FETCH_SUCCESS,
    RELATION_ADD,
    RELATION_DELETE,
    RELATION_UPDATE,
    RENAME_DATASET,
    SET_ASIDE_HEADER_WIDTH,
    SET_DATASET_REVISION_MISMATCH,
    SET_EDIT_HISTORY_STATE,
    SET_FREEFORM_SOURCES,
    SET_INITIAL_SOURCES,
    SET_IS_DATASET_CHANGED_FLAG,
    SET_QUEUE_TO_LOAD_PREVIEW,
    SET_SOURCES_LOADING_ERROR,
    SOURCES_REFRESH,
    SOURCE_ADD,
    SOURCE_DELETE,
    SOURCE_REPLACE,
    SOURCE_UPDATE,
    TOGGLE_ALLOWANCE_SAVE,
    TOGGLE_FIELD_EDITOR_MODULE_LOADING,
    TOGGLE_LOAD_PREVIEW_BY_DEFAULT,
    TOGGLE_PREVIEW,
    TOGGLE_SOURCES_LOADER,
    TOGGLE_VIEW_PREVIEW,
    UPDATE_FIELD,
    UPDATE_OBLIGATORY_FILTER,
    UPDATE_RLS,
} from '../actions/types/dataset';
import {initialState} from '../constants';
import type {ConnectionEntry, DatasetReduxAction, DatasetReduxState, Update} from '../types';

import {
    getAvatarsAndRelationsToDelete,
    getFilteredSources,
    isSourceTypeConteinesInFreeformSources,
} from './utils';

const getGuidsMap = (fields: Partial<DatasetField>[]) =>
    fields.reduce<Record<string, Partial<DatasetField>>>((memo, field) => {
        const {guid} = field;

        if (guid) {
            memo[guid] = field;
        }

        return memo;
    }, {});

const updateFields = (
    state: DatasetReduxState,
    fields: Partial<DatasetField>[],
    ignoreMergeWithSchema?: boolean,
) => {
    const {
        updates,
        content: {result_schema: resultSchema},
    } = state;

    const updatesList: Update[] = fields.map((field) => ({
        action: DATASET_UPDATE_ACTIONS.FIELD_UPDATE as 'update_field',
        field,
    }));

    let resultSchemaNext: DatasetField[] = [];

    if (!ignoreMergeWithSchema) {
        const guidsMap = getGuidsMap(fields);

        resultSchemaNext = (resultSchema || []).map((currentField) => {
            const {guid: currentGuid} = currentField;
            const field = guidsMap[currentGuid];

            if (field) {
                return {
                    ...currentField,
                    ...field,
                };
            }

            return currentField;
        });
    }

    return {
        ...state,
        content: {
            ...state.content,
            result_schema: resultSchemaNext,
        },
        updates: [...updates, ...updatesList],
        ui: {
            ...state.ui,
            isDatasetChanged: true,
        },
    };
};

const deleteFields = (state: DatasetReduxState, fields: Partial<DatasetField>[]) => {
    const {
        updates,
        content: {result_schema: resultSchema},
    } = state;
    const guids = getGuidsMap(fields);

    const deleteUpdates: Update[] = [];
    const resultSchemaNext = (resultSchema || []).filter(({guid: currentGuid}) => {
        if (guids[currentGuid]) {
            deleteUpdates.push({
                action: DATASET_UPDATE_ACTIONS.FIELD_DELETE as 'delete_field',
                field: {
                    guid: currentGuid,
                },
            });
        }

        return !guids[currentGuid];
    });

    return {
        ...state,
        content: {
            ...state.content,
            result_schema: resultSchemaNext,
        },
        updates: [...updates, ...deleteUpdates],
    };
};

// eslint-disable-next-line complexity
export default (state: DatasetReduxState = initialState, action: DatasetReduxAction) => {
    switch (action.type) {
        case SET_FREEFORM_SOURCES: {
            const {freeformSources} = action.payload;
            return {...state, freeformSources};
        }
        case FIELD_TYPES_FETCH_SUCCESS: {
            const {types} = action.payload;

            return {
                ...state,
                types: {
                    ...state.types,
                    data: types,
                },
            };
        }
        case DATASET_FETCH_REQUEST: {
            return {
                ...state,
                error: null,
            };
        }
        case DATASET_FETCH_SUCCESS: {
            const {dataset, dataset: {id, connection, dataset: content} = {}} = action.payload;
            const {
                preview: {enabled: previewEnabled},
            } = dataset.options!;

            return {
                ...state,
                id,
                connection,
                content,
                prevContent: content,
                preview: {
                    ...state.preview,
                    isVisible: previewEnabled ? state.preview.isVisible : false,
                    previewEnabled,
                },
                ui: {
                    ...state.ui,
                    isDatasetChanged: false,
                },
                isLoading: false,
            };
        }
        case DATASET_FETCH_FAILURE: {
            const {error} = action.payload;

            return {
                ...state,
                error,
            };
        }
        case DATASET_INITIAL_FETCH_REQUEST: {
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        }
        case DATASET_INITIAL_FETCH_SUCCESS: {
            const {
                dataset: {
                    id,
                    is_favorite: isFavorite,
                    key,
                    connection,
                    options,
                    options: {
                        preview: {enabled: previewEnabled},
                    },
                    dataset: content,
                    workbook_id: workbookId,
                    permissions,
                },
            } = action.payload;

            return {
                ...state,
                id,
                key,
                isFavorite,
                workbookId,
                connection,
                content,
                prevContent: content,
                options,
                preview: {
                    ...state.preview,
                    previewEnabled,
                    isVisible: previewEnabled ? state.preview.isVisible : false,
                },
                ui: {
                    ...state.ui,
                    isDatasetChanged: false,
                },
                permissions,
                isLoading: false,
            };
        }
        case DATASET_INITIAL_FETCH_FAILURE: {
            const {error} = action.payload;

            return {
                ...state,
                isLoading: false,
                error,
            };
        }
        case DATASET_SAVE_REQUEST: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    savingError: null,
                },
                savingDataset: {
                    ...state.savingDataset,
                    isProcessingSavingDataset: true,
                },
            };
        }
        case DATASET_SAVE_SUCCESS: {
            return {
                ...state,
                savingDataset: {
                    ...state.savingDataset,
                    isProcessingSavingDataset: false,
                },
                ui: {
                    ...state.ui,
                    isDatasetChanged: false,
                },
            };
        }
        case DATASET_SAVE_FAILURE: {
            const {error} = action.payload;

            return {
                ...state,
                errors: {
                    ...state.errors,
                    savingError: error,
                },
                savingDataset: {
                    ...state.savingDataset,
                    isProcessingSavingDataset: false,
                },
            };
        }
        case DATASET_VALIDATE_REQUEST: {
            const {initial} = action.payload;

            if (initial) {
                return state;
            }

            return {
                ...state,
                validation: {
                    ...state.validation,
                    isLoading: true,
                    isPending: false,
                },
                ui: {
                    ...state.ui,
                    isDatasetChanged: true,
                },
            };
        }
        case DATASET_VALIDATE_SUCCESS: {
            const {
                validation: {
                    dataset: content,
                    options,
                    options: {
                        preview: {enabled: previewEnabled},
                    },
                },
            } = action.payload;

            return {
                ...state,
                content,
                prevContent: content,
                errors: {
                    ...state.errors,
                    validationError: null,
                },
                preview: {
                    ...state.preview,
                    isVisible: previewEnabled ? state.preview.isVisible : false,
                    previewEnabled,
                },
                validation: {
                    ...state.validation,
                    isLoading: false,
                },
                options,
                updates: [],
            };
        }
        case DATASET_VALIDATE_FAILURE: {
            const error = action.payload.error;
            const validation = error.details && error.details.data;

            if (error.status === 400 && _has(validation, 'dataset')) {
                const {options, dataset: content} = validation;

                return {
                    ...state,
                    content,
                    prevContent: content,
                    options,
                    errors: {
                        ...state.errors,
                        validationError: error,
                    },
                    validation: {
                        ...state.validation,
                        isLoading: false,
                    },
                    updates: [],
                };
            } else {
                return {
                    ...state,
                    errors: {
                        ...state.errors,
                        validationError: error,
                    },
                    validation: {
                        ...state.validation,
                        isLoading: false,
                    },
                    updates: [],
                };
            }
        }
        case PREVIEW_DATASET_FETCH_REQUEST: {
            return {
                ...state,
                errors: {
                    ...state.errors,
                    previewError: null,
                },
                preview: {
                    ...state.preview,
                    isLoading: true,
                    readyPreview: 'loading',
                    error: null,
                },
            };
        }
        case PREVIEW_DATASET_FETCH_SUCCESS: {
            const {data} = action.payload;

            return {
                ...state,
                preview: {
                    ...state.preview,
                    isLoading: false,
                    readyPreview: null,
                    data,
                },
            };
        }
        case PREVIEW_DATASET_FETCH_FAILURE: {
            const {error} = action.payload;

            return {
                ...state,
                errors: {
                    ...state.errors,
                    previewError: error,
                },
                preview: {
                    ...state.preview,
                    isLoading: false,
                    readyPreview: 'failed',
                },
            };
        }
        case SOURCE_ADD: {
            const {source} = action.payload;
            const {updates, content} = state;

            const sourceAddAction = {
                action: DATASET_UPDATE_ACTIONS.SOURCE_ADD,
                source,
            };

            const updatesNext = [...updates, sourceAddAction];

            return {
                ...state,
                content: {
                    ...content,
                    sources: [...content.sources!, source],
                },
                updates: updatesNext,
            };
        }
        case SOURCE_UPDATE: {
            const {source} = action.payload;
            const {
                updates,
                content,
                content: {sources, source_avatars: sourceAvatars},
            } = state;
            const {id: sourceId} = source;

            const sourcesNext = sources!.map((existedSource) => {
                const {id: existedSourceId} = existedSource;

                if (existedSourceId === sourceId) {
                    return {
                        ...existedSource,
                        ...source,
                    };
                } else {
                    return existedSource;
                }
            });

            const sourceUpdateAction = {
                action: DATASET_UPDATE_ACTIONS.SOURCE_UPDATE,
                source,
            };

            const updatesNext = [...updates, sourceUpdateAction];

            const relatedAvatars = sourceAvatars!.filter(
                ({source_id: currentSourceId}) => currentSourceId === sourceId,
            );

            if (relatedAvatars.length) {
                const {title: avatarTitle} = relatedAvatars[0];
                const {title} = source;

                if (avatarTitle !== title) {
                    const sourceUpdateActions = relatedAvatars.map(
                        (relatedAvatar): Update => ({
                            action: DATASET_UPDATE_ACTIONS.AVATAR_UPDATE as 'update_source_avatar',
                            source_avatar: {
                                ...relatedAvatar,
                                title,
                            },
                        }),
                    );

                    updatesNext.push(...sourceUpdateActions);
                }
            }

            return {
                ...state,
                content: {
                    ...content,
                    sources: sourcesNext,
                },
                updates: updatesNext,
            };
        }
        case SOURCE_DELETE: {
            const {sourceId} = action.payload;
            const {
                updates,
                content,
                content: {sources},
            } = state;

            const sourcesNext = (sources || []).filter(({id}) => id !== sourceId);

            const sourceDeleteAction = {
                action: DATASET_UPDATE_ACTIONS.SOURCE_DELETE,
                source: {
                    id: sourceId,
                },
            };

            return {
                ...state,
                content: {
                    ...content,
                    sources: sourcesNext,
                },
                updates: [...updates, sourceDeleteAction],
            };
        }
        case SOURCES_REFRESH: {
            const {
                updates,
                content: {sources},
            } = state;
            const updatesNext = [...updates];

            (sources || []).forEach((source) => {
                const {id: sourceId} = source;

                updatesNext.push({
                    action: DATASET_UPDATE_ACTIONS.SOURCE_REFRESH as 'refresh_source',
                    source: {
                        id: sourceId,
                    },
                });
            });

            return {
                ...state,
                updates: updatesNext,
            };
        }
        case SOURCE_REPLACE: {
            const {source, avatar} = action.payload;
            const {
                updates,
                content,
                content: {sources, source_avatars: sourceAvatars},
            } = state;
            const {id: targetSourceId} = source;
            const {id: targetAvatarId} = avatar;
            const updatesNext = [...updates];
            let sourcesNext = [...sources!],
                toSourceId = targetSourceId,
                sourceNext = source,
                replacedSourceId = '';

            if (!targetSourceId) {
                toSourceId = uuidv1();

                sourceNext = {
                    ...source,
                    id: source.id || toSourceId,
                };
                sourcesNext.push(sourceNext);

                const sourceAddAction: Update = {
                    action: DATASET_UPDATE_ACTIONS.SOURCE_ADD as 'add_source',
                    source: sourceNext,
                };
                updatesNext.push(sourceAddAction);
            }

            const title = DatasetUtils.getSourceTitle(sourceNext);
            const sourceAvatarsNext = sourceAvatars!.map((sourceAvatar) => {
                const {id} = sourceAvatar;

                if (id === targetAvatarId) {
                    const {source_id: sourceId} = sourceAvatar;

                    replacedSourceId = sourceId;

                    return {
                        ...sourceAvatar,
                        title,
                        source_id: toSourceId,
                    };
                }

                return sourceAvatar;
            });

            const avatarUpdateAction: Update = {
                action: DATASET_UPDATE_ACTIONS.AVATAR_UPDATE as 'update_source_avatar',
                source_avatar: {
                    ...avatar,
                    title,
                    source_id: toSourceId,
                },
            };
            updatesNext.push(avatarUpdateAction);

            const hasAvatarTargetSource = sourceAvatarsNext.find(
                ({source_id: sourceId}) => sourceId === replacedSourceId,
            );

            if (!hasAvatarTargetSource) {
                sourcesNext = sourcesNext.filter(({id}) => id !== replacedSourceId);

                const deleteSourceAction: Update = {
                    action: DATASET_UPDATE_ACTIONS.SOURCE_DELETE as 'delete_source',
                    source: {
                        id: replacedSourceId,
                    },
                };
                updatesNext.push(deleteSourceAction);
            }

            return {
                ...state,
                content: {
                    ...content,
                    sources: sourcesNext,
                    source_avatars: sourceAvatarsNext,
                },
                updates: updatesNext,
            };
        }
        case CONNECTION_REPLACE: {
            const {connection: {id: connectionId} = {}, newConnection = {entryId: undefined}} =
                action.payload;
            const {entryId: newConnectionId} = newConnection;
            const updates = [...state.updates];
            const selectedConnections = [...state.selectedConnections];

            const replacedConnectionIndex = selectedConnections.findIndex(
                ({entryId}) => entryId === connectionId,
            );
            selectedConnections.splice(
                replacedConnectionIndex,
                1,
                newConnection as ConnectionEntry,
            );

            const replaceConnectionAction: Update = {
                action: DATASET_UPDATE_ACTIONS.CONNECTION_REPLACE as 'replace_connection',
                connection: {
                    id: connectionId!,
                    new_id: newConnectionId!,
                },
            };
            updates.push(replaceConnectionAction);

            return {
                ...state,
                updates,
                selectedConnections,
                sourcePrototypes: [],
            };
        }
        case AVATAR_ADD: {
            const {avatar} = action.payload;
            const {updates, content} = state;

            const update = {
                action: DATASET_UPDATE_ACTIONS.AVATAR_ADD,
                source_avatar: avatar,
            };

            return {
                ...state,
                content: {
                    ...content,
                    source_avatars: [...content.source_avatars!, avatar],
                },
                updates: [...updates, update],
            };
        }
        case AVATAR_DELETE: {
            const {avatarId} = action.payload;
            const {updates, freeformSources} = state;
            const content = state.content as DatasetReduxState['content'];
            const sourceAvatars = content.source_avatars as DatasetSourceAvatar[];
            const avatarRelations = content.avatar_relations as DatasetAvatarRelation[];
            const updatesNext = [...updates];
            let sourcesNext = content.sources as DatasetSource[];
            const {source_id: sourceIdDeletedAvatar, is_root: isRoot} = sourceAvatars.find(
                ({id}) => id === avatarId,
            ) as DatasetSourceAvatar;

            const {avatarsToDelete, relationsToDelete} = getAvatarsAndRelationsToDelete(
                avatarId,
                avatarRelations,
            );
            const avatarsNext = sourceAvatars.filter(
                (avatar) => !avatarsToDelete.includes(avatar.id),
            );
            const avatarRelationsNext = avatarRelations.filter(
                (relation) => !relationsToDelete.includes(relation.id),
            );

            // The order of updates in updatesNext is important
            // If the removal of sources is added before the removal of links, then there will be 400 from the backup
            relationsToDelete.forEach((id) => {
                updatesNext.push({
                    action: 'delete_avatar_relation',
                    avatar_relation: {id},
                });
            });
            avatarsToDelete.forEach((id) => {
                updatesNext.push({
                    action: 'delete_source_avatar',
                    source_avatar: {id},
                });
            });

            const sourceBeingDeleted = sourcesNext.find(
                ({id}) => id === sourceIdDeletedAvatar,
            ) as DatasetSource;
            const sourceNotInInUse = !avatarsNext.some(
                ({source_id}) => source_id === sourceBeingDeleted.id,
            );
            const attemptToDeleteFreeformSource = isSourceTypeConteinesInFreeformSources(
                freeformSources,
                sourceBeingDeleted?.source_type,
            );

            if (sourceNotInInUse && !attemptToDeleteFreeformSource) {
                if (isRoot) {
                    const prevSourcesNext = [...sourcesNext];
                    sourcesNext = getFilteredSources(prevSourcesNext, freeformSources);
                    _xorBy(prevSourcesNext, sourcesNext).forEach(({id: sourceId}) => {
                        updatesNext.push({
                            action: 'delete_source',
                            source: {
                                id: sourceId,
                            },
                        });
                    });
                } else {
                    sourcesNext = sourcesNext.filter(({id}) => id !== sourceIdDeletedAvatar);

                    const sourceDeleteAction: Update = {
                        action: 'delete_source',
                        source: {
                            id: sourceBeingDeleted.id,
                        },
                    };

                    updatesNext.push(sourceDeleteAction);
                }
            }

            return {
                ...state,
                content: {
                    ...content,
                    avatar_relations: avatarRelationsNext,
                    sources: sourcesNext,
                    source_avatars: avatarsNext,
                },
                updates: updatesNext,
            };
        }
        case RELATION_ADD: {
            const {relation} = action.payload;
            const {
                updates,
                content,
                content: {avatar_relations: avatarRelations},
            } = state;

            let avatarRelationsNext = avatarRelations;

            if (relation) {
                avatarRelationsNext = [...avatarRelations!, relation];
            }

            const update = {
                action: DATASET_UPDATE_ACTIONS.RELATION_ADD,
                avatar_relation: relation,
            };

            return {
                ...state,
                content: {
                    ...content,
                    avatar_relations: avatarRelationsNext,
                },
                updates: [...updates, update],
            };
        }
        case RELATION_UPDATE: {
            const {relation, relation: {id: relationId} = {}} = action.payload;
            const {
                updates,
                content: {avatar_relations: avatarRelations},
            } = state;

            const updatedAvatarRelationIndex = avatarRelations!.findIndex(
                ({id}) => id === relationId,
            );

            avatarRelations!.splice(updatedAvatarRelationIndex, 1, relation);

            const update = {
                action: DATASET_UPDATE_ACTIONS.RELATION_UPDATE,
                avatar_relation: relation,
            };

            return {
                ...state,
                content: {
                    ...state.content,
                    avatar_relations: avatarRelations,
                },
                updates: [...updates, update],
            };
        }
        case RELATION_DELETE: {
            const {relationId} = action.payload;
            const {
                updates,
                content: {avatar_relations: avatarRelations},
            } = state;

            const avatarRelationsNext = avatarRelations!.filter(({id}) => id !== relationId);

            const update = {
                action: DATASET_UPDATE_ACTIONS.RELATION_DELETE,
                avatar_relation: {
                    id: relationId,
                },
            };

            return {
                ...state,
                content: {
                    ...state.content,
                    avatar_relations: avatarRelationsNext,
                },
                updates: [...updates, update],
            };
        }
        case ADD_OBLIGATORY_FILTER: {
            const {values, operation, fieldGuid} = action.payload.filter;
            const {updates} = state;

            const obligatoryFilterNext = {
                id: uuidv1(),
                field_guid: fieldGuid,
                default_filters: [
                    {
                        values,
                        operation,
                        column: fieldGuid,
                    },
                ],
            };

            const update = {
                action: DATASET_UPDATE_ACTIONS.OBLIGATORY_FILTER_ADD,
                obligatory_filter: obligatoryFilterNext,
            };

            return {
                ...state,
                updates: [...updates, update],
            };
        }
        case UPDATE_OBLIGATORY_FILTER: {
            const {values, operation, fieldGuid, filterId: id} = action.payload.filter;
            const {updates} = state;

            const updatedObligatoryFilter = {
                id,
                default_filters: [
                    {
                        values,
                        operation,
                        column: fieldGuid,
                    },
                ],
            };

            const update = {
                action: DATASET_UPDATE_ACTIONS.OBLIGATORY_FILTER_UPDATE,
                obligatory_filter: updatedObligatoryFilter,
            };

            return {
                ...state,
                updates: [...updates, update],
            };
        }
        case DELETE_OBLIGATORY_FILTER: {
            const {id} = action.payload;
            const {updates} = state;

            const update = {
                action: DATASET_UPDATE_ACTIONS.OBLIGATORY_FILTER_DELETE,
                obligatory_filter: {id},
            };

            return {
                ...state,
                updates: [...updates, update],
            };
        }
        case INITIALIZE_DATASET: {
            return {
                ...state,
                isLoading: false,
                error: null,
                preview: {
                    ...state.preview,
                    isLoading: false,
                    readyPreview: null,
                },
            };
        }
        case CLEAR_PREVIEW: {
            return {
                ...state,
                preview: {
                    ...state.preview,
                    isLoading: false,
                    readyPreview: null,
                    data: {},
                },
            };
        }
        case TOGGLE_ALLOWANCE_SAVE: {
            const {enable, validationPending} = action.payload;

            return {
                ...state,
                savingDataset: {
                    ...state.savingDataset,
                    disabled: !enable,
                },
                validation: {
                    ...state.validation,
                    ...(typeof validationPending === 'boolean' && {isPending: validationPending}),
                },
            };
        }
        case CHANGE_AMOUNT_PREVIEW_ROWS: {
            const {amountPreviewRows} = action.payload;

            return {
                ...state,
                preview: {
                    ...state.preview,
                    amountPreviewRows,
                },
            };
        }
        case OPEN_PREVIEW: {
            return {
                ...state,
                preview: {
                    ...state.preview,
                    isVisible: true,
                },
            };
        }
        case CLOSE_PREVIEW: {
            return {
                ...state,
                preview: {
                    ...state.preview,
                    isVisible: false,
                },
            };
        }
        case TOGGLE_PREVIEW: {
            return {
                ...state,
                preview: {
                    ...state.preview,
                    isVisible: !state.preview.isVisible,
                },
            };
        }
        case TOGGLE_VIEW_PREVIEW: {
            const {view} = action.payload;

            return {
                ...state,
                preview: {
                    ...state.preview,
                    view,
                },
            };
        }
        case SET_QUEUE_TO_LOAD_PREVIEW: {
            return {
                ...state,
                preview: {
                    ...state.preview,
                    isQueued: action.payload.enable,
                },
            };
        }
        case TOGGLE_LOAD_PREVIEW_BY_DEFAULT: {
            return {
                ...state,
                content: {
                    ...state.content,
                    load_preview_by_default: action.payload.enable,
                },
            };
        }
        case ADD_FIELD: {
            const {field, ignoreMergeWithSchema} = action.payload;
            const {
                updates,
                content: {result_schema: resultSchema},
            } = state;

            const fieldNext = {
                valid: true,
                ...field,
            };

            const resultSchemaNext = ignoreMergeWithSchema
                ? resultSchema || []
                : [fieldNext, ...(resultSchema || [])];
            const update = {
                action: DATASET_UPDATE_ACTIONS.FIELD_ADD,
                order_index: 0,
                field: fieldNext,
            };

            return {
                ...state,
                content: {
                    ...state.content,
                    result_schema: resultSchemaNext,
                },
                updates: [...updates, update],
            };
        }
        case DUPLICATE_FIELD: {
            const {field} = action.payload;
            const {
                updates,
                content: {result_schema: resultSchema},
            } = state;

            const {fieldNext, fieldsNext} = DatasetSDK.duplicateField({
                field,
                fields: resultSchema,
            }) as {
                fieldNext: DatasetField;
                fieldsNext: DatasetField[];
            };
            const {guid: newFieldGuid} = fieldNext;

            const orderIndex = fieldsNext.findIndex(({guid}) => guid === newFieldGuid);

            const resultSchemaNext = fieldsNext;
            const update = {
                action: DATASET_UPDATE_ACTIONS.FIELD_ADD,
                order_index: orderIndex,
                field: fieldNext,
            };

            return {
                ...state,
                content: {
                    ...state.content,
                    result_schema: resultSchemaNext,
                },
                updates: [...updates, update],
            };
        }
        case BATCH_DELETE_FIELDS: {
            const {fields} = action.payload;

            return deleteFields(state, fields);
        }
        case DELETE_FIELD: {
            const {field} = action.payload;

            return deleteFields(state, [field]);
        }
        case UPDATE_FIELD: {
            const {field, ignoreMergeWithSchema} = action.payload;

            return updateFields(state, [field], ignoreMergeWithSchema);
        }
        case BATCH_UPDATE_FIELDS: {
            const {fields, ignoreMergeWithSchema} = action.payload;

            return updateFields(state, fields, ignoreMergeWithSchema);
        }
        case UPDATE_RLS: {
            const {rls} = action.payload;
            const {content} = state;

            return {
                ...state,
                content: {
                    ...content,
                    rls: {
                        ...content.rls,
                        ...rls,
                    },
                },
            };
        }
        case SET_IS_DATASET_CHANGED_FLAG: {
            const {isDatasetChanged} = action.payload;

            return {
                ...state,
                ui: {
                    ...state.ui,
                    isDatasetChanged,
                },
            };
        }
        case SET_INITIAL_SOURCES: {
            const {
                selectedConnections,
                selectedConnection: {entryId: selectedConnectionId},
            } = action.payload;

            return {
                ...state,
                selectedConnections,
                ui: {
                    ...state.ui,
                    selectedConnectionId,
                },
            };
        }
        case CLICK_CONNECTION: {
            const {connectionId} = action.payload;
            const {ui} = state;

            return {
                ...state,
                ui: {
                    ...ui,
                    selectedConnectionId: connectionId,
                },
            };
        }
        case ADD_CONNECTION: {
            const {connection} = action.payload;
            const {selectedConnections} = state;

            return {
                ...state,
                selectedConnections: [...selectedConnections, connection],
            };
        }
        case DELETE_CONNECTION: {
            const {connectionId} = action.payload;
            const {selectedConnections, sourcePrototypes, ui: {selectedConnectionId} = {}} = state;

            let sourcePrototypesNext = sourcePrototypes;
            let selectedConnectionIdNext = selectedConnectionId;

            if (selectedConnectionId === connectionId) {
                sourcePrototypesNext = [];
                selectedConnectionIdNext = null;
            }

            const selectedConnectionsNext = selectedConnections.filter(({id, entryId}) => {
                const existedConnectionId = id || entryId;

                return existedConnectionId !== connectionId;
            });

            return {
                ...state,
                sourcePrototypes: sourcePrototypesNext,
                selectedConnections: selectedConnectionsNext,
                ui: {
                    ...state.ui,
                    selectedConnectionId: selectedConnectionIdNext,
                },
            };
        }
        case ADD_AVATAR_PROTOTYPES: {
            const {list, templates: sourceTemplate} = action.payload;

            return {
                ...state,
                sourceTemplate,
                sourcePrototypes: list,
            };
        }
        case ADD_AVATAR_TEMPLATE: {
            const {template} = action.payload;

            return {
                ...state,
                sourceTemplate: template,
            };
        }
        case TOGGLE_FIELD_EDITOR_MODULE_LOADING: {
            const {isLoading} = action.payload;

            return {
                ...state,
                ui: {
                    ...state.ui,
                    isFieldEditorModuleLoading: isLoading,
                },
            };
        }
        case SET_ASIDE_HEADER_WIDTH: {
            const {width} = action.payload;

            return {
                ...state,
                ui: {
                    ...state.ui,
                    asideHeaderWidth: width,
                },
            };
        }
        case TOGGLE_SOURCES_LOADER: {
            const {isSourcesLoading} = action.payload;

            return {
                ...state,
                ui: {
                    ...state.ui,
                    isSourcesLoading,
                },
            };
        }
        case SET_SOURCES_LOADING_ERROR: {
            const {error} = action.payload;

            return {
                ...state,
                errors: {
                    ...state.errors,
                    sourceLoadingError: error,
                },
            };
        }
        case SET_DATASET_REVISION_MISMATCH: {
            return {
                ...state,
                isDatasetRevisionMismatch: true,
            };
        }
        case EDITOR_SET_FILTER: {
            const {filter} = action.payload;
            return {
                ...state,
                editor: {
                    ...state.editor,
                    filter,
                },
            };
        }
        case EDITOR_SET_ITEMS_TO_DISPLAY: {
            const {itemsToDisplay} = action.payload;
            return {
                ...state,
                editor: {
                    ...state.editor,
                    itemsToDisplay,
                },
            };
        }
        case RENAME_DATASET: {
            return {
                ...state,
                key: action.payload,
            };
        }
        case SET_EDIT_HISTORY_STATE: {
            return action.payload.state;
        }
        default: {
            return state;
        }
    }
};
