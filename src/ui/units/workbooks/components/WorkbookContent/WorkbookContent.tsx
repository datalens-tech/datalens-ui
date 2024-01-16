import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {SmartLoader} from 'components/SmartLoader/SmartLoader';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {Waypoint} from 'react-waypoint';
import {EntryScope} from 'shared';

import {
    selectWorkbook,
    selectWorkbookEntriesError,
    selectWorkbookEntriesIsLoading,
    selectWorkbookItems,
} from '../../store/selectors';
import {EmptyWorkbookContainer} from '../EmptyWorkbook/EmptyWorkbookContainer';
import {WorkbookEntriesTable} from '../Table/WorkbookEntriesTable/WorkbookEntriesTable';

import './WorkbookContent.scss';

const b = block('dl-workbook-content');
const i18n = I18n.keyset('new-workbooks');

type Props = {
    loadMoreEntries: () => void;
    loadMoreEntriesByScope: (entryScope: EntryScope) => void;
    retryLoadEntries: () => void;
    refreshEntries: (scope?: EntryScope) => void;
    scope?: EntryScope;
    mapTokens: Record<string, string>;
};

export const WorkbookContent = React.memo<Props>(
    ({
        loadMoreEntries,
        loadMoreEntriesByScope,
        retryLoadEntries,
        refreshEntries,
        scope,
        mapTokens,
    }) => {
        const workbook = useSelector(selectWorkbook);
        const entries = useSelector(selectWorkbookItems);
        const isEntriesLoading = useSelector(selectWorkbookEntriesIsLoading);
        const workbookEntriesError = useSelector(selectWorkbookEntriesError);

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
                    loadMoreEntriesByScope={loadMoreEntriesByScope}
                    mapTokens={mapTokens}
                />
                {footer}
            </React.Fragment>
        );
    },
);

WorkbookContent.displayName = 'WorkbookContent';
