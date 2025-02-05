import get from 'lodash/get';

import {getDatasetLinks} from '../../../modules';
import type {ChartsConfig} from '../../../types';
import type {EntryFieldData, EntryFieldLinks} from '../../us/types';

type GetEntryLinksArgs = {
    data: EntryFieldData;
};

export function getEntryLinks(args: GetEntryLinksArgs) {
    const {data} = args;
    const links: EntryFieldLinks = {};

    if (typeof data?.meta === 'string') {
        try {
            const meta = JSON.parse(data.meta);
            const metaLinks = get(meta, 'links');

            if (Array.isArray(metaLinks)) {
                metaLinks.forEach((metaLink) => {
                    links[metaLink] = metaLink;
                });
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
