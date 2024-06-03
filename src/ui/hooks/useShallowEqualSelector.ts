import type {DatalensGlobalState} from 'index';
import {shallowEqual, useSelector} from 'react-redux';

export function useShallowEqualSelector<TSelected>(
    selector: (state: DatalensGlobalState) => TSelected,
): TSelected {
    return useSelector(selector, shallowEqual);
}
