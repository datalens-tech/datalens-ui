import type React from 'react';

import type {ConnectorType} from 'shared';

export type BusinessConnectionLabel = {
    onClickRef: React.RefObject<{onClick: () => void}>;
    type: ConnectorType;
};
