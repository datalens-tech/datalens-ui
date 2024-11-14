import type {ReactElement} from 'react';

import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';
import type {SelectorElementType} from 'ui/store/typings/controlDialog';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

import type {BeforeCloseDialogItemAction} from './types/BeforeCloseDialogItem';
import type {BeforeOpenDialogItemAction} from './types/BeforeOpenDialogItem';
import type {GetExtendedItemData} from './types/GetExtendedItemData';

export const dashFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getCaptionText: makeFunctionTemplate<() => string>(),
    getDashEntryUrl: makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    getNewDashUrl: makeFunctionTemplate<(workbookId?: string) => string>(),
    getMinAutoupdateInterval: makeFunctionTemplate<() => number>(),
    getExtendedItemData: makeFunctionTemplate<GetExtendedItemData>({
        isReduxThunkActionTemplate: true,
    }),
    useExtendedValueSelector:
        makeFunctionTemplate<
            (controlType: SelectorElementType | undefined) => ReactElement | null
        >(),
    beforeOpenDialogItem: makeFunctionTemplate<BeforeOpenDialogItemAction>({
        isReduxThunkActionTemplate: true,
    }),
    beforeCloseDialogItem: makeFunctionTemplate<BeforeCloseDialogItemAction>({
        isReduxThunkActionTemplate: true,
    }),
} as const;
