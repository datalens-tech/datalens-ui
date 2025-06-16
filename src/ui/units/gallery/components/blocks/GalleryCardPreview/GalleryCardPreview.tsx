import React from 'react';

import {Card} from '@gravity-ui/uikit';
import {Link} from 'react-router-dom';
import type {GalleryItem} from 'shared/types';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import {block, getGalleryItemUrl, getLang} from '../../utils';
import {GalleryCardLabels} from '../GalleryCardLabels/GalleryCardLabels';

import './GalleryCardPreview.scss';

const b = block('card-preview');

interface GalleryCardPreviewProps extends Pick<GalleryItem, 'createdBy' | 'labels' | 'title'> {
    imageSrc: string;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    id?: string;
}

export function GalleryCardPreview({
    id,
    title,
    createdBy,
    labels,
    imageSrc,
    onClick,
    className,
}: GalleryCardPreviewProps) {
    const lang = getLang();
    const url = getGalleryItemUrl({id: id || ''});

    return (
        <Link className={b(null, className)} to={url} onClick={onClick}>
            <Card className={b('card')} view="outlined">
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
        </Link>
    );
}
