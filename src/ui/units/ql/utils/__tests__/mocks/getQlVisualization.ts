import type {Shared} from 'shared';

export const MOCKED_PREDEFINED_VISUALIZATION = {
    id: 'column',
    placeholders: [],
    allowColors: true,
    allowLabels: false,
} as unknown as Shared['visualization'];

export const MOCKED_DEFAULT_VISUALIZATION = {
    id: 'column',
    placeholders: [],
    allowColors: true,
    allowLabels: true,
    colorsCapacity: 1,
} as unknown as Shared['visualization'];

export const MOCKED_LOADED_VISUALIZATION = {
    id: 'column',
    placeholders: [],
    allowColors: true,
    colorsCapacity: 1,
} as unknown as Shared['visualization'];

export const MOCKED_PREDEFINED_VISUALIZATION_WITH_OVERRIDE = {
    id: 'column',
    placeholders: [],
    allowColors: true,
    allowLabels: true,
} as unknown as Shared['visualization'];

export const MOCKED_LOADED_VISUALIZATION_WITH_PLACEHOLDERS = {
    id: 'column',
    placeholders: [{id: 'x', items: [{guid: 'x-field'}]}],
    allowColors: true,
} as unknown as Shared['visualization'];

export const MOCKED_INVALID_VISUALIZATION = {
    id: 'invalid_id',
    placeholders: [],
} as unknown as Shared['visualization'];
