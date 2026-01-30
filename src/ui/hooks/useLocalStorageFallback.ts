import React from 'react';

import {useDispatch, useSelector} from 'react-redux';
import type {DatalensGlobalState} from 'ui';
import {Utils} from 'ui';
import {setLocalStorageFallbackItem} from 'ui/store/actions/localStorageFallback';
import {selectLocalStorageFallbackItem} from 'ui/store/selectors/localStorageFallback';

let localStorageDiagnostic: {isAvailable: boolean} | null = null;

const initLocalStorageDiagnostic = () => {
    const test = 'test';
    try {
        window.localStorage.setItem(test, test);
        localStorageDiagnostic = {isAvailable: test === window.localStorage.getItem(test)};
        window.localStorage.removeItem(test);
    } catch (error) {
        localStorageDiagnostic = {isAvailable: false};
    }
};

initLocalStorageDiagnostic();

type Args<T> = {
    key: string;
    restoreFromLocalStorage?: (key?: string) => T | null;
};

export const useLocalStorageFallback = <T>({
    key,
    restoreFromLocalStorage,
}: Args<T>): {
    getItem: () => T | null;
    setItem: (data: T | null) => void;
} => {
    const dispatch = useDispatch();

    const localStorageFallbackItem =
        useSelector((state: DatalensGlobalState) => selectLocalStorageFallbackItem(state, key)) ??
        null;

    const localStorageFallbackItemRef = React.useRef(localStorageFallbackItem);

    React.useEffect(() => {
        localStorageFallbackItemRef.current = localStorageFallbackItem;
    }, [localStorageFallbackItem]);

    const getItem = React.useCallback<() => T | null>(() => {
        if (localStorageDiagnostic?.isAvailable) {
            return restoreFromLocalStorage ? restoreFromLocalStorage(key) : Utils.restore(key);
        }

        try {
            const storeItem = localStorageFallbackItemRef.current;
            return storeItem === null ? null : JSON.parse(storeItem);
        } catch (error) {
            return null;
        }
    }, [key, restoreFromLocalStorage]);

    const setItem = React.useCallback(
        (data: T | null) => {
            if (localStorageDiagnostic?.isAvailable) {
                Utils.store(key, data);
                return;
            }

            const storeItem = JSON.stringify(data);
            localStorageFallbackItemRef.current = storeItem;
            dispatch(setLocalStorageFallbackItem(key, storeItem));
        },
        [key, dispatch],
    );

    return {
        getItem,
        setItem,
    };
};
