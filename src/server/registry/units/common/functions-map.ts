import type {Request, Response} from '@gravity-ui/expresskit';

import type {Palette} from '../../../../shared/constants/colors';
import type {GetEntryByKeyResponse} from '../../../../shared/schema';
import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {ChartsEngine} from '../../../components/charts-engine';
import type {SourceConfig} from '../../../components/charts-engine/types';

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
    handleEntryRedirect:
        makeFunctionTemplate<(entry: GetEntryByKeyResponse, res: Response) => void>(),
} as const;
