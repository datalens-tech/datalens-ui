import {entriesActions} from './entries';
import {tenantActions} from './tenant';

export const actions = {
    ...entriesActions,
    ...tenantActions,
};
