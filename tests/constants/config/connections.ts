import {ConnectionsNames, ConnectionsUrls} from 'constants/test-entities/connections';
import {ConnectionsParametrizationConfig} from 'types/config/connections';

export const connections: ConnectionsParametrizationConfig = {
    urls: {
        Connection: ConnectionsUrls.Connection,
    },
    names: {
        Connection: ConnectionsNames.Connection,
    },
};
