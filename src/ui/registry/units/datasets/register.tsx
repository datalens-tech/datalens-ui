import {renderRLSDialog} from 'ui/units/datasets/components/RLSDialog/RLSDialog';

import {registry} from '../..';

export const registerDatasetPlugins = () => {
    registry.datasets.functions.register({
        renderRLSDialog,
    });
};
