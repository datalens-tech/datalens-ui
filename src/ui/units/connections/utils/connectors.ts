import type {ConnectorItem} from '../../../../shared/schema/types';

export const isConnectorInList = (connectors: ConnectorItem[], connType?: string) => {
    return connectors.findIndex((connector) => connector.conn_type === connType) !== -1;
};

const isMatchedByTypeOrAlias = (connector: ConnectorItem, type: string) => {
    const matchedByAlias = connector.alias && connector.alias === type;
    const matchedByType = connector.conn_type === type;
    return matchedByAlias || matchedByType;
};

export const getConnItemByType = (args: {connectors: ConnectorItem[]; type: string}) => {
    const {connectors, type} = args;

    return connectors.find((connector) => {
        let matchedWithIncludes = false;

        if (connector.includes) {
            matchedWithIncludes = connector.includes.some((includedConnector) => {
                return isMatchedByTypeOrAlias(includedConnector, type);
            });
        }

        return matchedWithIncludes || isMatchedByTypeOrAlias(connector, type);
    });
};
