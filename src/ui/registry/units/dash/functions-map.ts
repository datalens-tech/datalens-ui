import type {ReactElement} from 'react';

import type {ConfigItem} from '@gravity-ui/dashkit';
import type {EntryDialogOnCloseArg} from 'ui/components/EntryDialogues/types';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';
import type {
    SelectorElementType,
    SetItemDataArgs,
} from '../../../units/dash/store/actions/dashTyped';
import {EXAMPLE_FUNCTION} from '../common/constants/functions';

export const dashFunctionsMap = {
    [EXAMPLE_FUNCTION]: makeFunctionTemplate<(arg: number) => string>(),
    getCaptionText: makeFunctionTemplate<() => string>(),
    getDashEntryUrl: makeFunctionTemplate<(response: EntryDialogOnCloseArg) => string>(),
    getNewDashUrl: makeFunctionTemplate<(workbookId?: string) => string>(),
    getMinAutoupdateInterval: makeFunctionTemplate<() => number>(),
    getExtendedItemData: makeFunctionTemplate<(args: SetItemDataArgs) => SetItemDataArgs>(),
    useExtendedValueSelector:
        makeFunctionTemplate<
            (controlType: SelectorElementType | undefined) => ReactElement | null
        >(),
    beforeOpenItemDialog: makeFunctionTemplate<(data: ConfigItem) => void>(),
} as const;
