export const PANES_SWITCH = Symbol('editor/panes/PANES_SWITCH');
type SwitchPanesAction = {
    type: typeof PANES_SWITCH;
    payload: {
        sourceId: string;
        targetId: string;
    };
};
export const switchPanes = (payload: SwitchPanesAction['payload']): SwitchPanesAction => ({
    type: PANES_SWITCH,
    payload,
});

export const PANE_TAB_SELECT = Symbol('editor/panes/PANE_TAB_SELECT');
type SelectPaneTabAction = {
    type: typeof PANE_TAB_SELECT;
    payload: {
        paneId: string;
        tabId: string;
    };
};
export const selectPaneTab = (payload: SelectPaneTabAction['payload']): SelectPaneTabAction => ({
    type: PANE_TAB_SELECT,
    payload,
});

export const PANE_VIEW_SELECT = Symbol('editor/panes/PANE_VIEW_SELECT');
type SelectPaneViewAction = {
    type: typeof PANE_VIEW_SELECT;
    payload: {
        paneId: string;
        view: string;
    };
};
export const selectPaneView = (payload: SelectPaneViewAction['payload']): SelectPaneViewAction => ({
    type: PANE_VIEW_SELECT,
    payload,
});

export const GRID_SCHEME_SELECT = Symbol('editor/panes/GRID_SCHEME_SELECT');
type SelectGridSchemeAction = {
    type: typeof GRID_SCHEME_SELECT;
    payload: {
        schemeId: string;
    };
};
export const selectGridScheme = (
    payload: SelectGridSchemeAction['payload'],
): SelectGridSchemeAction => ({
    type: GRID_SCHEME_SELECT,
    payload,
});

export type PanesActions =
    | SwitchPanesAction
    | SelectPaneTabAction
    | SelectPaneViewAction
    | SelectGridSchemeAction;
