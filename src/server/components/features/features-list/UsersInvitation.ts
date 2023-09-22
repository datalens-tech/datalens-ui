import {Feature} from '../../../../shared';
import {createFeatureConfig} from '../utils';

export default createFeatureConfig({
    name: Feature.UsersInvitation,
    state: {
        development: true,
        production: true,
    },
});
