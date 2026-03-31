import {exportActions} from './export';
import {importActions} from './import';

export const actions = {
    ...importActions,
    ...exportActions,
};
