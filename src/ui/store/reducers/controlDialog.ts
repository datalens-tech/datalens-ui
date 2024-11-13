export interface ControlDialogState {
    activeSelectorIndex: number;
}

const getInitialState = (): ControlDialogState => ({
    activeSelectorIndex: 0,
});

type EntryContentAction = any;

export function controlDialog(
    state: ControlDialogState = getInitialState(),
    _action: EntryContentAction,
): ControlDialogState {
    return state;
}
