import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemCategory, GalleryItemShort} from 'shared/types';

type GalleryItemsByLabel = Record<string, number[]>;

export function groupGalleryItemsByLabels(items: GalleryItemShort[]): GalleryItemsByLabel {
    const result: GalleryItemsByLabel = {};

    items.forEach((item, index) => {
        if (item.labels) {
            item.labels.forEach((label) => {
                if (!result[label]) {
                    result[label] = [];
                }
                result[label].push(index);
            });
        }
    });

    return result;
}

const CATEGORY_TO_LABEL_TITLE: Record<GalleryItemCategory, string> = {
    [GALLERY_ITEM_CATEGORY.EDUCATION]: 'Education',
    [GALLERY_ITEM_CATEGORY.FINANCE]: 'Finance',
    [GALLERY_ITEM_CATEGORY.HR]: 'HR',
    [GALLERY_ITEM_CATEGORY.IT]: 'IT',
    [GALLERY_ITEM_CATEGORY.RETAIL]: 'Retail',
    [GALLERY_ITEM_CATEGORY.SPORTS]: 'Sports',
    [GALLERY_ITEM_CATEGORY.EDITOR]: 'Editor',
    [GALLERY_ITEM_CATEGORY.GEO]: 'Geo',
};

export function getCategoryLabelTitle(category = '') {
    return (
        CATEGORY_TO_LABEL_TITLE[category as GalleryItemCategory] ||
        `${category.charAt(0).toUpperCase()}${category.slice(1)}`
    );
}
