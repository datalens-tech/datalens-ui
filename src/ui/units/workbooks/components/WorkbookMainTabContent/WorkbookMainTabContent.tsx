import React from 'react';

import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import type {AppDispatch} from 'ui/store';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {
    getAllWorkbookEntriesSeparately,
    getWorkbookEntries,
    resetWorkbookEntries,
    resetWorkbookEntriesByScope,
} from '../../store/actions';
import {selectWorkbookEntriesIsLoading, selectWorkbookItems} from '../../store/selectors';
import type {WorkbookEntriesFilters} from '../../types';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';

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

    const dispatch = useDispatch<AppDispatch>();
    const entries = useSelector(selectWorkbookItems);
    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);

    const chunks = useChunkedEntries(entries);

    React.useEffect(() => {
        if (workbook?.workbookId === workbookId) {
            (async () => {
                dispatch(resetWorkbookEntries());

                const scopesForRequest = [EntryScope.Dash, EntryScope.Widget];

                if (workbook?.permissions.view) {
                    scopesForRequest.push(EntryScope.Dataset, EntryScope.Connection);
                }

                setIsLoading(true);

                const data = await dispatch(
                    getAllWorkbookEntriesSeparately({
                        workbookId,
                        filters,
                        scopes: scopesForRequest,
                        pageSize: PAGE_SIZE_MAIN_TAB,
                    }),
                );

                const errors: Record<string, boolean> = {};

                const [dataDashes, dataWidgets, dataDatasets, dataConnections] = data;

                if (dataDashes === null) {
                    errors[EntryScope.Dash] = true;
                }

                if (dataDatasets === null) {
                    errors[EntryScope.Dataset] = true;
                }

                if (dataWidgets === null) {
                    errors[EntryScope.Widget] = true;
                }

                if (dataConnections === null) {
                    errors[EntryScope.Connection] = true;
                }

                const tokensMap: Record<string, string> = {};

                tokensMap[EntryScope.Dash] = dataDashes?.nextPageToken || '';
                tokensMap[EntryScope.Dataset] = dataDatasets?.nextPageToken || '';
                tokensMap[EntryScope.Widget] = dataWidgets?.nextPageToken || '';
                tokensMap[EntryScope.Connection] = dataConnections?.nextPageToken || '';

                setMapTokens(tokensMap);

                setMapErrors(errors);

                setIsLoading(false);
            })();
        }
    }, [dispatch, filters, workbook?.workbookId, workbook?.permissions.view, workbookId]);

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
            />
        </AnimateBlock>
    );
});

WorkbookMainTabContent.displayName = 'WorkbookMainTabContent';
