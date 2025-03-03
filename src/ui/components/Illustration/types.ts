import type React from 'react';

import type {ThemeType} from '@gravity-ui/uikit';

export type IllustrationStoreItem =
    | {type: 'async-img-src'; value: () => Promise<{default: string}>}
    | {type: 'lazy-component'; value: ReturnType<typeof React.lazy>};

export type IllustrationStore<
    IKey extends string = IllustrationName,
    Theme extends string = ThemeType,
> = Record<Theme, Record<IKey, IllustrationStoreItem>>;

export type IllustrationName =
    | 'error'
    | 'noAccess'
    | 'template'
    | 'successOperation'
    | 'project'
    | 'notFound'
    | 'identity'
    | 'emptyDirectory'
    | 'badRequest';

export type ExtendedIllustrationsNamesSet =
    | IllustrationName
    | 'barchar'
    | 'logo'
    | 'logoShort'
    | 'logoInit';

export interface IllustrationProps<IKey extends string = IllustrationName> {
    name: IKey;
    [prop: string]: unknown;
}

export type CustomIllustrationProps<IKey extends string = IllustrationName> =
    IllustrationProps<IKey> & {
        illustrationStore: IllustrationStore<IKey>;
    };
