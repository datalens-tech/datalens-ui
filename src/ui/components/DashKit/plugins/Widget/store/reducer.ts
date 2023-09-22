import {Action, PLUGIN_WIDGET_SET_DATA, WidgetState} from './actions';

export const getInitialState = (): WidgetState => {
    return {
        loadedData: null,
        loading: false,
        description: null,
        loadedDescription: null,
        scrollOffset: null,
    };
};

export const reducer = (state: WidgetState, action: Action) => {
    switch (action.type) {
        case PLUGIN_WIDGET_SET_DATA: {
            return {
                ...state,
                ...action.payload,
            };
        }
        default: {
            return state;
        }
    }
};
