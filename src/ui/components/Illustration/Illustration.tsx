import React from 'react';

import block from 'bem-cn-lite';
import type {PlaceholderIllustrationImageProps} from 'ui/registry/units/common/types/components/PlaceholderIllustrationImage';

import {createIllustration} from './utils';

import './Illustration.scss';

const b = block('created-illustration');

export const Illustration = ({illustrationStore, ...props}: PlaceholderIllustrationImageProps) => {
    const CreatedIllustration = createIllustration([illustrationStore]);

    return (
        <CreatedIllustration
            showSkeleton={true}
            skeletonTimeout={200}
            skeletonClassName={b('skeleton', {size: props.size ?? 'l'})}
            {...props}
        />
    );
};
