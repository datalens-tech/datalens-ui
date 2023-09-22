import {HierarchyField} from '../../../../shared/types/wizard';
import {ResetWizardStoreAction} from '../actions';
import {
    CLOSE_HIERARCHY_EDITOR,
    HierarchyEditorAction,
    OPEN_HIERARCHY_EDITOR,
} from '../actions/hierarchyEditor';

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
