import {actions as connActions} from './connections';
import {actions as dsActions} from './datasets';

export const actions = {
    ...connActions,
    ...dsActions,
};
