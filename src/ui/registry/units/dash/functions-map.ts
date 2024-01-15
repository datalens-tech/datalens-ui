import type {ReactElement} from 'react';

import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {SelectorElementType} from '../../../units/dash/store/actions/dashTyped';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

import type {BeforeCloseItemDialogAction} from './types/BeforeCloseItemDialog';
import type {BeforeOpenItemDialogAction} from './types/BeforeOpenItemDialog';
import type {GetExtendedItemData} from './types/GetExtendedItemData';

export const dashFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getCaptionText: makeFunctionTemplate<() => string>(),
    getDashEntryUrl: makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    getNewDashUrl: makeFunctionTemplate<(workbookId?: string) => string>(),
    getMinAutoupdateInterval: makeFunctionTemplate<() => number>(),
    getExtendedItemData: makeFunctionTemplate<GetExtendedItemData>(),
    useExtendedValueSelector:
        makeFunctionTemplate<
            (controlType: SelectorElementType | undefined) => ReactElement | null
        >(),
    beforeOpenItemDialog: makeFunctionTemplate<BeforeOpenItemDialogAction>(),
    beforeCloseItemDialog: makeFunctionTemplate<BeforeCloseItemDialogAction>(),
} as const;
