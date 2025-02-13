import get from 'lodash/get';
import isPlainObject from 'lodash/isPlainObject';

import {getDatasetLinks} from '../../../../modules';
import type {ChartsConfig} from '../../../../types';
import type {EntryFieldData, EntryFieldLinks} from '../../../us/types';

export * from './validation';

type GetEntryLinksArgs = {
    data: EntryFieldData;
};

function extractLinks(obj: object, links: NonNullable<EntryFieldLinks>) {
    Object.values(obj).forEach((value) => {
        if (isPlainObject(value)) {
            extractLinks(value, links);
        } else if (typeof value === 'string') {
            // eslint-disable-next-line no-param-reassign
            links[value] = value;
        }
    });
}

export function getEntryLinks(args: GetEntryLinksArgs) {
    const {data} = args;
    const links: EntryFieldLinks = {};

    if (typeof data?.meta === 'string') {
        try {
            const meta = JSON.parse(data.meta);
            const metaLinks = get(meta, 'links');

            if (isPlainObject(metaLinks)) {
                extractLinks(metaLinks, links);
            }

            return links;
        } catch (e) {}
    }

    if (typeof data?.shared === 'string') {
        try {
            const shared = JSON.parse(data.shared);

            const datasetIds = get(shared, 'datasetsIds');
            if (datasetIds) {
                Object.assign(links, getDatasetLinks(shared as ChartsConfig));
            }

            const connectionEntryId = get(shared, 'connection.entryId');
            if (connectionEntryId) {
                links.connection = connectionEntryId;
            }
        } catch (e) {}
    }

    return links;
}
