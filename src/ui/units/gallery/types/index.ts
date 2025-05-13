import type {RealTheme} from '@gravity-ui/uikit';

import type {GalleryItemCategory} from '../constants/gallery-item';

type LinkToS3 = string;
type ImagesDict = Partial<Record<RealTheme, LinkToS3[]>>;

export type TranslationsDict = Record<string, string>;

export type GalleryItem = {
    createdAt: number;
    createdBy: string;
    id: string;
    title: TranslationsDict;
    description?: TranslationsDict;
    images?: ImagesDict;
    labels?: GalleryItemCategory[];
    shortDescription?: TranslationsDict;
    publicUrl?: string;
};
