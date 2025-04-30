import type {RealTheme} from '@gravity-ui/uikit';

import type {GalleryItemCategory} from '../constants/gallery-item';

type LinkToS3 = string;

export type GalleryItem = {
    createdAt: number;
    createdBy: string;
    id: string;
    title: string;
    description?: string;
    images?: Partial<Record<RealTheme, LinkToS3[]>>;
    labels?: GalleryItemCategory[];
};
