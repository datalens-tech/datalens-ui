import {cloneDeep, unset} from 'lodash';
import type {GetRelationsEntry} from 'shared/schema';

/**
 * @param{object} obj object for filter
 * @param {Array<string>} keys paths to object fields to be deleted
 * @returns {object} filtered object
 */
export const getFilteredObject = <T = unknown>(obj: T, keys: string[]) => {
    const result = cloneDeep(obj);

    keys.forEach((key) => {
        unset(result, key);
    });

    return result;
};

// TODO: CHARTS-7304
export const getSelectedValueForSelect = (value: string[], valueList: string[]): string[] => {
    const map = value.reduce(
        (acc, s) => {
            acc[s] = true;
            return acc;
        },
        {} as Record<string, boolean>,
    );

    return valueList.filter((v) => map[v]);
};

export const groupEntitiesByScope = <T = GetRelationsEntry>(relations: ({scope: string} & T)[]) => {
    const relationsByScope: Record<string, T[]> = {};

    relations.forEach((relation) => {
        if (!relationsByScope[relation.scope]) {
            relationsByScope[relation.scope] = [];
        }

        relationsByScope[relation.scope].push(relation);
    });

    return relationsByScope;
};

export const matchFieldFilter = (
    filter: string,
    dlDebugMode: boolean,
    {title, description, guid}: {title: string; description?: string; guid?: string},
) => {
    const filterValue = filter.toLowerCase();

    return Boolean(
        title.toLowerCase().includes(filterValue) ||
            description?.toLowerCase().includes(filterValue) ||
            (dlDebugMode && guid?.includes(filterValue)),
    );
};
