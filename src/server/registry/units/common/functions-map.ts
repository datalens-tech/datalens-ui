import type {Request} from '@gravity-ui/expresskit';

import type {Palette} from '../../../../shared/constants/colors';
import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {ChartsEngine} from '../../../components/charts-engine';
import type {SourceConfig} from '../../../components/charts-engine/types';

import type {ExtendSandboxAPI} from './types';

export const commonFunctionsMap = {
    getAvailablePalettesMap: makeFunctionTemplate<() => Record<string, Palette>>(),
    getSourceAuthorizationHeaders:
        makeFunctionTemplate<
            (args: {
                chartsEngine: ChartsEngine;
                req: Request;
                sourceConfig: SourceConfig;
                subrequestHeaders: Record<string, string>;
            }) => Record<string, string>
        >(),
    isEntryId: makeFunctionTemplate<(value: string) => boolean>(),
    extractEntryId: makeFunctionTemplate<(value?: string) => string | null>(),
    extendSandboxAPI: makeFunctionTemplate<ExtendSandboxAPI>(),
} as const;
