import {PreparedRowItem} from 'ui/units/connections/components/ConnectorForm/FormRow/PreparedRowItem';
import {getFakeEntry} from 'ui/units/connections/store/utils/entry';
import {getNewConnectionDestination} from 'ui/units/connections/utils/entry';

import {registry} from '../../../registry';

export const registerConnectionsPlugins = () => {
    registry.connections.components.registerMany({
        PreparedRowItem,
    });
    registry.connections.functions.register({
        getFakeEntry,
        getNewConnectionDestination,
    });
};
