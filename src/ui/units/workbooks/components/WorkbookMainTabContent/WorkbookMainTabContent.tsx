import React from 'react';

import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope, Feature} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import {registry} from 'ui/registry';
import type {AppDispatch} from 'ui/store';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {
    getAllWorkbookEntriesSeparately,
    getWorkbookEntries,
    getWorkbookSharedEntries,
    resetWorkbookEntries,
    resetWorkbookEntriesByScope,
    resetWorkbookSharedEntries,
} from '../../store/actions';
import {
    selectSharedNextPageToken,
    selectWorkbookEntriesIsLoading,
    selectWorkbookItems,
    selectWorkbookSharedEntriesError,
    selectWorkbookSharedEntriesIsLoading,
    selectWorkbookSharedItems,
} from '../../store/selectors';
import type {WorkbookEntriesFilters} from '../../types';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';
import {useChunkedEntries as useSharedChunkedEntries} from '../WorkbookTabContent/useChunkedEntries';
import {TAB_ALL} from '../WorkbookTabs/constants';

import {useChunkedEntries} from './useChunkedEntries';

type Props = {
    filters: WorkbookEntriesFilters;
    workbookId: string;
    workbook: WorkbookWithPermissions;
};

const PAGE_SIZE_MAIN_TAB = 10;

