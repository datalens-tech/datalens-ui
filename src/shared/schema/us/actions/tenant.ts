import {createAction} from '../../gateway-utils';
import type {SetDefaultColorPaletteArgs, SetDefaultColorPaletteResponse} from '../types';

const PATH_PREFIX = '/v1/tenants';

export const tenantActions = {
    setDefaultColorPalette: createAction<
        SetDefaultColorPaletteResponse,
        SetDefaultColorPaletteArgs
    >({
        method: 'POST',
        path: () => `${PATH_PREFIX}/set-default-color-palette`,
        params: (body, headers) => ({
            body,
            headers,
        }),
    }),
};
