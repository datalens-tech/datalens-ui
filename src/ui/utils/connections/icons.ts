import type {IconData} from '@gravity-ui/uikit';
import type {ConnectorIconData} from 'shared/schema/types';
import {DL} from 'ui/constants';

import {ConnectorAlias} from '../../constants';

import iconChOverYt from '../../assets/icons/connections/choveryt.svg';
import iconUndefined from '../../assets/icons/connections/undefined.svg';

const getBIConnectorIconData = (type?: string): ConnectorIconData | IconData | undefined => {
    return DL.CONNECTOR_ICONS.find((icon) => icon.conn_type === type);
};

export const getConnectorIconDataByAlias = (type?: string): IconData | undefined => {
    switch (type) {
        case ConnectorAlias.CHYT: {
            return iconChOverYt;
        }
        default: {
            return undefined;
        }
    }
};

export const getConnectorIconData = (
    type?: string,
    withoutDefault?: boolean,
): ConnectorIconData | IconData => {
    const iconData = getBIConnectorIconData(type);

    if (iconData) {
        return iconData;
    }

    return withoutDefault ? undefined : iconUndefined;
};
