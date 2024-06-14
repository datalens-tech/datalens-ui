import type {DashKitProps} from '@gravity-ui/dashkit';
import type {StringParams} from 'shared';
import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

import {stringifyMemoize} from '../modules/helpers';

export const getDashEntryUrl = (response: EntryDialogOnCloseArg) => {
    return `/${response.data?.entryId}`;
};

export const getNewDashUrl = (workbookId?: string) => {
    return `/workbooks/${workbookId}/dashboards`;
};

export const getUrlGlobalParams = stringifyMemoize<DashKitProps['globalParams']>(
    (search: string, globalParams: StringParams) => {
        if (!search || !globalParams) {
            return {};
        }
        const searchParams = new URLSearchParams(search);
        return Object.keys(globalParams).reduce(
            (result, key) =>
                searchParams.has(key) ? {...result, [key]: searchParams.getAll(key)} : result,
            {},
        );
    },
);
