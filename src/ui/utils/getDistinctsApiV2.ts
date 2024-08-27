import type {
    GetDistinctsApiV2Args,
    GetDistinctsApiV2TransformedResponse,
} from 'shared/schema/types';
import {Feature} from 'shared/types';
import {getSdk} from 'ui/libs/schematic-sdk';

import Utils from './utils';

export const fetchDistinctsByApi = (
    params: GetDistinctsApiV2Args,
): Promise<GetDistinctsApiV2TransformedResponse> => {
    return Utils.isEnabledFeature(Feature.UsePublicDistincts)
        ? getSdk().bi.getPublicDistinctsApiV2(params)
        : getSdk().bi.getDistinctsApiV2(params);
};
