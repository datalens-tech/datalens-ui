import React from 'react';

import type {CustomIllustrationProps, IllustrationName} from './types';
import {createIllustration} from './utils';

export function Illustration<IKey extends string = IllustrationName>({
    illustrationStore,
    ...props
}: CustomIllustrationProps<IKey>) {
    const CreatedIllustration = createIllustration([illustrationStore]);

    return <CreatedIllustration {...props} />;
}
