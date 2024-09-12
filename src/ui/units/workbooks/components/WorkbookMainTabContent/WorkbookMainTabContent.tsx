import React from 'react';

import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {useDispatch, useSelector} from 'react-redux';
import type {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import {registry} from 'ui/registry';
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

    const dispatch = useDispatch<AppDispatch>();
    const entries = useSelector(selectWorkbookItems);
    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);

    const chunks = useChunkedEntries(entries);

    const {getWorkbookTabs} = registry.workbooks.functions.getAll();

    const availableScopes = React.useMemo(() => {
        return workbook
            ? getWorkbookTabs(workbook)
                  .map(({id}) => id as string)
                  .filter((item) => item !== TAB_ALL)
            : [];
    }, [getWorkbookTabs, workbook]) as EntryScope[];

    React.useEffect(() => {
        if (workbook?.workbookId === workbookId) {
            (async () => {
                dispatch(resetWorkbookEntries());

                setIsLoading(true);

                const data = await dispatch(
                    getAllWorkbookEntriesSeparately({
                        workbookId,
                        filters,
                        scopes: availableScopes,
                        pageSize: PAGE_SIZE_MAIN_TAB,
                    }),
                );

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
                availableScopes={availableScopes}
            />
        </AnimateBlock>
    );
});

WorkbookMainTabContent.displayName = 'WorkbookMainTabContent';
