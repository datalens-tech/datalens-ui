import {ConnectionsNames, ConnectionsUrls} from 'constants/test-entities/connections';
import {ConnectionsParametrizationConfig} from 'types/config/connections';

export const connections: ConnectionsParametrizationConfig = {
    urls: {
        ConnectionPostgreSQL: ConnectionsUrls.ConnectionPostgreSQL,
    },
    names: {
        ConnectionPostgreSQL: ConnectionsNames.ConnectionPostgreSQL,
    },
};
