import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';
import {EntryScope} from 'shared';
import {WorkbookWithPermissions} from 'shared/schema';
import {AppDispatch} from 'ui/store';

import {getWorkbookEntries, resetWorkbookEntries} from '../../store/actions';
import {
    selectNextPageToken,
    selectWorkbookEntriesError,
    selectWorkbookEntriesIsLoading,
    selectWorkbookItems,
} from '../../store/selectors';
import {WorkbookEntriesFilters} from '../../types';
import {EmptyWorkbookContainer} from '../EmptyWorkbook/EmptyWorkbookContainer';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';

import './WorkbookContent.scss';

const b = block('dl-workbook-content');
const i18n = I18n.keyset('new-workbooks');

type Props = {
    scope?: EntryScope;
    filters: WorkbookEntriesFilters;
    workbookId: string;
    workbook: WorkbookWithPermissions | null;
};

export const WorkbookContent = React.memo<Props>(({workbookId, workbook, filters, scope}) => {
    const entries = useSelector(selectWorkbookItems);
    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);
    const workbookEntriesError = useSelector(selectWorkbookEntriesError);
    const nextPageToken = useSelector(selectNextPageToken);

    const dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        dispatch(resetWorkbookEntries());

        dispatch(getWorkbookEntries({workbookId, filters, scope}));
    }, [dispatch, filters, scope, workbook, workbookId]);

    const refreshEntries = React.useCallback(
        (entryScope?: EntryScope) => {
            dispatch(resetWorkbookEntries());

            dispatch(getWorkbookEntries({workbookId, filters, scope: entryScope || scope}));
        },
        [dispatch, workbookId, filters, scope],
    );

    const retryLoadEntries = React.useCallback(() => {
        dispatch(
            getWorkbookEntries({
                workbookId,
                filters,
                scope,
                nextPageToken,
            }),
        );
    }, [dispatch, workbookId, filters, scope, nextPageToken]);

    const loadMoreEntries = React.useCallback(() => {
        if (nextPageToken) {
            dispatch(
                getWorkbookEntries({
                    workbookId,
                    filters,
                    scope,
                    nextPageToken,
                }),
            );
        }
    }, [nextPageToken, dispatch, workbookId, filters, scope]);

    if (isEntriesLoading && entries.length === 0) {
        return <SmartLoader size="l" />;
    }

    const firstPageError = workbookEntriesError && entries.length === 0;

    const buttonRetry = (
        <div className={b('btn-retry')}>
            <Button view="action" size="m" onClick={retryLoadEntries}>
                {i18n(
                    firstPageError
                        ? 'button_workbook-table-retry'
                        : 'button_workbook-table-load-more',
                )}
            </Button>
        </div>
    );

    if (firstPageError) {
        return buttonRetry;
    }

    if (!workbook || entries.length === 0) {
        return <EmptyWorkbookContainer scope={scope} />;
    }

    let footer: React.ReactNode = null;

    if (scope) {
        if (isEntriesLoading) {
            footer = <SmartLoader size="m" showAfter={0} />;
        } else if (workbookEntriesError) {
            footer = buttonRetry;
        } else {
            footer = <Waypoint onEnter={loadMoreEntries} />;
        }
    }

    return (
        <React.Fragment>
            <WorkbookEntriesTable
                refreshEntries={refreshEntries}
                workbook={workbook}
                entries={entries}
                scope={scope}
            />
            {footer}
        </React.Fragment>
    );
});

WorkbookContent.displayName = 'WorkbookContent';
