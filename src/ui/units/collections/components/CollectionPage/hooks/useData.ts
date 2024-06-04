import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {batch, useDispatch, useSelector} from 'react-redux';

import type {
    GetCollectionContentArgs,
    GetCollectionContentResponse,
} from '../../../../../../shared/schema';
import type {CollectionContentFilters} from '../../../../../components/CollectionFilters';
import type {AppDispatch} from '../../../../../store';
import {
    getCollectionBreadcrumbs,
    setCollectionBreadcrumbs,
} from '../../../../collections-navigation/store/actions';
import {
    getCollection,
    getCollectionContent,
    getRootCollectionPermissions,
    resetCollection,
    resetCollectionContent,
} from '../../../store/actions';
import {selectRootCollectionPermissions} from '../../../store/selectors';
import {PAGE_SIZE} from '../../constants';

type UseDataArgs = {
    curCollectionId: string | null;
    filters: CollectionContentFilters;
};

export const useData = ({curCollectionId, filters}: UseDataArgs) => {
    const dispatch: AppDispatch = useDispatch();

    const rootPermissions = useSelector(selectRootCollectionPermissions);

    const getCollectionContentRecursively = React.useCallback(
        (
            args: GetCollectionContentArgs,
        ): CancellablePromise<GetCollectionContentResponse | null> => {
            let curCollectionsPage = args.collectionsPage;
            let curWorkbooksPage = args.workbooksPage;

            return dispatch(getCollectionContent(args)).then((result) => {
                if (
                    (result?.collections.length === 0 &&
                        result.collectionsNextPageToken !== null) ||
                    (result?.workbooks.length === 0 && result.workbooksNextPageToken !== null)
                ) {
                    curCollectionsPage = result.collectionsNextPageToken;
                    curWorkbooksPage = result.workbooksNextPageToken;

                    return getCollectionContentRecursively({
                        ...args,
                        collectionsPage: curCollectionsPage,
                        workbooksPage: curWorkbooksPage,
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

    const fetchCollectionContent = React.useCallback(() => {
        dispatch(resetCollectionContent());

        const getCollectionContentRecursivelyPromise = getCollectionContentRecursively({
            collectionId: curCollectionId,
            pageSize: PAGE_SIZE,
            filterString: filters.filterString,
            orderField: filters.orderField,
            orderDirection: filters.orderDirection,
            mode: filters.mode,
            onlyMy: filters.onlyMy,
        });

        return [getCollectionContentRecursivelyPromise];
    }, [
        dispatch,
        getCollectionContentRecursively,
        curCollectionId,
        filters.filterString,
        filters.orderField,
        filters.orderDirection,
        filters.mode,
        filters.onlyMy,
    ]);

    const refreshPage = React.useCallback(() => {
        fetchCollectionInfo();
        fetchCollectionContent();
    }, [fetchCollectionInfo, fetchCollectionContent]);

    React.useEffect(() => {
        const fetchCollectionInfoPromises = fetchCollectionInfo();

        return () => {
            fetchCollectionInfoPromises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [fetchCollectionInfo]);

    React.useEffect(() => {
        const fetchCollectionContentPromises = fetchCollectionContent();

        return () => {
            fetchCollectionContentPromises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [fetchCollectionContent]);

    return {
        getCollectionContentRecursively,
        fetchCollectionInfo,
        fetchCollectionContent,
        refreshPage,
    };
};
