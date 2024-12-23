import type {Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';

import type {Palette} from '../../../../shared/constants/colors';
import type {GetEntryByKeyResponse} from '../../../../shared/schema';
import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {SourceConfig} from '../../../components/charts-engine/types';

export const commonFunctionsMap = {
    getAvailablePalettesMap: makeFunctionTemplate<() => Record<string, Palette>>(),
    getSourceAuthorizationHeaders:
        makeFunctionTemplate<
            (args: {
                ctx: AppContext;
                sourceConfig: SourceConfig;
                subrequestHeaders: Record<string, string>;
            }) => Record<string, string>
        >(),
    isEntryId: makeFunctionTemplate<(value: string) => boolean>(),
    extractEntryId: makeFunctionTemplate<(value?: string) => string | null>(),
    handleEntryRedirect:
        makeFunctionTemplate<(entry: GetEntryByKeyResponse, res: Response) => void>(),
} as const;
