import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.EnableBIConnectorIcons,
    state: {
        development: true,
        production: false,
    },
});
