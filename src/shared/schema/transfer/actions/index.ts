import {exportActions} from './exports';
import {importActions} from './imports';

export const actions = {
    ...exportActions,
    ...importActions,
};
