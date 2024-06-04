import type {DLUserSettings} from '../../../types';
import {createAction} from '../../gateway-utils';

const PATH_PREFIX = '/v1';

export const userActions = {
    updateUserSettings: createAction<
        {userSettings: DLUserSettings},
        {newSettings: Partial<DLUserSettings>}
    >({
        method: 'POST',
        path: () => `${PATH_PREFIX}/userSettings`,
        params: (body, headers) => ({body, headers}),
    }),
    getUserSettings: createAction<{userSettings: DLUserSettings}>({
        method: 'GET',
        path: () => `${PATH_PREFIX}/userSettings`,
        params: (_, headers) => ({headers}),
    }),
};
