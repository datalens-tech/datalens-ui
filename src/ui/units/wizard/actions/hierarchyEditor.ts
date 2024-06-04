import type {HierarchyField} from 'shared';

export const OPEN_HIERARCHY_EDITOR = Symbol('wizard/hierarchyEditor/OPEN_HIERARCHY_EDITOR');
export const CLOSE_HIERARCHY_EDITOR = Symbol('wizard/hierarchyEditor/CLOSE_HIERARCHY_EDITOR');

interface OpenHierarchyEditor {
    type: typeof OPEN_HIERARCHY_EDITOR;
    hierarchy?: HierarchyField;
}

interface CloseHierarchyEditor {
    type: typeof CLOSE_HIERARCHY_EDITOR;
}

export function openHierarchyEditor(hierarchy?: HierarchyField): OpenHierarchyEditor {
    return {
        type: OPEN_HIERARCHY_EDITOR,
        hierarchy,
    };
}

export function closeHierarchyEditor(): CloseHierarchyEditor {
    return {
        type: CLOSE_HIERARCHY_EDITOR,
    };
}

export type HierarchyEditorAction = OpenHierarchyEditor | CloseHierarchyEditor;
