import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {Dialog} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';

import type {
    ListAccessBindingsResultItem,
    PageTokenData,
} from '../../../shared/schema/extensions/types';
import type {IamAccessDialogProps} from '../../registry/units/common/types/components/IamAccessDialog';
import {
    batchListMembers,
    getCollectionBreadcrumbs,
    listAccessBindings,
    resetState,
} from '../../store/actions/iamAccessDialog';
import type {IamAccessDialogDispatch} from '../../store/actions/iamAccessDialog';
import {reducerRegistry} from '../../store/reducer-registry';
import {iamAccessDialogReducer} from '../../store/reducers/iamAccessDialog';

import {AccessList} from './AccessList/AccessList';
import {AddSubjects} from './AddSubjects/AddSubjects';
import {CLOSE_DELETE_TIMEOUT} from './constants';

enum Mode {
    AccessListMode = 'accessListMode',
    AddUserMode = 'addUserMode',
}

reducerRegistry.register({iamAccessDialog: iamAccessDialogReducer});

export const IamAccessDialogComponent = React.memo<IamAccessDialogProps>(
    ({
        open,
        resourceId,
        resourceType,
        resourceTitle,
        resourceScope,
        parentId,
        canUpdate,
        onClose,
    }) => {
        const dispatch = useDispatch<IamAccessDialogDispatch>();

        const [mode, setMode] = React.useState(Mode.AccessListMode);
        const [isLoadingDirect, setIsLoadingDirect] = React.useState(false);
        const [isLoadingInherited, setIsLoadingInherited] = React.useState(false);

        const withInherits = React.useRef(false);

        const handleClose = React.useCallback(() => {
            onClose();
            setTimeout(() => {
                setMode(Mode.AccessListMode);
            }, CLOSE_DELETE_TIMEOUT);
        }, [onClose]);

        const inheritedListAccessBindingsThen = React.useCallback(
            async (response: ListAccessBindingsResultItem[] | null) => {
                if (response) {
                    const subjectIds = response.reduce<string[]>((acc, item) => {
                        item.response.accessBindings.forEach((binding) => {
                            if (!acc.includes(binding.subject.id)) {
                                acc.push(binding.subject.id);
                            }
                        });
                        return acc;
                    }, []);

                    if (subjectIds.length > 0) {
                        await dispatch(
                            batchListMembers({
                                subjectIds,
                            }),
                        );
                    }

                    const pageTokenData = response
                        .map((accessBinding) => {
                            return {
                                id: accessBinding.resource.id,
                                type: accessBinding.resource.type,
                                pageToken: accessBinding.response.nextPageToken,
                            };
                        })
                        .filter((accessBinding) => {
                            return accessBinding.pageToken && accessBinding.id !== resourceId;
                        });

                    if (pageTokenData.length === 0) {
                        setIsLoadingInherited(false);
                    }

                    return response;
                }

                setIsLoadingInherited(false);

                return null;
            },
            [dispatch, resourceId],
        );

        const directListAccessBindingsThen = React.useCallback(
            async (
                response: ListAccessBindingsResultItem[] | null,
                loadMore: (pageTokenData?: PageTokenData) => Promise<unknown>,
            ) => {
                if (response) {
                    const subjectIds = response.reduce<string[]>((acc, item) => {
                        item.response.accessBindings.forEach((binding) => {
                            if (!acc.includes(binding.subject.id)) {
                                acc.push(binding.subject.id);
                            }
                        });
                        return acc;
                    }, []);

                    if (subjectIds.length > 0) {
                        await dispatch(
                            batchListMembers({
                                subjectIds,
                            }),
                        );
                    }

                    const pageTokenData = response?.map((accessBinding) => {
                        return {
                            id: accessBinding.resource.id,
                            type: accessBinding.resource.type,
                            pageToken: accessBinding.response.nextPageToken,
                        };
                    });

                    const filteredByInherited = pageTokenData.filter(
                        (accessBinding) =>
                            accessBinding.pageToken && accessBinding.id !== resourceId,
                    );

                    if (filteredByInherited.length === 0) {
                        setIsLoadingInherited(false);
                    }

                    const filteredByDirect = pageTokenData.filter(
                        (accessBinding) =>
                            accessBinding.pageToken && accessBinding.id === resourceId,
                    );

                    await loadMore(filteredByDirect);

                    return response;
                }

                return null;
            },
            [dispatch, resourceId],
        );

        const loadMoreDirectAccessBindings: (pageTokenData?: PageTokenData) => Promise<unknown> =
            React.useCallback(
                (pageTokenData?: PageTokenData) => {
                    if (pageTokenData && pageTokenData.length > 0) {
                        if (parentId) {
                            return dispatch(
                                listAccessBindings({
                                    resourceId,
                                    resourceType,
                                    withInherits: withInherits.current,
                                    pageTokenData,
                                }),
                            ).then((res) => {
                                return directListAccessBindingsThen(
                                    res,
                                    loadMoreDirectAccessBindings,
                                );
                            });
                        } else {
                            return dispatch(
                                listAccessBindings({
                                    resourceId,
                                    resourceType,
                                    pageTokenData,
                                }),
                            ).then((res) => {
                                return directListAccessBindingsThen(
                                    res,
                                    loadMoreDirectAccessBindings,
                                );
                            });
                        }
                    } else {
                        setIsLoadingDirect(false);
                        return Promise.resolve(null);
                    }
                },
                [directListAccessBindingsThen, dispatch, parentId, resourceId, resourceType],
            );

        const loadMoreInheritedAccessBindings = React.useCallback(
            (pageTokenData?: PageTokenData) => {
                if (pageTokenData && pageTokenData.length > 0) {
                    if (parentId) {
                        return dispatch(
                            listAccessBindings({
                                resourceId,
                                resourceType,
                                withInherits: withInherits.current,
                                pageTokenData,
                            }),
                        ).then(inheritedListAccessBindingsThen);
                    } else {
                        return dispatch(
                            listAccessBindings({
                                resourceId,
                                resourceType,
                                pageTokenData,
                            }),
                        ).then(inheritedListAccessBindingsThen);
                    }
                } else {
                    return Promise.resolve(null);
                }
            },
            [dispatch, inheritedListAccessBindingsThen, parentId, resourceId, resourceType],
        );

        const fetchData = React.useCallback(() => {
            dispatch(resetState());

            const result: CancellablePromise<unknown>[] = [];

            setIsLoadingDirect(true);

            setIsLoadingInherited(true);

            if (parentId) {
                const dataPromise = dispatch(
                    getCollectionBreadcrumbs({collectionId: parentId}),
                ).then((response) => {
                    withInherits.current = Boolean(response);

                    return dispatch(
                        listAccessBindings({
                            resourceId,
                            resourceType,
                            withInherits: Boolean(response),
                        }),
                    ).then((res) => {
                        return directListAccessBindingsThen(res, loadMoreDirectAccessBindings);
                    });
                });
                result.push(dataPromise);
            } else {
                const dataPromise = dispatch(
                    listAccessBindings({
                        resourceId,
                        resourceType,
                    }),
                ).then((res) => {
                    return directListAccessBindingsThen(res, loadMoreDirectAccessBindings);
                });

                result.push(dataPromise);
            }

            return result;
        }, [
            dispatch,
            parentId,
            resourceId,
            resourceType,
            directListAccessBindingsThen,
            loadMoreDirectAccessBindings,
        ]);

        React.useEffect(() => {
            let result: CancellablePromise<unknown>[] = [];

            if (open) {
                result = fetchData();
            }

            return () => {
                result.forEach((promise) => {
                    promise.cancel();
                });
            };
        }, [fetchData, open]);

        return (
            <Dialog size="m" open={open} onClose={handleClose}>
                {mode === Mode.AccessListMode ? (
                    <AccessList
                        resourceId={resourceId}
                        resourceType={resourceType}
                        resourceTitle={resourceTitle}
                        resourceScope={resourceScope}
                        canUpdate={canUpdate}
                        refetch={fetchData}
                        loadMoreInheritedAccessBindings={loadMoreInheritedAccessBindings}
                        onAddUserClick={() => {
                            setMode(Mode.AddUserMode);
                        }}
                        onClose={handleClose}
                        isLoadingDirect={isLoadingDirect}
                        isLoadingInherited={isLoadingInherited}
                    />
                ) : (
                    <AddSubjects
                        resourceScope={resourceScope}
                        resourceId={resourceId}
                        resourceType={resourceType}
                        resourceTitle={resourceTitle}
                        refetch={fetchData}
                        onBack={() => {
                            setMode(Mode.AccessListMode);
                        }}
                    />
                )}
            </Dialog>
        );
    },
);

IamAccessDialogComponent.displayName = 'IamAccessDialogComponent';
