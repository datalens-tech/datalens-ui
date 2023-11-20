import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

export const dashFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getCaptionText: makeFunctionTemplate<() => string>(),
    getDashEntryUrl: makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    getNewDashUrl: makeFunctionTemplate<(workbookId?: string) => string>(),
    getMinAutoupdateInterval: makeFunctionTemplate<() => number>(),
} as const;
