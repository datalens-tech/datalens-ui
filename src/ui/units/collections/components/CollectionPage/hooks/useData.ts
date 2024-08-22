import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {batch, useDispatch, useSelector} from 'react-redux';

import type {
    GetStructureItemsArgs,
    GetStructureItemsResponse,
} from '../../../../../../shared/schema';
import type {StructureItemsFilters} from '../../../../../components/CollectionFilters';
import type {AppDispatch} from '../../../../../store';
import {
    getCollectionBreadcrumbs,
    setCollectionBreadcrumbs,
} from '../../../../collections-navigation/store/actions';
import {
    getCollection,
    getRootCollectionPermissions,
    getStructureItems,
    resetCollection,
    resetStructureItems,
} from '../../../store/actions';
import {selectRootCollectionPermissions} from '../../../store/selectors';
import {PAGE_SIZE} from '../../constants';

type UseDataArgs = {
    curCollectionId: string | null;
    filters: StructureItemsFilters;
};

export const useData = ({curCollectionId, filters}: UseDataArgs) => {
    const dispatch: AppDispatch = useDispatch();

    const rootPermissions = useSelector(selectRootCollectionPermissions);

    const getStructureItemsRecursively = React.useCallback(
        (args: GetStructureItemsArgs): CancellablePromise<GetStructureItemsResponse | null> => {
            let curPage = args.page;

            return dispatch(getStructureItems(args)).then((result) => {
                if (result?.items.length === 0 && result.nextPageToken !== null) {
                    curPage = result.nextPageToken;

                    return getStructureItemsRecursively({
                        ...args,
                        page: curPage,
                    });
                } else {
                    return result;
                }
            });
        },
        [dispatch],
    );

    React.useEffect(() => {
        let rootCollectionPermissionsPromise: CancellablePromise<unknown>;

        if (curCollectionId === null && !rootPermissions) {
            rootCollectionPermissionsPromise = dispatch(getRootCollectionPermissions());
        }

        return () => {
            if (rootCollectionPermissionsPromise) {
                rootCollectionPermissionsPromise.cancel();
            }
        };
    }, [curCollectionId, rootPermissions, dispatch]);

    const fetchCollectionInfo = React.useCallback(() => {
        let getCollectionPromise: CancellablePromise<unknown> = new CancellablePromise(
            Promise.resolve(),
        );
        let getCollectionBreadcrumbsPromise: CancellablePromise<unknown> = new CancellablePromise(
            Promise.resolve(),
        );

        if (curCollectionId === null) {
            batch(() => {
                dispatch(resetCollection());
                dispatch(setCollectionBreadcrumbs([]));
            });
        } else {
            getCollectionPromise = dispatch(getCollection({collectionId: curCollectionId}));
            getCollectionBreadcrumbsPromise = dispatch(
                getCollectionBreadcrumbs({collectionId: curCollectionId}),
            );
        }
        return [getCollectionPromise, getCollectionBreadcrumbsPromise];
    }, [curCollectionId, dispatch]);

    const fetchStructureItems = React.useCallback(() => {
        dispatch(resetStructureItems());

        const getStructureItemsRecursivelyPromise = getStructureItemsRecursively({
            collectionId: curCollectionId,
            pageSize: PAGE_SIZE,
            filterString: filters.filterString,
            orderField: filters.orderField,
            orderDirection: filters.orderDirection,
            mode: filters.mode,
            onlyMy: filters.onlyMy,
        });

        return [getStructureItemsRecursivelyPromise];
    }, [
        dispatch,
        getStructureItemsRecursively,
        curCollectionId,
        filters.filterString,
        filters.orderField,
        filters.orderDirection,
        filters.mode,
        filters.onlyMy,
    ]);

    const refreshPage = React.useCallback(() => {
        fetchCollectionInfo();
        fetchStructureItems();
    }, [fetchCollectionInfo, fetchStructureItems]);

    React.useEffect(() => {
        const fetchCollectionInfoPromises = fetchCollectionInfo();

        return () => {
            fetchCollectionInfoPromises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [fetchCollectionInfo]);

    React.useEffect(() => {
        const fetchStructureItemsPromises = fetchStructureItems();

        return () => {
            fetchStructureItemsPromises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [fetchStructureItems]);

    return {
        getStructureItemsRecursively,
        fetchCollectionInfo,
        fetchStructureItems,
        refreshPage,
    };
};
