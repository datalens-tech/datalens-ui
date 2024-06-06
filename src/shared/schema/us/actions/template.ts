import {TIMEOUT_60_SEC} from '../../../constants';
import {createAction} from '../../gateway-utils';
import type {CopyTemplateArgs, CopyTemplateResponse} from '../types';

const PATH_PREFIX = '/v1';

export const templateActions = {
    copyTemplate: createAction<CopyTemplateResponse, CopyTemplateArgs>({
        method: 'POST',
        path: () => `${PATH_PREFIX}/copyTemplate`,
        params: (body, headers) => ({body, headers}),
        timeout: TIMEOUT_60_SEC,
    }),
};
