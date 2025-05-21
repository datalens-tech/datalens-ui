import {useCreateEntryOptions} from '../../../units/workbooks/components/CreateEntry/utils';
import {
    getNewDashUrl,
    getWorkbookDashboardEntryUrl,
} from '../../../units/workbooks/components/CreateEntryDialog/utils';
import {getText} from '../../../units/workbooks/components/EmptyWorkbook/utils';
import {useAdditionalWorkbookEntryActions} from '../../../units/workbooks/components/EntryActions/utils';
import {getWorkbookEntryUrl} from '../../../units/workbooks/components/Table/WorkbookEntriesTable/utils';
import {useAdditionalWorkbookActions} from '../../../units/workbooks/components/WorkbookActions/utils';
import {getWorkbookTabs} from '../../../units/workbooks/components/WorkbookTabs/utils';
import {checkWbCreateEntryButtonVisibility} from '../../../units/workbooks/utils/entry';
import {registry} from '../../index';

export const registerWorkbooksPlugins = () => {
    registry.workbooks.functions.register({
        checkWbCreateEntryButtonVisibility,
        getWorkbookTabs,
        getWorkbookEntryUrl,
        getWorkbookDashboardEntryUrl,
        getNewDashUrl,
        useAdditionalWorkbookEntryActions,
        useAdditionalWorkbookActions,
        useCreateEntryOptions,
        getWorkbookEmptyStateTexts: getText,
    });
};
