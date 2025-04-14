import type {MonacoTypes} from '../../../../libs/monaco';

export function getEditorDefaultOptions(): MonacoTypes.editor.IEditorConstructionOptions {
    return {
        fontSize: 13,
        selectOnLineNumbers: true,
        minimap: {
            enabled: false,
        },
        lightbulb: {
            enabled: false,
        },
        automaticLayout: true,
    };
}

export function getEditorDiffDefaultOptions(): MonacoTypes.editor.IDiffEditorConstructionOptions {
    return {
        fontSize: 13,
        readOnly: true,
        renderSideBySide: false,
        minimap: {
            enabled: false,
        },
        lightbulb: {
            enabled: false,
        },
    };
}
