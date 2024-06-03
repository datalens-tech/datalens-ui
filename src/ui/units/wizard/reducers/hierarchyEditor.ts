import type {HierarchyField} from '../../../../shared/types/wizard';
import type {ResetWizardStoreAction} from '../actions';
import type {HierarchyEditorAction} from '../actions/hierarchyEditor';
import {CLOSE_HIERARCHY_EDITOR, OPEN_HIERARCHY_EDITOR} from '../actions/hierarchyEditor';

export interface HierarchyEditorState {
    hierarchy: HierarchyField | undefined;
    visible: boolean;
}

const initialState: HierarchyEditorState = {
    hierarchy: undefined,
    visible: false,
};

export function hierarchyEditor(
    state: HierarchyEditorState = initialState,
    action: HierarchyEditorAction | ResetWizardStoreAction,
): HierarchyEditorState {
    switch (action.type) {
        case OPEN_HIERARCHY_EDITOR: {
            return {
                ...state,
                hierarchy: action.hierarchy,
                visible: true,
            };
        }
        case CLOSE_HIERARCHY_EDITOR: {
            return {
                ...state,
                hierarchy: undefined,
                visible: false,
            };
        }
        default:
            return state;
    }
}
