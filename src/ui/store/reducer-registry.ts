import type {AnyAction, Dispatch, MiddlewareAPI, Middleware} from 'redux';

type Reducers = Record<string, any>;
type EmitChange = (reducers: Reducers) => void;

export class ReducerRegistry {
    reducers: Record<string, any>;
    middlewares: Middleware[];
    emitChange: EmitChange | null;

    constructor() {
        this.reducers = {};
        this.middlewares = [];
        this.emitChange = null;
    }

    getReducers() {
        return {
            ...this.reducers,
        };
    }

    //something like a polyfill for the createDynamicMiddleware https://redux-toolkit.js.org/api/createDynamicMiddleware
    //Builds and composes a chain of middlewares for a Redux store.
    //Wraps the dispatch function so actions pass through all middlewares
    //before reaching the reducer.
    getMiddlewares() {
        return (store: MiddlewareAPI) => {
            return (next: Dispatch) => {
                const middlewareWrappers = this.middlewares.map((mw) => mw(store));

                let dispatch = next;
                for (let i = middlewareWrappers.length - 1; i >= 0; i--) {
                    dispatch = middlewareWrappers[i](dispatch);
                }

                return (action: AnyAction) => {
                    return dispatch(action);
                };
            };
        };
    }

    registerMiddleware(mw: Middleware) {
        this.middlewares.push(mw);
    }

    register(reducers: Reducers) {
        this.reducers = {
            ...this.reducers,
            ...reducers,
        };

        if (this.emitChange) {
            this.emitChange(this.getReducers());
        }
    }

    reset() {
        this.reducers = {};
        this.middlewares = [];
        this.emitChange = null;
    }

    setChangeListener(cb: EmitChange) {
        this.emitChange = cb;
    }
}

export const reducerRegistry = new ReducerRegistry();
