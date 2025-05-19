import React from 'react';

import {Card} from '@gravity-ui/uikit';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import type {GalleryItem} from '../../../types';
import {block, getLang} from '../../utils';
import {GalleryCardLabels} from '../GalleryCardLabels/GalleryCardLabels';

import './GalleryCardPreview.scss';

const b = block('card-preview');

interface GalleryCardPreviewProps extends Pick<GalleryItem, 'createdBy' | 'labels' | 'title'> {
    imageSrc: string;
}

export function GalleryCardPreview({title, createdBy, labels, imageSrc}: GalleryCardPreviewProps) {
    const lang = getLang();
    return (
        <Card className={b()} type="action" view="outlined" onClick={() => {}}>
            <AsyncImage className={b('image')} showSkeleton={true} src={imageSrc} />
            <div className={b('info')}>
                <div className={b('info-title')} title={title[lang]}>
                    {title[lang]}
                </div>
                <div className={b('info-created-by')} title={createdBy}>
                    {createdBy}
                </div>
                <GalleryCardLabels labels={labels} id={createdBy} />
            </div>
        </Card>
    );
}
