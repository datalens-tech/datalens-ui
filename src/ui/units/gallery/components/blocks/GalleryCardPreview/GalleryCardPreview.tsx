import React from 'react';

import {Card} from '@gravity-ui/uikit';
import type {GalleryItem} from 'shared/types';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import {block, getLang} from '../../utils';
import {GalleryCardLabels} from '../GalleryCardLabels/GalleryCardLabels';

import './GalleryCardPreview.scss';

const b = block('card-preview');

interface GalleryCardPreviewProps extends Pick<GalleryItem, 'createdBy' | 'labels' | 'title'> {
    imageSrc: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    className?: string;
}

export function GalleryCardPreview({
    title,
    createdBy,
    labels,
    imageSrc,
    onClick,
    className,
}: GalleryCardPreviewProps) {
    const lang = getLang();

    return (
        <Card className={b(null, className)} type="action" view="outlined" onClick={onClick}>
            <AsyncImage className={b('image')} showSkeleton={true} src={imageSrc} />
            <div className={b('info')}>
                <div className={b('info-title')} title={title[lang]}>
                    {title[lang]}
                </div>
                {Boolean(createdBy) && (
                    <div className={b('info-created-by')} title={createdBy}>
                        {createdBy}
                    </div>
                )}
                <GalleryCardLabels labels={labels} id={createdBy} />
            </div>
        </Card>
    );
}
