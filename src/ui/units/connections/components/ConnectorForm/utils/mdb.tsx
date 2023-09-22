import type {MdbAvailableDatabase} from 'shared';
import {DL} from 'ui';

import {MDB_SERVICES} from '../../../constants';

export const getClusterPageLink = (opt: {
    dbType: MdbAvailableDatabase;
    clusterId?: string;
    folderId?: string;
    section?: 'hosts' | 'users' | 'databases';
}) => {
    const {dbType, clusterId, section, folderId = DL.CURRENT_TENANT_ID} = opt;
    const endpoint = DL.ENDPOINTS.console;
    const pathToServicePage = `${endpoint}/folders/${folderId}/${MDB_SERVICES[dbType]}`;

    if (clusterId && section) {
        return `${pathToServicePage}/cluster/${clusterId}?section=${section}`;
    }

    return pathToServicePage;
};
