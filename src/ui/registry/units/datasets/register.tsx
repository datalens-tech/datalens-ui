import React from 'react';

import RLSDialog from 'ui/units/datasets/components/RLSDialog/RLSDialog';

import {registry} from '../..';

export const registerConnectionsPlugins = () => {
    registry.datasets.functions.register({
        renderRLSDialog: (props) => {
            return <RLSDialog {...props} />;
        },
    });
};
