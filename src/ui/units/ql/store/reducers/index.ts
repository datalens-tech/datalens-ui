import {RESET_QL_STORE} from '../actions/ql';
import type {QLAction, QLState} from '../typings/ql';

import ql from './ql';

const qlReducer = (state: QLState, action: QLAction) => {
    if (action.type === RESET_QL_STORE) {
        return ql(undefined, action);
    }

    return ql(state, action);
};

export default qlReducer;
