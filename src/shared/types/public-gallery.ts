import type {RealTheme, StringWithSuggest} from '@gravity-ui/uikit';

import type {GALLERY_ITEM_CATEGORY} from '../constants';

type LinkToS3 = string;
type ImagesDict = Partial<Record<RealTheme, LinkToS3[]>>;

export type TranslationsDict = Record<string, string>;

export type GalleryItemCategory = StringWithSuggest<
    (typeof GALLERY_ITEM_CATEGORY)[keyof typeof GALLERY_ITEM_CATEGORY]
>;

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
    partnerId?: string;
};

export type GalleryItemShort = Pick<
    GalleryItem,
    'createdAt' | 'createdBy' | 'id' | 'images' | 'labels' | 'title'
>;

export type GalleryItemList = GalleryItemShort[];
