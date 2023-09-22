import {useCallback, useEffect, useReducer} from 'react';

import {PANE_VIEWS} from '../../constants/common';

export const ACTION_TYPE = {
    CHANGE_STATE: 'change_state',
    TOGGLE_SHOW: 'toggle_show',
};

export const SHOW = {
    DOCS: 'docs',
    DIFF: 'diff',
    SEARCH: 'search',
};

const init = (data = {}) => {
    const {paneView, paneId} = data;
    const isEditorView = paneView.id === PANE_VIEWS.EDITOR;
    return {
        paneId,
        paneView,
        show: null,
        module: null,
        isEditorView,
    };
};

const reducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPE.CHANGE_STATE:
            return {
                ...state,
                ...action.data,
            };
        case ACTION_TYPE.TOGGLE_SHOW: {
            const {show} = action.data;
            const newShow = state.show === show ? null : show;
            return {
                ...state,
                show: newShow,
                module: newShow ? state.module : null,
            };
        }
        default:
            return state;
    }
};

export const usePaneViewState = ({paneId, tabData, paneView}) => {
    const [state, dispatch] = useReducer(reducer, {paneView, paneId}, init);

    const setState = useCallback((data) => {
        dispatch({type: ACTION_TYPE.CHANGE_STATE, data});
    }, []);

    const dispatchAction = useCallback((type, data = {}) => {
        dispatch({type, data});
    }, []);

    useEffect(() => {
        if (paneView !== state.paneView || paneId !== state.paneId) {
            setState(init({paneView, paneId}));
        } else {
            const {isEditorView} = state;
            const hasDocs = Boolean(tabData) && Array.isArray(tabData.docs);
            let show = isEditorView ? state.show : null;
            if (show && !hasDocs && show === SHOW.DOCS) {
                show = null;
            }
            setState({
                show,
                module: isEditorView ? state.module : null,
                hasDocs: isEditorView && Array.isArray(tabData.docs),
            });
        }
    }, [paneId, tabData, paneView]);

    return {
        state,
        setState,
        dispatchAction,
    };
};
