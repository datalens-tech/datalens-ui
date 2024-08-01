import {actions as connActions} from './connections';
import {actions as dsActions} from './datasets';
import {actions as oauthActions} from './oauth';

export const actions = {
    ...connActions,
    ...dsActions,
    ...oauthActions,
};
