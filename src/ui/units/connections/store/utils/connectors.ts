import {ConnectorType} from '../../../../../shared';
import type {ConnectorItem, GetConnectorsResponse} from '../../../../../shared/schema/types';

export const getFlattenConnectors = (groupedConnectors: GetConnectorsResponse) => {
    return (Object.keys(groupedConnectors) as Array<keyof GetConnectorsResponse>).reduce<
        ConnectorItem[]
    >((acc, key) => {
        switch (key) {
            case 'uncategorized': {
                const connectors = groupedConnectors[key] || [];
                acc.push(...connectors);
                break;
            }
            case 'sections': {
                groupedConnectors[key]?.forEach(({connectors}) => {
                    acc.push(...connectors);
                });
                break;
            }
            case 'result': {
                // In case of using old API without uncategorized & sections properties
                if (Object.keys(groupedConnectors).length === 1) {
                    const connectors = groupedConnectors[key];
                    acc.push(...connectors);
                }
                break;
            }
        }
        return acc;
    }, []);
};

export const getConnectorItemFromFlattenList = (
    flattenConnectors: ConnectorItem[],
    type: ConnectorType,
) => {
    const resultConnector = flattenConnectors.find((connector) => {
        if (connector.conn_type === ConnectorType.__Meta__) {
            return connector.includes?.some((included) => included.conn_type === type);
        }
        return connector.conn_type === type;
    });

    if (resultConnector?.conn_type === ConnectorType.__Meta__ && resultConnector?.includes) {
        return resultConnector.includes.find((connector) => connector.conn_type === type);
    }

    return resultConnector;
};
