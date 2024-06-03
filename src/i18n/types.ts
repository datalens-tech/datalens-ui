import type {I18NFn} from '@gravity-ui/i18n';

import type KeysetsData from './keysets/data.json';

export type Keysets = typeof KeysetsData;

export type TypedI18n = I18NFn<Keysets> & {lang?: string};

export type ServerI18n = {
    lang: string;
    keyset: TypedI18n['keyset'];
    getI18nServer: () => TypedI18n;
};
