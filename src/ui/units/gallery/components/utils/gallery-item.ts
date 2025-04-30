import type {GalleryItem} from '../../types';

type GalleryItemsByLabel = Record<string, number[]>;

export function groupGalleryItemsByLabels(items: GalleryItem[]): GalleryItemsByLabel {
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
