import get from 'lodash/get';

import {getDatasetLinks} from '../../../modules';
import type {ChartsConfig} from '../../../types';
import type {EntryFieldData, EntryFieldLinks} from '../../us/types';

type GetEntryLinksArgs = {
    data: EntryFieldData;
};

export function getEntryLinks(args: GetEntryLinksArgs) {
    const {data} = args;

    if (data?.shared) {
        try {
            const shared = JSON.parse(data.shared as string);
            const links: EntryFieldLinks = {};

            const datasetIds = get(shared, 'datasetsIds');
            if (datasetIds) {
                Object.assign(links, getDatasetLinks(shared as ChartsConfig));
            }

            const connectionEntryId = get(shared, 'connection.entryId');
            if (connectionEntryId) {
                links.connection = connectionEntryId;
            }

            return links;
        } catch (e) {
            return {};
        }
    }

    return {};
}
