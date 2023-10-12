import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

export const getWorkbookDashboardEntryUrl = (response: EntryDialogOnCloseArg) => {
    return `/${response.data?.entryId}`;
};

export const getNewDashUrl = () => {
    return '/dashboards/new';
};
