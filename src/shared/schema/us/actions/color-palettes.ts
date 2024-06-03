import {createAction} from '../../gateway-utils';
import type {
    CreateColorPaletteArgs,
    CreateColorPaletteResponse,
    DeleteColorPaletteArgs,
    DeleteColorPaletteResponse,
    GetColorPalettesListArgs,
    GetColorPalettesListResponse,
    UpdateColorPaletteArgs,
    UpdateColorPaletteResponse,
} from '../types';

const PATH_PREFIX = '/v1/color-palettes';

export const colorPalettesActions = {
    createColorPalette: createAction<CreateColorPaletteResponse, CreateColorPaletteArgs>({
        method: 'POST',
        path: () => PATH_PREFIX,
        params: (body, headers) => ({
            body,
            headers,
        }),
    }),

    getColorPalettesList: createAction<GetColorPalettesListResponse, GetColorPalettesListArgs>({
        method: 'GET',
        path: () => PATH_PREFIX,
        params: (_args, headers) => ({
            headers,
        }),
    }),

    updateColorPalette: createAction<UpdateColorPaletteResponse, UpdateColorPaletteArgs>({
        method: 'POST',
        path: ({colorPaletteId}) => `${PATH_PREFIX}/${colorPaletteId}/update`,
        params: (body, headers) => ({body, headers}),
    }),

    deleteColorPalette: createAction<DeleteColorPaletteResponse, DeleteColorPaletteArgs>({
        method: 'DELETE',
        path: ({colorPaletteId}) => `${PATH_PREFIX}/${colorPaletteId}`,
        params: (_, headers) => ({headers}),
    }),
};
