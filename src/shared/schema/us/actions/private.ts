import {createAction} from '../../gateway-utils';
import {EnsurePersonalFolderIsPresentResponse} from '../types';

const PATH_PREFIX = '/private';

export const privateActions = {
    _ensurePersonalFolderIsPresent: createAction<EnsurePersonalFolderIsPresentResponse>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/ensurePersonalFolderPresent`,
        params: (_, headers) => ({headers}),
    }),
};
