import type {DatalensGlobalState} from 'index';

export const selectLocalStorageFallbackItem = (
    state: DatalensGlobalState,
    key: string,
): string | null => state.localStorageFallback[key] ?? null;
