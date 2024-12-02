import type {
    CollectChartkitStatsArgs,
    CollectDashStatsArgs,
    GetDistinctsApiV2Args,
    GetDistinctsApiV2InfoHeadersArg,
    GetDistinctsApiV2TransformedResponse,
} from 'shared/schema/types';
import {Feature} from 'shared/types';
import {DL} from 'ui/constants/common';
import {getSdk} from 'ui/libs/schematic-sdk';

import Utils from './utils';

export const fetchDistinctsByApi = (
    params: GetDistinctsApiV2Args,
    headers?: GetDistinctsApiV2InfoHeadersArg,
): Promise<GetDistinctsApiV2TransformedResponse> => {
    return Utils.isEnabledFeature(Feature.UsePublicDistincts)
        ? getSdk().bi.getPublicDistinctsApiV2(params, {headers})
        : getSdk().bi.getDistinctsApiV2(params, {headers});
};

export const fetchBatchRenderedMarkdown = (texts: Record<string, string>) => {
    return getSdk().mix.batchRenderMarkdown({
        texts,
        lang: DL.USER_LANG,
    });
};

export const fetchRenderedMarkdown = (text: string) => {
    return getSdk().mix.renderMarkdown({
        text,
        lang: DL.USER_LANG,
    });
};

export const requestCollectDashStats = (dashStats: CollectDashStatsArgs) => {
    return getSdk().mix.collectDashStats(dashStats);
};

export const requestCollectChartkitStats = (chartkitStats: CollectChartkitStatsArgs) => {
    return getSdk().mix.collectChartkitStats(chartkitStats);
};
