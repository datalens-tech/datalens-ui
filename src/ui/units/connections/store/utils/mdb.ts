import {SelectOption} from '@gravity-ui/uikit';

import type {
    MdbBaseEntry,
    MdbClusterEntry,
    MdbEntryWithId,
    MdbHostEntry,
    YdbDatabase,
} from '../typings';

const ZOOKEEPER_HOST_TYPE = 'ZOOKEEPER';

export const shapeItemsWithId = (clusters: MdbEntryWithId[]) => {
    return clusters.map(
        ({id, name}): SelectOption => ({
            value: id,
            data: {
                description: `id: ${id}`,
            },
            content: name,
        }),
    );
};

export const shapeClusterItems = (items: (MdbClusterEntry | MdbEntryWithId)[]): SelectOption[] => {
    return items.map((item): SelectOption => {
        const {id, name} = item;
        let extra: MdbClusterEntry['config'] | undefined;

        if ('config' in item) {
            const {sqlDatabaseManagement, sqlUserManagement} = item.config;
            extra = {
                sqlDatabaseManagement,
                sqlUserManagement,
            };
        }

        return {
            value: id,
            data: {
                description: `id: ${id}`,
                extra,
            },
            content: name,
        };
    });
};

export const shapeHostItems = (hosts: MdbHostEntry[]) => {
    return hosts
        .filter(({type}) => type !== ZOOKEEPER_HOST_TYPE)
        .map(
            ({name}): SelectOption => ({
                value: name,
                content: name,
            }),
        );
};

export const shapeBaseEntryItems = (entries: MdbBaseEntry[]) => {
    return entries.map(
        ({name}): SelectOption => ({
            value: name,
            content: name,
        }),
    );
};

export const shapeYdbDatabaseItems = (databses: YdbDatabase[]) => {
    return databses.map(
        ({id, name, endpoint}): SelectOption => ({
            value: id,
            data: {
                description: endpoint,
            },
            content: name,
        }),
    );
};
