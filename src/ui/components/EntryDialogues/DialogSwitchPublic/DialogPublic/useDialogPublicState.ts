import React from 'react';

import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {isValidPublishLink} from 'shared/schema/mix/helpers/validation';
import {showToast} from 'store/actions/toaster';
import type {DataLensApiError} from 'typings';
import {CounterName, GoalId, reachMetricaGoal} from 'ui/libs/metrica';
import {groupEntitiesByScope} from 'ui/utils/helpers';
import Utils from 'utils';

import {useRefMounted} from '../../../../hooks/useRefMounted';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';

import {DIALOG_STATUS} from './constants';
import {getTextNoPermission} from './helpers';
import type {
    Action,
    DialogPublicCloseCallback,
    EntryData,
    EntryDataExtended,
    EntryRelation,
    EntryRelationExtended,
    EntryUnversionedData,
    State,
} from './types';
import {
    DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR,
    DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES,
    DIALOG_PUBLIC_CHANGE_STATE,
    DIALOG_PUBLIC_SET_APPLY,
    DIALOG_PUBLIC_SET_FAILED,
    DIALOG_PUBLIC_SET_LOADING,
    DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE,
    DIALOG_PUBLIC_SET_REFETCH,
    DIALOG_PUBLIC_SET_SUCCESS,
} from './types';

function formGroups(
    normalizedRelations: Record<string, EntryRelationExtended>,
): Record<string, EntryRelationExtended[]> {
    const relationsArray = Object.values(normalizedRelations);

    return groupEntitiesByScope(relationsArray);
}

function isPermanentDisabledEntry(entry: EntryRelation) {
    return !entry?.permissions?.admin || Boolean(entry.lockPublication);
}

function normalizeRelations(relations: Array<EntryRelation>, entry: EntryData) {
    let allDisabled = !entry?.permissions?.admin;
    const currentEntryChecked = entry.public;
    const someEntryLocked = relations.some(({lockPublication}) => Boolean(lockPublication));

    const normalized = relations.reduce(
        (acc, relationEntry) => {
            let tooltip = '';
            const hasAdminPermission = relationEntry?.permissions?.admin;
            const checked = relationEntry.public;
            const disabled =
                isPermanentDisabledEntry(relationEntry) ||
                // We do not allow you to publish anything if there is an invalid dataset
                // CHARTS-3401
                (someEntryLocked && !checked);
            if (!currentEntryChecked && disabled) {
                allDisabled = true;
            }
            if (relationEntry.lockPublication) {
                tooltip =
                    relationEntry.lockPublicationReason ||
                    i18n('component.dialog-switch-public.view', 'label_dataset-deny-publish');
            }
            if (!hasAdminPermission) {
                tooltip = getTextNoPermission();
            }
            return {
                ...acc,
                [relationEntry.entryId]: {
                    ...relationEntry,
                    tooltip,
                    checked,
                    disabled,
                } as EntryRelationExtended,
            };
        },
        {} as Record<string, EntryRelationExtended>,
    );

    if (allDisabled) {
        return Object.keys(normalized).reduce(
            (acc, entryId) => {
                return {
                    ...acc,
                    [entryId]: {
                        ...normalized[entryId],
                        disabled: true,
                    } as EntryRelationExtended,
                };
            },
            {} as Record<string, EntryRelationExtended>,
        );
    }

    return normalized;
}

function getCurrentEntryDisabled(
    entry: EntryData,
    normalizedRelations: Record<string, EntryRelationExtended>,
) {
    if (!entry?.permissions?.admin) {
        return {
            currentEntryDisabled: true,
            currentEntryTooltip: getTextNoPermission(),
        };
    }
    if (Object.values(normalizedRelations).some(({disabled}) => disabled)) {
        return {
            currentEntryDisabled: !entry.public,
            currentEntryTooltip: i18n(
                'component.dialog-switch-public.view',
                'label_some-entries-not-ready',
            ),
            hasLockedEntries: true,
        };
    }
    return {
        currentEntryDisabled: false,
        currentEntryTooltip: '',
    };
}

function hasPublishChanges(state: State) {
    const {entry, relations, currentEntryChecked} = state;
    if (entry.public !== currentEntryChecked) {
        return true;
    }
    return Object.values(relations).some((entry) => {
        return entry.public !== entry.checked;
    });
}

function hasAuthorChanges(state: State) {
    const {entry} = state;
    const entryAuthorData = (entry?.unversionedData as EntryUnversionedData)?.publicAuthor || {
        link: '',
        text: '',
    };

    return (
        entryAuthorData.link !== state.entryAuthor.link.trim() ||
        entryAuthorData.text !== state.entryAuthor.text.trim()
    );
}

function getPublicationEntries(state: State) {
    const {entry, currentEntryChecked, relations} = state;
    // maybe side effect, always need main entry
    const entries = [
        {
            entryId: entry.entryId,
            scope: entry.scope,
            publish: currentEntryChecked,
        },
    ];
    Object.values(relations).forEach((relationEntry) => {
        if (relationEntry.public !== relationEntry.checked) {
            entries.push({
                entryId: relationEntry.entryId,
                scope: relationEntry.scope,
                publish: Boolean(relationEntry.checked),
            });
        }
    });
    return entries;
}

