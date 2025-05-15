import React from 'react';

import {Label} from '@gravity-ui/uikit';
import type {LabelProps} from '@gravity-ui/uikit';

import {block, getCategoryLabelTitle} from '../../utils';

import './GalleryCardLabels.scss';

const b = block('card-labels');

interface GalleryCardLabelsProps {
    id?: string;
    labels?: string[];
    labelProps?: LabelProps;
}

export function GalleryCardLabels({id, labels, labelProps}: GalleryCardLabelsProps) {
    return (
        <div className={b()}>
            {labels?.map((label, index) => (
                <Label size="s" theme="clear" key={`${id}-${label}-${index}`} {...labelProps}>
                    {getCategoryLabelTitle(label)}
                </Label>
            ))}
        </div>
    );
}
