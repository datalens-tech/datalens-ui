import type {Keysets, TypedI18n} from '../../i18n/types';

export const getTranslationFn =
    (i18n: TypedI18n) =>
    (keyset: string, key: string, params?: Record<string, string | number>) => {
        return i18n.keyset(keyset as keyof Keysets)(key, params);
    };
