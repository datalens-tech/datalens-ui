import _ from 'lodash';

import {createAction} from '../../gateway-utils';
import {filterUrlFragment} from '../../utils';
import type {GetPresetArgs, GetPresetResponse} from '../types';

const PATH_PREFIX = '/v1';

export const presetsActions = {
    getPreset: createAction<GetPresetResponse, GetPresetArgs>({
        method: 'GET',
        path: ({presetId}) => `${PATH_PREFIX}/presets/${filterUrlFragment(presetId)}`,
        params: (args, headers) => ({query: _.omit(args, 'presetId'), headers}),
    }),
};
