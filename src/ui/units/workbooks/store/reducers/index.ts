import type {WorkbooksAction} from '../actions';
import {RESET_WORKBOOK_STATE} from '../constants';

import type {WorkbooksState} from './workbook-page';
import {workbooksReducer} from './workbook-page';

export type {WorkbooksState};

export const reducer = (state: WorkbooksState, action: WorkbooksAction) => {
    if (action.type === RESET_WORKBOOK_STATE) {
        return workbooksReducer(undefined, action);
    }
    return workbooksReducer(state, action);
};
