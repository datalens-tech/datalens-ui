import React from 'react';

import type {CancellablePromise} from '@gravity-ui/sdk';
import {isSdkError} from 'libs/schematic-sdk';
import {useDispatch, useSelector} from 'react-redux';
import type {
    GetStructureItemsArgs,
    GetStructureItemsMode,
    GetStructureItemsResponse,
    OrderBasicField,
    OrderDirection,
} from 'shared/schema';
import {
    type CollectionsStructureDispatch,
    getCollection,
    getCollectionBreadcrumbs,
    getRootCollectionPermissions,
    getStructureItems,
    resetCollectionBreadcrumbs,
    resetState,
    resetStructureItems,
} from 'ui/store/actions/collectionsStructure';
import {selectGetCollection} from 'ui/store/selectors/collectionsStructure';

import type {StructureItemsFilters} from '../../CollectionFilters';

const PAGE_SIZE = 50;

const DEFAULT_FILTERS: {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetStructureItemsMode;
    onlyMy: boolean;
} = {
    filterString: undefined,
    orderField: 'createdAt',
    orderDirection: 'desc',
    mode: 'all',
    onlyMy: false,
};

type UseCollectionStructureDialogStateProps = {
    includePermissionsInfo: boolean;
    initialCollectionId: string | null;
    open: boolean;
};

export const useCollectionStructureDialogState = ({
    includePermissionsInfo,
    initialCollectionId,
    open,
}: UseCollectionStructureDialogStateProps) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();
    const getCollectionState = useSelector(selectGetCollection);

    const [filters, setFilters] = React.useState<StructureItemsFilters>(DEFAULT_FILTERS);
    const [targetCollectionId, setTargetCollectionId] = React.useState(initialCollectionId);
    const [targetWorkbookId, setTargetWorkbookId] = React.useState<string | null>(null);

    const getStructureItemsRecursively = React.useCallback(
        (args: GetStructureItemsArgs): CancellablePromise<GetStructureItemsResponse | null> => {
            let curPage = args.page;

            return dispatch(getStructureItems({...args, includePermissionsInfo})).then((result) => {
                if (result?.items.length === 0 && result.nextPageToken !== null) {
                    curPage = result.nextPageToken;

                    return getStructureItemsRecursively({
                        ...args,
                        includePermissionsInfo,
                        page: curPage,
                    });
                } else {
                    return result;
                }
            });
        },
        [dispatch, includePermissionsInfo],
    );

    const handleChangeCollection = React.useCallback((newValue: string | null) => {
        setTargetCollectionId(newValue);
        setTargetWorkbookId(null);
        setFilters((prevFilters) => ({...prevFilters, filterString: undefined}));
    }, []);

    const handleChangeWorkbook = React.useCallback((newValue: string | null) => {
        setTargetWorkbookId(newValue);
    }, []);

    const fetchData = React.useCallback(() => {
        const promises: CancellablePromise[] = [];

        dispatch(resetStructureItems());
        promises.push(
            getStructureItemsRecursively({
                collectionId: targetCollectionId,
                pageSize: PAGE_SIZE,
                ...filters,
            }),
        );

        if (targetCollectionId) {
            promises.push(dispatch(getCollection({collectionId: targetCollectionId})));
            promises.push(dispatch(getCollectionBreadcrumbs({collectionId: targetCollectionId})));
        } else {
            dispatch(resetCollectionBreadcrumbs());
        }

        return promises;
    }, [dispatch, filters, getStructureItemsRecursively, targetCollectionId]);

    React.useEffect(() => {
        setTargetCollectionId(initialCollectionId);
    }, [initialCollectionId]);

    React.useEffect(() => {
        const promises: CancellablePromise<unknown>[] = [];

        if (open) {
            dispatch(resetState());
            promises.push(dispatch(getRootCollectionPermissions()));
        }

        return () => {
            promises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [dispatch, open]);

    React.useEffect(() => {
        const promises: CancellablePromise<unknown>[] = [];

        if (open) {
            promises.push(...fetchData());
        }

        return () => {
            promises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [fetchData, open]);

    React.useEffect(() => {
        const isNoAccessError =
            isSdkError(getCollectionState.error) && getCollectionState.error.status === 403;
        if (open && isNoAccessError) {
            setTargetCollectionId(null);
        }
    }, [open, getCollectionState.error]);

    return {
        getStructureItemsRecursively,
        filters,
        setFilters,
        targetCollectionId,
        handleChangeCollection,
        targetWorkbookId,
        handleChangeWorkbook,
    };
};