export const WorkbookMainTabContent = React.memo<Props>(({filters, workbookId, workbook}) => {
    const [mapTokens, setMapTokens] = React.useState<Record<string, string>>({});
    const [mapErrors, setMapErrors] = React.useState<Record<string, boolean>>({});
    const [mapLoaders, setMapLoaders] = React.useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = React.useState(false);
    const isSharedEntriesLoading = useSelector(selectWorkbookSharedEntriesIsLoading);
    const workbookSharedEntriesError = useSelector(selectWorkbookSharedEntriesError);
    const sharedNextPageToken = useSelector(selectSharedNextPageToken);

    const isSharedEntriesEnabled = isEnabledFeature(Feature.EnableSharedEntries);

    const dispatch = useDispatch<AppDispatch>();
    const entries = useSelector(selectWorkbookItems);
    const sharedEntries = useSelector(selectWorkbookSharedItems);

    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);

    const {getWorkbookTabs} = registry.workbooks.functions.getAll();

    const availableScopes = React.useMemo(() => {
        return workbook
            ? getWorkbookTabs(workbook)
                  .map(({id}) => id as string)
                  .filter((item) => item !== TAB_ALL)
            : [];
    }, [getWorkbookTabs, workbook]) as EntryScope[];

    const chunks = useChunkedEntries({
        entries,
        availableScopes,
    });

    const sharedChunks = useSharedChunkedEntries({
        entries: sharedEntries,
        availableScopes: [EntryScope.Connection, EntryScope.Dataset],
    });

    React.useEffect(() => {
        if (workbook?.workbookId === workbookId) {
            (async () => {
                dispatch(resetWorkbookEntries());
                dispatch(resetWorkbookSharedEntries());

                setIsLoading(true);

                const data = await dispatch(
                    getAllWorkbookEntriesSeparately({
                        workbookId,
                        filters,
                        scopes: availableScopes,
                        pageSize: PAGE_SIZE_MAIN_TAB,
                    }),
                );

                if (isSharedEntriesEnabled) {
                    dispatch(
                        getWorkbookSharedEntries({
                            workbookId,
                            filters,
                            pageSize: PAGE_SIZE_MAIN_TAB,
                        }),
                    );
                }
                const errors: Record<string, boolean> = {};
                const tokensMap: Record<string, string> = {};

                availableScopes.forEach((scope, i) => {
                    if (data[i] === null) {
                        errors[scope] = true;
                    }

                    tokensMap[scope] = data[i]?.nextPageToken || '';
                });

                setMapTokens(tokensMap);

                setMapErrors(errors);

                setIsLoading(false);
            })();
        }
    }, [
        dispatch,
        filters,
        workbook?.workbookId,
        workbook.permissions.view,
        workbookId,
        availableScopes,
        isSharedEntriesEnabled,
    ]);

    const loadMoreEntries = React.useCallback(
        (entryScope: EntryScope) => {
            if (mapTokens[entryScope]) {
                dispatch(
                    getWorkbookEntries({
                        workbookId,
                        filters,
                        scope: entryScope,
                        nextPageToken: mapTokens[entryScope],
                        pageSize: PAGE_SIZE_MAIN_TAB,
                    }),
                ).then((data) => {
                    if (data) {
                        setMapTokens({
                            ...mapTokens,
                            [entryScope]: data?.nextPageToken || '',
                        });
                    }
                });
            }
        },
        [dispatch, filters, mapTokens, workbookId],
    );

    const loadMoreSharedEntries = React.useCallback(
        (entryScope?: EntryScope) => {
            if (sharedNextPageToken) {
                dispatch(
                    getWorkbookSharedEntries({
                        workbookId,
                        filters,
                        scope: entryScope,
                        nextPageToken: sharedNextPageToken,
                        pageSize: PAGE_SIZE_MAIN_TAB,
                    }),
                );
            }
        },
        [dispatch, filters, sharedNextPageToken, workbookId],
    );

    const retryLoadEntries = React.useCallback(
        (entryScope: EntryScope) => {
            setMapLoaders({
                [entryScope]: true,
            });

            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    nextPageToken: mapTokens[entryScope],
                    pageSize: PAGE_SIZE_MAIN_TAB,
                }),
            )
                .then((data) => {
                    if (data) {
                        setMapErrors({
                            ...mapErrors,
                            [entryScope]: false,
                        });
                        setMapTokens({
                            ...mapTokens,
                            [entryScope]: data?.nextPageToken || '',
                        });
                    }
                })
                .finally(() => {
                    setMapLoaders({
                        [entryScope]: false,
                    });
                });
        },
        [dispatch, workbookId, filters, mapErrors, mapTokens],
    );

    const retryLoadSharedEntries = React.useCallback(
        (entryScope?: EntryScope) => {
            dispatch(
                getWorkbookSharedEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    nextPageToken: sharedNextPageToken,
                    pageSize: PAGE_SIZE_MAIN_TAB,
                }),
            );
        },
        [dispatch, workbookId, filters, sharedNextPageToken],
    );

    const refreshEntries = React.useCallback(
        (entryScope: EntryScope) => {
            setMapLoaders({
                [entryScope]: true,
            });
            dispatch(resetWorkbookEntriesByScope(entryScope));

            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    pageSize: PAGE_SIZE_MAIN_TAB,
                }),
            )
                .then((data) => {
                    if (data) {
                        setMapTokens({
                            ...mapTokens,
                            [entryScope]: data?.nextPageToken || '',
                        });
                    }
                })
                .finally(() => {
                    setMapLoaders({
                        [entryScope]: false,
                    });
                });
        },
        [dispatch, workbookId, filters, mapTokens],
    );

    if (
        (isEntriesLoading || isLoading) &&
        entries.length === 0 &&
        Object.keys(mapErrors).length === 0
    ) {
        return <SmartLoader size="l" />;
    }

    return (
        <AnimateBlock>
            <WorkbookEntriesTable
                refreshEntries={refreshEntries}
                workbook={workbook}
                entries={entries}
                loadMoreEntries={loadMoreEntries}
                retryLoadEntries={retryLoadEntries}
                mapTokens={mapTokens}
                mapErrors={mapErrors}
                mapLoaders={mapLoaders}
                chunks={chunks}
                sharedChunks={sharedChunks}
                loadMoreSharedEntries={loadMoreSharedEntries}
                retryLoadSharedEntries={retryLoadSharedEntries}
                availableScopes={availableScopes}
                sharedError={Boolean(workbookSharedEntriesError)}
                sharedLoader={isSharedEntriesLoading}
                sharedToken={sharedNextPageToken}
            />
        </AnimateBlock>
    );
});

WorkbookMainTabContent.displayName = 'WorkbookMainTabContent';
