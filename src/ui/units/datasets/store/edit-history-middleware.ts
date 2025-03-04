import debounce from 'lodash/debounce';
import get from 'lodash/get';
import type {Middleware, MiddlewareAPI} from 'redux';

import {addEditHistoryPointDs} from './actions/creators/datasetTyped';
import type {DatasetDispatch, GetState} from './actions/creators/datasetTyped';
import {EDIT_HISTORY_OPTIONS_KEY} from './constants';
import type {EditHistoryOptions} from './types';

const middlewareAction = (
    store: MiddlewareAPI<DatasetDispatch, GetState>,
    options?: EditHistoryOptions,
) => {
    store.dispatch(addEditHistoryPointDs(options));
};
const debouncedTmpAction = debounce(middlewareAction);

function isDatasetAction(value: unknown): value is symbol {
    return typeof value === 'symbol' && value.toString().startsWith('Symbol(dataset');
}

function getEditHistoryOptions(action: unknown) {
    return get(action, `payload.${EDIT_HISTORY_OPTIONS_KEY}`) as EditHistoryOptions | undefined;
}

export const editHistoryDsMiddleware: Middleware = (store) => (next) => (action) => {
    // We should dispatch history action after target action in middleware
    // eslint-disable-next-line callback-return
    next(action);

    if (!isDatasetAction(action?.type)) {
        return;
    }

    const options = getEditHistoryOptions(action);

    if (!options) {
        return;
    }

    if (options.stacked) {
        debouncedTmpAction(store, options);
    } else {
        middlewareAction(store, options);
    }
};
