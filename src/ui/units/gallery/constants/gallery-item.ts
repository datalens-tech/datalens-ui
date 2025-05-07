import type {StringWithSuggest} from '@gravity-ui/uikit';
export const GALLERY_ITEM_CATEGORY = {
    EDUCATION: 'education',
    FINANCE: 'finance',
    HR: 'hr',
    IT: 'it',
    RETAIL: 'retail',
    SPORTS: 'sports',
    EDITOR: 'editor',
} as const;
export type GalleryItemCategory = StringWithSuggest<
    (typeof GALLERY_ITEM_CATEGORY)[keyof typeof GALLERY_ITEM_CATEGORY]
>;
