import React from 'react';

import {Card} from '@gravity-ui/uikit';
import {AsyncImage} from 'ui/components/AsyncImage/AsyncImage';

import {block} from '../../../utils';

import './PreviewCard.scss';

const b = block('card-image-preview');

export const CARD_IMAGE_PREVIEW_HEIGHT = 82;

type PreviewCardProps = {
    selected: boolean;
    onSelected: (image: string) => void;
    image: string;
    size?: 'auto' | 's' | 'xs';
};

export const PreviewCard = React.forwardRef<HTMLDivElement, PreviewCardProps>(function PreviewCard(
    {selected, onSelected, image, size = 'auto'},
    ref,
) {
    return (
        <Card
            selected={selected}
            style={{height: CARD_IMAGE_PREVIEW_HEIGHT}}
            className={b({size})}
            type="selection"
            view="outlined"
            onClick={() => {
                onSelected(image);
            }}
            ref={ref}
        >
            <AsyncImage className={b('content')} showSkeleton={true} src={image} />
        </Card>
    );
});
