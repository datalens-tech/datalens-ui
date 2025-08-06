import {exportActions} from './export';
import {importActions} from './import';

export const actions = {
    ...exportActions,
    ...importActions,
};
