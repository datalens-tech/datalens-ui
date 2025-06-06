import React from 'react';

import type {GalleryItemShort} from 'shared/types';

import {SPECIAL_CATEGORY} from '../constants';

export function useSortedGalleryItems({items}: {items: GalleryItemShort[]}) {
    const sortedItems = React.useMemo(() => {
        return [...items].sort((item1, item2) => {
            if (item1.createdAt === undefined && item2.createdAt === undefined) {
                return 0;
            }
            if (item1.createdAt === undefined) {
                return 1;
            }
            if (item2.createdAt === undefined) {
                return -1;
            }
            return item2.createdAt - item1.createdAt;
        });
    }, [items]);

    return {sortedItems};
}
interface UseFilteredGalleryItemsProps {
    items: GalleryItemShort[];
    editorChoiceIds: string[];
    search: string;
    category: string;
    lang: string;
    canBeUsed: boolean;
}

export function useFilteredGalleryItems({
    category,
    items,
    search,
    lang,
    editorChoiceIds,
    canBeUsed,
}: UseFilteredGalleryItemsProps) {
    const filteredItems = React.useMemo(() => {
        return items.reduce<GalleryItemShort[]>((acc, item) => {
            if (canBeUsed && !item.canBeUsed) {
                return acc;
            }

            const matchesSearchValue =
                !search || item.title[lang]?.toLowerCase().includes(search.toLowerCase());

            if (!matchesSearchValue) {
                return acc;
            }

            let matchesCategory = true;

            if (item.labels && category !== SPECIAL_CATEGORY.ALL) {
                switch (category) {
                    case SPECIAL_CATEGORY.EDITORS_CHOICE: {
                        matchesCategory = editorChoiceIds.includes(item.id);
                        break;
                    }
                    default: {
                        matchesCategory = item.labels.some(
                            (label) => label.toLowerCase() === category?.toLowerCase(),
                        );
                    }
                }
            }

            if (matchesCategory) {
                acc.push(item);
            }

            return acc;
        }, []);
    }, [items, search, lang, category, editorChoiceIds, canBeUsed]);

    return {filteredItems};
}
