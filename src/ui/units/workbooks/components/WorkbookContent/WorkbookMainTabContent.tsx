import React from 'react';

import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {useDispatch, useSelector} from 'react-redux';
import {EntryScope} from 'shared';
import {AppDispatch} from 'ui/store';

import {
    getAllWorkbookEntriesSeparately,
    getWorkbookEntries,
    resetWorkbookEntries,
} from '../../store/actions';
import {
    selectWorkbook,
    selectWorkbookEntriesIsLoading,
    selectWorkbookItems,
} from '../../store/selectors';
import {WorkbookEntriesFilters} from '../../types';
import {EmptyWorkbookContainer} from '../EmptyWorkbook/EmptyWorkbookContainer';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';

import './WorkbookContent.scss';

type Props = {
    filters: WorkbookEntriesFilters;
    workbookId: string;
};

const PAGE_SIZE_MAIN_TAB = 10;

export const WorkbookMainTabContent = React.memo<Props>(({filters, workbookId}) => {
    const [mapTokens, setMapTokens] = React.useState<Record<string, string>>({});
    const [mapErrors, setMapErrors] = React.useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = React.useState(false);

    const workbook = useSelector(selectWorkbook);
    const dispatch = useDispatch<AppDispatch>();
    const entries = useSelector(selectWorkbookItems);
    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);

    React.useEffect(() => {
        dispatch(resetWorkbookEntries());

        (async () => {
            if (workbook) {
                const scopesForRequest = [EntryScope.Dash, EntryScope.Widget];

                if (workbook.permissions.view) {
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

                if (data) {
                    const [dataDashes, dataWidgets, dataDatasets, dataConnections] = data;

                    const errors: Record<string, boolean> = {};

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

                    setMapErrors(errors);

                    const tokensMap: Record<string, string> = {};

                    tokensMap[EntryScope.Dash] = dataDashes?.nextPageToken || '';
                    tokensMap[EntryScope.Dataset] = dataDatasets?.nextPageToken || '';
                    tokensMap[EntryScope.Widget] = dataWidgets?.nextPageToken || '';
                    tokensMap[EntryScope.Connection] = dataConnections?.nextPageToken || '';

                    setMapTokens(tokensMap);
                }

                setIsLoading(false);
            }
        })();
    }, [dispatch, filters, workbook, workbookId]);

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
                    setMapTokens({
                        ...mapTokens,
                        [entryScope]: data?.nextPageToken || '',
                    });
                });
            }
        },
        [dispatch, filters, mapTokens, workbookId],
    );

    const retryLoadEntries = React.useCallback(
        (entryScope: EntryScope) => {
            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope: entryScope,
                    nextPageToken: mapTokens[entryScope],
                    pageSize: PAGE_SIZE_MAIN_TAB,
                }),
            ).then((data) => {
                setMapErrors({
                    ...mapErrors,
                    [entryScope]: false,
                });
                setMapTokens({
                    ...mapTokens,
                    [entryScope]: data?.nextPageToken || '',
                });
            });
        },
        [dispatch, workbookId, filters, mapErrors, mapTokens],
    );

    const refreshEntries = React.useCallback(
        (entryScope?: EntryScope) => {
            if (entryScope) {
                dispatch(getWorkbookEntries({workbookId, filters, scope: entryScope}));
            }
        },
        [dispatch, workbookId, filters],
    );

    if ((isEntriesLoading || isLoading) && entries.length === 0) {
        return <SmartLoader size="l" />;
    }

    if (!workbook || entries.length === 0) {
        return <EmptyWorkbookContainer />;
    }

    return (
        <React.Fragment>
            <WorkbookEntriesTable
                refreshEntries={refreshEntries}
                workbook={workbook}
                entries={entries}
                loadMoreEntries={loadMoreEntries}
                retryLoadEntries={retryLoadEntries}
                mapTokens={mapTokens}
                mapErrors={mapErrors}
            />
        </React.Fragment>
    );
});

WorkbookMainTabContent.displayName = 'WorkbookMainTabContent';