function isValid(state: State) {
    return Object.entries(state.validationErrors).every(([_, value]) => value === null);
}

const getInitialState = (data: Partial<State>): State => {
    const entryAuthorData = (data.entry?.unversionedData as EntryUnversionedData)?.publicAuthor || {
        link: '',
        text: '',
    };

    return {
        ...data,
        onClose: data.onClose!,
        entry: data.entry!,
        status: DIALOG_STATUS.LOADING,
        progress: false,
        refetchCounter: 0,
        applyCounter: 0,
        currentEntryChecked: Boolean(data.entry?.public),
        relations: {},
        groups: {},
        onceChangePublish: false,
        onceChangeUnpublish: false,
        currentEntryDisabled: true,
        currentEntryTooltip: '',
        entryAuthor: {
            link: entryAuthorData?.link || '',
            text: entryAuthorData?.text || '',
        },
        validationErrors: {
            link: null,
            text: null,
        },
        error: {
            title: '',
        },
        hasLockedEntries: false,
    };
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case DIALOG_PUBLIC_SET_LOADING:
            return {
                ...state,
                status: DIALOG_STATUS.LOADING,
                progress: true,
                error: {
                    title: '',
                },
            };
        case DIALOG_PUBLIC_SET_SUCCESS:
            return {
                ...state,
                status: DIALOG_STATUS.SUCCESS,
                progress: false,
            };
        case DIALOG_PUBLIC_SET_FAILED:
            return {
                ...state,
                status: DIALOG_STATUS.FAILED,
                progress: false,
                error: action.payload?.error || {title: ''},
            };
        case DIALOG_PUBLIC_SET_REFETCH:
            return {
                ...getInitialState(state),
                refetchCounter: state.refetchCounter + 1,
            };
        case DIALOG_PUBLIC_SET_APPLY: {
            return {
                ...state,
                applyCounter: state.applyCounter + 1,
            };
        }
        case DIALOG_PUBLIC_CHANGE_STATE:
            return {
                ...state,
                ...action.payload,
            };
        case DIALOG_PUBLIC_SET_PUBLISH_UNPUBLISH_ONCE: {
            let relations = state.relations;
            let groups = state.groups;
            const nextChecked = !state.currentEntryChecked;
            let needUpdate = false;
            const relationsCandidate = Object.keys(relations).reduce((acc, entryId) => {
                let entry = relations[entryId];
                if (!entry.disabled && entry.checked !== nextChecked) {
                    needUpdate = true;
                    entry = {
                        ...entry,
                        checked: nextChecked,
                    };
                }
                return {
                    ...acc,
                    [entryId]: entry,
                };
            }, {});
            if (needUpdate) {
                relations = relationsCandidate;
                groups = formGroups(relationsCandidate);
            }
            return {
                ...state,
                relations,
                groups,
                currentEntryChecked: nextChecked,
                ...action.payload,
            };
        }
        case DIALOG_PUBLIC_CHANGE_RELATIONS_ENTRIES: {
            const {relations, nextChecked, ...restState} = action.payload;
            const newRelations = relations
                .map(({entryId}) => entryId)
                .reduce((acc, entryId) => {
                    return {
                        ...acc,
                        [entryId]: {
                            ...state.relations[entryId],
                            checked: nextChecked,
                        },
                    };
                }, {});
            const newStateRelations = {
                ...state.relations,
                ...newRelations,
            };
            return {
                ...state,
                relations: newStateRelations,
                groups: formGroups(newStateRelations),
                ...restState,
            };
        }
        case DIALOG_PUBLIC_CHANGE_ENTRY_AUTHOR: {
            const entryAuthor = {
                ...state.entryAuthor,
            };
            const validationErrors = {
                ...state.validationErrors,
            };

            if (action.payload.link !== undefined) {
                entryAuthor.link = action.payload.link;

                if (isValidPublishLink(entryAuthor.link)) {
                    validationErrors.link = null;
                } else {
                    validationErrors.link = i18n(
                        'component.dialog-switch-public.view',
                        'label_author-link-error',
                    );
                }
            }
            if (action.payload.text !== undefined) {
                entryAuthor.text = action.payload.text;
            }

            return {
                ...state,
                validationErrors,
                entryAuthor,
            };
        }
        default:
            return state;
    }
};

