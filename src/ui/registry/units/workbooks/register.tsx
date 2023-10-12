import {
    getNewDashUrl,
    getWorkbookDashboardEntryUrl,
} from '../../../units/workbooks/components/CreateEntryDialog/utils';
import {useAdditionalWorkbookEntryActions} from '../../../units/workbooks/components/EntryActions/utils';
import {getWorkbookEntryUrl} from '../../../units/workbooks/components/Table/WorkbookEntriesTable/utils';
import {useAdditionalWorkbookActions} from '../../../units/workbooks/components/WorkbookActions/utils';
import {getWorkbookTabs} from '../../../units/workbooks/components/WorkbookTabs/utils';
import {registry} from '../../index';

export const registerWorkbooksPlugins = () => {
    registry.workbooks.functions.register({
        getWorkbookTabs,
        getWorkbookEntryUrl,
        getWorkbookDashboardEntryUrl,
        getNewDashUrl,
        useAdditionalWorkbookEntryActions,
        useAdditionalWorkbookActions,
    });
};
