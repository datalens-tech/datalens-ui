import type {RealTheme} from '@gravity-ui/uikit';

type LinkToS3 = string;

type GalleryItemCategory =
    | 'education'
    | 'finance'
    | 'hr'
    | 'it'
    | 'retail'
    | 'sports'
    | 'editor'
    | 'editors choice';

export type GalleryItem = {
    createdBy: string;
    id: string;
    title: string;
    description?: string;
    labels?: GalleryItemCategory[];
    images?: Partial<Record<RealTheme, LinkToS3[]>>;
};
