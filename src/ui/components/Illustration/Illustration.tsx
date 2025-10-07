import React from 'react';

import type {PlaceholderIllustrationImageProps} from 'ui/registry/units/common/types/components/PlaceholderIllustrationImage';

import {createIllustration} from './utils';

export const Illustration = ({illustrationStore, ...props}: PlaceholderIllustrationImageProps) => {
    const CreatedIllustration = createIllustration([illustrationStore]);

    return <CreatedIllustration {...props} />;
};