export const useDialogPublicState = ({
    entry: propsEntry,
    onClose,
}: {
    entry: EntryData;
    onClose: DialogPublicCloseCallback;
}) => {
    const refMounted = useRefMounted();
    const [state, dispatch] = React.useReducer(
        reducer,
        getInitialState({
            entry: {
                ...propsEntry,
                tooltip: '',
                disabled: false,
            },
            onClose,
        }),
    );
    const dispatchStore = useDispatch();

    React.useEffect(() => {
        async function init() {
            dispatch({type: DIALOG_PUBLIC_SET_LOADING});
            try {
                const entry = await getSdk().sdk.us.getEntry({
                    entryId: propsEntry.entryId,
                    includePermissionsInfo: true,
                    includeDlComponentUiData: true,
                });
                const relations = await getSdk().sdk.mix.getPublicationPreview({
                    entryId: entry.entryId,
                    workbookId: entry.workbookId,
                });

                const extendedEntry: EntryDataExtended = {
                    ...entry,
                    tooltip: '',
                    disabled: false,
                };

                if (refMounted.current) {
                    const normalizedRelations = normalizeRelations(relations, extendedEntry);
                    const {currentEntryDisabled, currentEntryTooltip, hasLockedEntries} =
                        getCurrentEntryDisabled(extendedEntry, normalizedRelations);
                    const entryAuthor = {text: '', link: ''};
                    if (entry.unversionedData) {
                        const unversionedData = entry.unversionedData as {
                            publicAuthor?: {text: string; link: string};
                        };
                        if (unversionedData.publicAuthor) {
                            entryAuthor.text = unversionedData.publicAuthor.text;
                            entryAuthor.link = unversionedData.publicAuthor.link;
                        }
                    }

                    dispatch({
                        type: DIALOG_PUBLIC_CHANGE_STATE,
                        payload: {
                            ...state,
                            status: DIALOG_STATUS.SUCCESS,
                            entry: extendedEntry,
                            currentEntryChecked: entry.public,
                            relations: normalizedRelations,
                            groups: formGroups(normalizedRelations),
                            progress: false,
                            currentEntryDisabled,
                            currentEntryTooltip,
                            entryAuthor,
                            hasLockedEntries: Boolean(hasLockedEntries),
                        },
                    });
                }
            } catch (error: unknown) {
                logger.logError('DialogSwitchPublic: init failed', error as Error);
                if (refMounted.current) {
                    const apiError = error as DataLensApiError;
                    const errorAction: Action = {
                        type: DIALOG_PUBLIC_SET_FAILED,
                    };

                    const parsedDetails = Utils.getErrorDetails(apiError);
                    const errorDetails = parsedDetails?.details as
                        | Record<string, string>
                        | undefined;

                    if (errorDetails?.title) {
                        errorAction.payload = {
                            error: {
                                title: errorDetails.title,
                                description: errorDetails.description,
                            },
                        };
                    }

                    dispatch(errorAction);
                    dispatchStore(
                        showToast({
                            title: i18n(
                                'component.dialog-switch-public.view',
                                'toast_get-publication-preview-failed',
                            ),
                            name: 'failedGetPublicationPreview',
                            error: apiError,
                        }),
                    );
                }
            }
        }
        init();
    }, [state.refetchCounter]);

    React.useEffect(() => {
        if (state.applyCounter) {
            dispatch({
                type: DIALOG_PUBLIC_CHANGE_STATE,
                payload: {
                    ...state,
                    progress: true,
                },
            });
            const entries = getPublicationEntries(state);
            getSdk()
                .sdk.mix.switchPublicationStatus({
                    entries,
                    mainEntry: {
                        entryId: propsEntry.entryId,
                        unversionedData: {
                            publicAuthor: {
                                text: state.entryAuthor.text.trim(),
                                link: state.entryAuthor.link.trim(),
                            },
                        },
                    },
                    workbookId: propsEntry.workbookId,
                })
                .then(() => {
                    reachMetricaGoal(CounterName.Main, GoalId.DashboardPublicAccessSubmit);
                    toaster.add({
                        name: 'successSwitchPublicationStatus',
                        theme: 'success',
                        title: i18n(
                            'component.dialog-switch-public.view',
                            'toast_switch-publication-status-success',
                        ),
                    });
                    if (refMounted.current) {
                        dispatch({
                            type: DIALOG_PUBLIC_SET_SUCCESS,
                        });
                        onClose('success', state.currentEntryChecked);
                    }
                })
                .catch((error: Error) => {
                    logger.logError('DialogSwitchPublic: switchPublicationStatus failed', error);
                    if (refMounted.current) {
                        dispatch({
                            type: DIALOG_PUBLIC_SET_FAILED,
                        });
                        dispatchStore(
                            showToast({
                                title: i18n(
                                    'component.dialog-switch-public.view',
                                    'toast_switch-publication-status-failed',
                                ),
                                name: 'failedSwitchPublicationStatus',
                                error,
                            }),
                        );
                    }
                });
        }
    }, [state.applyCounter]);

    const refetch = React.useCallback(() => {
        dispatch({type: DIALOG_PUBLIC_SET_REFETCH});
    }, []);

    const apply = React.useCallback(() => {
        dispatch({type: DIALOG_PUBLIC_SET_APPLY});
    }, []);

    const setState = React.useCallback((payload: State) => {
        dispatch({type: DIALOG_PUBLIC_CHANGE_STATE, payload});
    }, []);

    const dispatchAction = React.useCallback((type: Action['type'], payload) => {
        dispatch({type, payload});
    }, []);

    return {
        state,
        disableApply: (!hasPublishChanges(state) && !hasAuthorChanges(state)) || !isValid(state),
        refetch,
        apply,
        dispatchAction,
        setState,
    };
};
