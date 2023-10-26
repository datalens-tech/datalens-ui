import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

export const getDashEntryUrl = (response: EntryDialogOnCloseArg) => {
    return `/${response.data?.entryId}`;
};

export const getNewDashUrl = (workbookId?: string) => {
    return `/workbooks/${workbookId}/dashboards`;
};
