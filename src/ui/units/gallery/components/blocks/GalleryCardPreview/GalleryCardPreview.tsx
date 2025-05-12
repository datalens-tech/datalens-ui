import React from 'react';

import {Card, Label} from '@gravity-ui/uikit';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import type {GalleryItem} from '../../../types';
import {block, getCategoryLabelTitle} from '../../utils';

import './GalleryCardPreview.scss';

const b = block('card-preview');

interface GalleryCardPreviewProps extends Pick<GalleryItem, 'createdBy' | 'labels' | 'title'> {
    imageSrc: string;
}

export function GalleryCardPreview({title, createdBy, labels, imageSrc}: GalleryCardPreviewProps) {
    return (
        <Card className={b()} type="action" view="outlined" onClick={() => {}}>
            <AsyncImage className={b('image')} showSkeleton={true} src={imageSrc} />
            <div className={b('info')}>
                <div className={b('info-title')} title={title}>
                    {title}
                </div>
                <div className={b('info-created-by')} title={createdBy}>
                    {createdBy}
                </div>
                <div className={b('info-labels')}>
                    {labels?.map((label, index) => (
                        <Label size="s" theme="clear" key={`${createdBy}-${label}-${index}`}>
                            {getCategoryLabelTitle(label)}
                        </Label>
                    ))}
                </div>
            </div>
        </Card>
    );
}
