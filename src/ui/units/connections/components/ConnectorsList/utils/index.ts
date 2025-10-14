import {CONNECTOR_VISIBILITY_MODE} from 'shared';

import type {ConnectorItem} from '../../../../../../shared/schema';

export const getConnectorListItemUrl = (args: {connector: ConnectorItem; workbookId?: string}) => {
    const {connector, workbookId} = args;
    const {search = ''} = window.location;
    const type = connector.alias || connector.conn_type;
    let url = `/connections/new/${type}${search}`;

    if (workbookId) {
        url = `/workbooks/${workbookId}` + url;
    }

    return url;
};

export const getVisibleConnectors = (connectors: ConnectorItem[]) => {
    return connectors.filter(({hidden, visibility_mode}) => {
        return visibility_mode
            ? visibility_mode === CONNECTOR_VISIBILITY_MODE.FREE ||
                  visibility_mode === CONNECTOR_VISIBILITY_MODE.BUSINESS
            : typeof hidden === 'boolean' && !hidden;
    });
};

// TODO: add unit test [CHARTS-5033]
export const getFilteredConnectors = (connectors: ConnectorItem[] = [], search = '') => {
    const visibleConnectors = getVisibleConnectors(connectors);

    if (search) {
        return visibleConnectors.filter(({conn_type}) => {
            return conn_type.toLowerCase().includes(search.toLowerCase().replace(/\s+/g, ''));
        });
    }

    return visibleConnectors;
};
