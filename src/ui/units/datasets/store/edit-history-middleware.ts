import debounce from 'lodash/debounce';
import type {Middleware, MiddlewareAPI} from 'redux';

import {DATASET_VALIDATION_TIMEOUT} from '../constants';

import {addEditHistoryPointDs} from './actions/creators/datasetTyped';
import type {
    AddEditHistoryPointDsArgs,
    DatasetDispatch,
    GetState,
} from './actions/creators/datasetTyped';
import {
    ADD_CONNECTION,
    ADD_FIELD,
    ADD_OBLIGATORY_FILTER,
    AVATAR_ADD,
    AVATAR_DELETE,
    BATCH_DELETE_FIELDS,
    BATCH_UPDATE_FIELDS,
    CHANGE_AMOUNT_PREVIEW_ROWS,
    CONNECTION_REPLACE,
    DELETE_CONNECTION,
    DELETE_FIELD,
    DELETE_OBLIGATORY_FILTER,
    DUPLICATE_FIELD,
    PREVIEW_DATASET_FETCH_FAILURE,
    PREVIEW_DATASET_FETCH_SUCCESS,
    RELATION_ADD,
    RELATION_DELETE,
    RELATION_UPDATE,
    SOURCES_REFRESH,
    SOURCE_ADD,
    SOURCE_DELETE,
    SOURCE_REPLACE,
    SOURCE_UPDATE,
    TOGGLE_ALLOWANCE_SAVE,
    TOGGLE_LOAD_PREVIEW_BY_DEFAULT,
    UPDATE_FIELD,
    UPDATE_OBLIGATORY_FILTER,
    UPDATE_RLS,
} from './actions/types/dataset';

type HistoryActionOptions = {stacked?: boolean};

const HistoryAction: Record<symbol, HistoryActionOptions> = {
    [ADD_CONNECTION]: {},
    [ADD_FIELD]: {},
    [ADD_OBLIGATORY_FILTER]: {},
    [AVATAR_ADD]: {},
    [AVATAR_DELETE]: {},
    [BATCH_DELETE_FIELDS]: {},
    [BATCH_UPDATE_FIELDS]: {},
    [CHANGE_AMOUNT_PREVIEW_ROWS]: {},
    [CONNECTION_REPLACE]: {},
    [DELETE_CONNECTION]: {},
    [DELETE_FIELD]: {},
    [DELETE_OBLIGATORY_FILTER]: {},
    [DUPLICATE_FIELD]: {},
    [PREVIEW_DATASET_FETCH_FAILURE]: {stacked: true},
    [PREVIEW_DATASET_FETCH_SUCCESS]: {stacked: true},
    [RELATION_ADD]: {},
    [RELATION_DELETE]: {},
    [RELATION_UPDATE]: {},
    [SOURCES_REFRESH]: {},
    [SOURCE_ADD]: {stacked: true},
    [SOURCE_DELETE]: {},
    [SOURCE_REPLACE]: {},
    [SOURCE_UPDATE]: {},
    [TOGGLE_ALLOWANCE_SAVE]: {stacked: true},
    [TOGGLE_LOAD_PREVIEW_BY_DEFAULT]: {},
    [UPDATE_FIELD]: {},
    [UPDATE_OBLIGATORY_FILTER]: {},
    [UPDATE_RLS]: {},
};

const middlewareAction = (
    store: MiddlewareAPI<DatasetDispatch, GetState>,
    options?: AddEditHistoryPointDsArgs,
) => {
    store.dispatch(addEditHistoryPointDs(options));
};
const debouncedTmpAction = debounce(middlewareAction);
let lastInvocationTimestamp = Date.now();

export const editHistoryMiddleware: Middleware = (store) => (next) => (action) => {
    // We should dispatch history action after target action in middleware
    // eslint-disable-next-line callback-return
    next(action);

    if (typeof action?.type !== 'symbol' || !action.type.toString().startsWith('Symbol(dataset')) {
        return;
    }

    const historyAction = HistoryAction[action.type];

    if (historyAction) {
        const stackedByDefault = historyAction.stacked;
        let betweenInvocationsTimestamp = Infinity;

        if (!stackedByDefault) {
            const currentInvocationTimestamp = Date.now();
            betweenInvocationsTimestamp = currentInvocationTimestamp - lastInvocationTimestamp;
            lastInvocationTimestamp = currentInvocationTimestamp;
        }

        const state = store.getState();
        const stacked =
            stackedByDefault ||
            (state.dataset.savingDataset.disabled &&
                state.dataset.validation.isPending &&
                betweenInvocationsTimestamp < DATASET_VALIDATION_TIMEOUT);

        if (stacked) {
            debouncedTmpAction(store, {stacked});
        } else {
            middlewareAction(store, {stacked});
        }
    }
};
