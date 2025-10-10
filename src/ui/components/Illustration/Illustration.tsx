import React from 'react';

import block from 'bem-cn-lite';
import type {PlaceholderIllustrationImageProps} from 'ui/registry/units/common/types/components/PlaceholderIllustrationImage';

import {createIllustration} from './utils';

import './Illustration.scss';

const b = block('created-illustration');

const SKELETO_TIMEOUT = 300;

export const Illustration = ({illustrationStore, ...props}: PlaceholderIllustrationImageProps) => {
    const CreatedIllustration = createIllustration([illustrationStore]);

    return (
        <CreatedIllustration
            showSkeleton={Boolean(props.size)}
            skeletonTimeout={SKELETO_TIMEOUT}
            skeletonClassName={b('skeleton', {size: props.size})}
            {...props}
        />
    );
};
