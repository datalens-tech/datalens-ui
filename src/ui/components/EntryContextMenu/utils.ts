import {ENTRY_TYPES, EntryScope} from 'shared';
import type {SetEntryKey} from 'ui/registry/units/common/types/functions/setEntryKey';
import {getStore} from 'ui/store';
import {setIsRenameWithoutReload} from 'ui/store/actions/entryContent';
import {setConnectionKey} from 'ui/units/connections/store';
import {renameDash} from 'ui/units/dash/store/actions/dashTyped';
import {renameDataset} from 'ui/units/datasets/store/actions/creators';
import {setEditorEntryKey} from 'ui/units/editor/store/actions';
import {setQlEntryKey} from 'ui/units/ql/store/actions/ql';
import {setWizardWidgetKey} from 'ui/units/wizard/actions/widget';

import type {ContextMenuItem} from './types';

export const getAdditionalEntryContextMenuItems = (): ContextMenuItem[] => {
    return [];
};

export const setEntryKey: SetEntryKey = async ({scope, type, key}) => {
    const store = getStore();

    // double dispatch is associated with disabling the exit page dialog (NavigationPrompt)
    store.dispatch(setIsRenameWithoutReload(true));
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
            } else if (ENTRY_TYPES.editor.includes(type)) {
                store.dispatch(setEditorEntryKey(key));
            } else {
                window.location.reload();
            }
            break;
        }
        default:
            window.location.reload();
            break;
    }
    store.dispatch(setIsRenameWithoutReload(false));
};
