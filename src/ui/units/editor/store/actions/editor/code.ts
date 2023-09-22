export const EDITOR_CODE_CHANGE = Symbol('editor/code/EDITOR_CODE_CHANGE');
type ChangeEditorCodeAction = {
    type: typeof EDITOR_CODE_CHANGE;
    payload: {
        scriptId: string;
        value: string;
    };
};
export const changeEditorCode = (
    payload: ChangeEditorCodeAction['payload'],
): ChangeEditorCodeAction => ({
    type: EDITOR_CODE_CHANGE,
    payload,
});

export type CodeActions = ChangeEditorCodeAction;
