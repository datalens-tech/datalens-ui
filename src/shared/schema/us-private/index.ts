import type {BaseSchema} from '@gravity-ui/gateway';

import {registry} from '../../../server/registry';
import {getServiceEndpoints} from '../../endpoints/schema';

import {actions} from './actions';

export default {
    actions,
    endpoints: getServiceEndpoints('us'),
    serviceName: 'us-private',
    getAuthHeaders: (params) => {
        const {getAuthHeadersUSPrivate} = registry.common.auth.getAll();
        return getAuthHeadersUSPrivate(params);
    },
} satisfies BaseSchema[string];
