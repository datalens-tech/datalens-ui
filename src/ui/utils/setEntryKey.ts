import {ENTRY_TYPES, EntryScope} from 'shared';
import type {SetEntryKey} from 'ui/registry/units/common/types/functions/setEntryKey';
import {getStore} from 'ui/store';
import {setIsRenameWithoutReload} from 'ui/store/actions/entryContent';
import {setConnectionKey} from 'ui/units/connections/store';
import {renameDash} from 'ui/units/dash/store/actions/dashTyped';
import {renameDataset} from 'ui/units/datasets/store/actions/creators';
import {setQlEntryKey} from 'ui/units/ql/store/actions/ql';
import {setWizardWidgetKey} from 'ui/units/wizard/actions/widget';

export const setEntryKey: SetEntryKey = async ({scope, type, key, withRouting = true}) => {
    const store = getStore();

    // double dispatch is associated with disabling the exit page dialog (NavigationPrompt)
    if (withRouting) {
        store.dispatch(setIsRenameWithoutReload(true));
    }
    switch (scope) {
        case EntryScope.Dash:
            store.dispatch(renameDash(key));
            break;
        case EntryScope.Connection:
            store.dispatch(setConnectionKey(key));
            break;
        case EntryScope.Dataset:
            store.dispatch(renameDataset(key));
            break;
        case EntryScope.Widget: {
            if (ENTRY_TYPES.wizard.includes(type)) {
                store.dispatch(setWizardWidgetKey(key));
            } else if (ENTRY_TYPES.ql.includes(type)) {
                store.dispatch(setQlEntryKey(key));
            }
            break;
        }
    }
    if (withRouting) {
        store.dispatch(setIsRenameWithoutReload(false));
    }
};
