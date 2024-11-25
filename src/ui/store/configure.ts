import type {Store, AnyAction} from 'redux';
import {createStore, applyMiddleware, combineReducers, compose} from 'redux';
import thunk from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {reducerRegistry} from './reducer-registry';
import type {DatalensGlobalState} from '../';
import {editHistoryDsMiddleware} from '../units/datasets/store/edit-history-middleware';

let store: Store<DatalensGlobalState, AnyAction>;

function configureStore(services: unknown = {}) {
    const middlewares = [thunk.withExtraArgument(services), editHistoryDsMiddleware];

    let composeEnhancers = compose;

    if (process.env.NODE_ENV !== 'production') {
        const logger = createLogger({collapsed: true});

        middlewares.push(logger);

        if (typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
            composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
        }
    }

    const newStore = createStore(
        combineReducers(reducerRegistry.getReducers()),
        composeEnhancers(applyMiddleware(...middlewares)),
    );

    reducerRegistry.setChangeListener(() => {
        newStore.replaceReducer(combineReducers(reducerRegistry.getReducers()));
    });

    return newStore;
}

export const getStore = (services: unknown = {}) => {
    if (!store) {
        store = configureStore(services) as Store<DatalensGlobalState, AnyAction>;
    }

    return store;
};
