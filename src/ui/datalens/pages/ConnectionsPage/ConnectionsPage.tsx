import React from 'react';
import {reducerRegistry} from '../../../store';
import connections from '../../../units/connections/store/reducers';
import ConnectionsApp from '../../../units/connections';

reducerRegistry.register({connections});

const NewConnectionsPage = () => <ConnectionsApp />;

export default NewConnectionsPage;
