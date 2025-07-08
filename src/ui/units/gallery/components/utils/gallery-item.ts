import {GALLERY_ITEM_CATEGORY} from 'shared/constants';
import type {GalleryItemCategory, GalleryItemShort} from 'shared/types';

import {galleryAllPageI18n} from './i18n';

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
    [GALLERY_ITEM_CATEGORY.EDITOR]: galleryAllPageI18n('category_editor'),
    [GALLERY_ITEM_CATEGORY.EDUCATION]: galleryAllPageI18n('category_education'),
    [GALLERY_ITEM_CATEGORY.FINANCE]: galleryAllPageI18n('category_finance'),
    [GALLERY_ITEM_CATEGORY.GEO]: galleryAllPageI18n('category_geo'),
    [GALLERY_ITEM_CATEGORY.HEALTHCARE]: galleryAllPageI18n('category_healthcare'),
    [GALLERY_ITEM_CATEGORY.HR]: galleryAllPageI18n('category_hr'),
    [GALLERY_ITEM_CATEGORY.IT]: galleryAllPageI18n('category_it'),
    [GALLERY_ITEM_CATEGORY.MARKETING]: galleryAllPageI18n('category_marketing'),
    [GALLERY_ITEM_CATEGORY.MARKETPLACE]: galleryAllPageI18n('category_marketplace'),
    [GALLERY_ITEM_CATEGORY.PHARMA]: galleryAllPageI18n('category_pharma'),
    [GALLERY_ITEM_CATEGORY.PRODUCT]: galleryAllPageI18n('category_product'),
    [GALLERY_ITEM_CATEGORY.PRODUCTION]: galleryAllPageI18n('category_production'),
    [GALLERY_ITEM_CATEGORY.RETAIL]: galleryAllPageI18n('category_retail'),
    [GALLERY_ITEM_CATEGORY.SALES]: galleryAllPageI18n('category_sales'),
    [GALLERY_ITEM_CATEGORY.SERVICE]: galleryAllPageI18n('category_service'),
    [GALLERY_ITEM_CATEGORY.SOCIAL]: galleryAllPageI18n('category_social'),
    [GALLERY_ITEM_CATEGORY.SPORTS]: galleryAllPageI18n('category_sports'),
    [GALLERY_ITEM_CATEGORY.HORECA]: galleryAllPageI18n('category_horeca'),
    [GALLERY_ITEM_CATEGORY.ENGLISH]: galleryAllPageI18n('category_english'),
};

export function getCategoryLabelTitle(category = '') {
    const normalizedCategory = category.toLowerCase();
    return (
        CATEGORY_TO_LABEL_TITLE[normalizedCategory as GalleryItemCategory] ||
        `${category.charAt(0).toUpperCase()}${category.slice(1)}`
    );
}
