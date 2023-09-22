import {PreparedRowItem} from 'ui/units/connections/components/ConnectorForm/FormRow/PreparedRowItem';

import {registry} from '../../../registry';

export const registerConnectionsPlugins = () => {
    registry.connections.components.registerMany({
        PreparedRowItem,
    });
};
