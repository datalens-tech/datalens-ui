import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';
import type {EntryScope} from 'shared';
import type {WorkbookWithPermissions} from 'shared/schema';
import {registry} from 'ui/registry';
import type {AppDispatch} from 'ui/store';

import {AnimateBlock} from '../../../../components/AnimateBlock';
import {getWorkbookEntries, resetWorkbookEntries} from '../../store/actions';
import {
    selectNextPageToken,
    selectWorkbookEntriesError,
    selectWorkbookEntriesIsLoading,
    selectWorkbookItems,
} from '../../store/selectors';
import type {WorkbookEntriesFilters} from '../../types';
import {EmptyWorkbookContainer} from '../EmptyWorkbook/EmptyWorkbookContainer';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';
import {TAB_ALL} from '../WorkbookTabs/constants';

import {useChunkedEntries} from './useChunkedEntries';

import './WorkbookTabContent.scss';

const b = block('dl-workbook-tab-content');
const i18n = I18n.keyset('new-workbooks');

type Props = {
    scope?: EntryScope;
    filters: WorkbookEntriesFilters;
    workbookId: string;
    workbook: WorkbookWithPermissions | null;
};

export const WorkbookTabContent = React.memo<Props>(({workbookId, workbook, filters, scope}) => {
    const entries = useSelector(selectWorkbookItems);
    const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);
    const workbookEntriesError = useSelector(selectWorkbookEntriesError);
    const nextPageToken = useSelector(selectNextPageToken);

    const {getWorkbookTabs} = registry.workbooks.functions.getAll();

    const availableScopes = React.useMemo(() => {
        return workbook
            ? getWorkbookTabs(workbook)
                  .map(({id}) => id as string)
                  .filter((item) => item !== TAB_ALL)
            : [];
    }, [getWorkbookTabs, workbook]) as EntryScope[];

    const chunks = useChunkedEntries({entries, availableScopes});

    const dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        dispatch(resetWorkbookEntries());

        dispatch(getWorkbookEntries({workbookId, filters, scope}));
    }, [dispatch, filters, scope, workbook, workbookId]);

    const refreshEntries = React.useCallback(
        (entryScope: EntryScope) => {
            dispatch(resetWorkbookEntries());

            dispatch(getWorkbookEntries({workbookId, filters, scope: entryScope}));
        },
        [dispatch, workbookId, filters],
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
        return (
            <AnimateBlock>
                <EmptyWorkbookContainer scope={scope} />
            </AnimateBlock>
        );
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
        <AnimateBlock>
            <WorkbookEntriesTable
                refreshEntries={refreshEntries}
                workbook={workbook}
                entries={entries}
                scope={scope}
                chunks={chunks}
            />
            {footer}
        </AnimateBlock>
    );
});

WorkbookTabContent.displayName = 'WorkbookTabContent';
