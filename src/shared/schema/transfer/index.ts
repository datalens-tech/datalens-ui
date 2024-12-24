import {getServiceEndpoints} from '../../endpoints/schema';

import {actions} from './actions';

export default {
    actions,
    endpoints: getServiceEndpoints('transfer'),
    serviceName: 'transfer',
};
