import {ENTRY_TYPES, EntryScope, getEntryNameByKey, makeSlugName} from 'shared';
import {isEditorEntryType} from 'shared/utils/entry';
import {URL_QUERY} from 'ui/constants';

import type {GetUIEntryRouteArgs} from '../registry/units/common/types/functions/getUIEntryRoute';

export const getUrlParamFromStr = (search: string, paramName: string) => {
    const searchParams = new URLSearchParams(search);
    return searchParams.get(paramName);
};

export function getUIEntryRoute({entry, origin, endpoints}: GetUIEntryRouteArgs) {
    const {entryId, scope, type, key} = entry;

    const defaultUrl = `${endpoints.navigation}/${entryId}`;
    const name = getEntryNameByKey({key});

    const slugName = makeSlugName(entryId, name);

    const url = (() => {
        switch (scope) {
            case EntryScope.Connection:
                return `${endpoints.connections}/${slugName}`;
            case EntryScope.Dataset:
                return `${endpoints.dataset}/${slugName}`;
            case EntryScope.Dash:
                return `/${slugName}`;
            case EntryScope.Widget:
                if (isEditorEntryType(type)) {
                    return `${endpoints.editor}/${slugName}`;
                }

                if (ENTRY_TYPES.ql.includes(type)) {
                    return `${endpoints.ql}/${slugName}`;
                }

                if (ENTRY_TYPES.wizard.includes(type)) {
                    return `${endpoints.wizard}/${slugName}`;
                }

                return defaultUrl;
            default:
                return defaultUrl;
        }
    })();

    return new URL(url, origin).toString();
}

export const isUnreleasedByUrlParams = (search: string) => {
    return (
        getUrlParamFromStr(search, URL_QUERY.UNRELEASED) === '1' &&
        !getUrlParamFromStr(search, URL_QUERY.REV_ID)
    );
};
