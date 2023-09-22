import React from 'react';

import logger from '../../../libs/logger';

export const useFetch = (fetch, formatter) => {
    const types = {
        LOADING: 'loading',
        FAILED: 'failed',
        SUCCESS: 'success',
        REFETCH: 'refetch',
    };

    const mounted = React.useRef(true);

    const [state, dispatch] = React.useReducer(
        (state, action) => {
            // eslint-disable-line no-shadow
            switch (action.type) {
                case types.LOADING:
                    return {
                        ...state,
                        status: types.LOADING,
                    };
                case types.SUCCESS:
                    return {
                        ...state,
                        status: types.SUCCESS,
                        data: formatter ? formatter(action.data) : action.data,
                    };
                case types.FAILED:
                    return {
                        ...state,
                        status: types.FAILED,
                        error: action.error,
                    };
                case types.REFETCH:
                    return {
                        ...state,
                        refetch: state.refetch + 1,
                    };
                default:
                    return state;
            }
        },
        {
            status: types.LOADING,
            error: undefined,
            data: undefined,
            refetch: 0,
        },
    );

    React.useEffect(() => {
        mounted.current = true;
        dispatch({type: types.LOADING});
        fetch()
            .then((data) => {
                if (mounted.current) {
                    dispatch({type: types.SUCCESS, data});
                }
            })
            .catch((error) => {
                logger.logError('editor: useFetch failed', error);
                if (mounted.current) {
                    dispatch({type: types.FAILED, error});
                }
            });
        return () => {
            mounted.current = false;
        };
    }, [state.refetch]);

    const refetch = React.useCallback(() => {
        dispatch({type: types.REFETCH});
    }, []);

    return {
        ...state,
        refetch,
    };
};
