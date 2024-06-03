import {getFakeTitleOrTitle, isMeasureField} from '../../../../../../../../shared';
import {collator, getOriginalTitleOrTitle, numericCollator} from '../../../utils/misc-helpers';
import type {Categories} from '../../types';
import type {LineTemplate} from '../types';

import type {
    GetSortedCategoriesArgs,
    SortCategoriesWithColorsSection,
    SortCategoriesWithYSectionArgs,
} from './types';

type GetCutsArgs = {
    categories: Categories;
    lines: Record<string, Record<'data', LineTemplate['data']>>;
    currentLine?: string;
};

const getCuts = ({categories, lines, currentLine}: GetCutsArgs): Record<string, any> => {
    if (!currentLine) {
        return {};
    }

    const cuts: Record<string, any> = {};

    categories.forEach((category) => {
        cuts[category] = lines[currentLine].data[category]?.value;
    });

    return cuts;
};

const sortCategoriesByCuts = ({
    direction,
    cuts,
    categories,
}: {
    direction: string;
    categories: Categories;
    cuts: Record<string, any>;
}) => {
    const isASC = direction === 'ASC';
    const forward = isASC ? 1 : -1;
    const backward = isASC ? -1 : 1;

    categories.sort((a, b) => {
        return cuts[a] > cuts[b] ? forward : backward;
    });
};

const sortCategoriesWithYSection = (args: SortCategoriesWithYSectionArgs) => {
    const {ySectionItems, categories, sortItem, lineKeys, lines, colorItem, isSegmentsExists} =
        args;

    const sortedCategories: Categories = [...categories];

    const sortItemSource = sortItem.source;

    const matchedYSectionItem = ySectionItems.find((ySectionItem) => {
        const ySectionItemTitle = getOriginalTitleOrTitle(ySectionItem);
        const sortItemTitle = getOriginalTitleOrTitle(sortItem);

        const ySectionItemSource = ySectionItem.source;

        return (
            ySectionItemTitle === sortItemTitle ||
            (sortItemSource && sortItemSource === ySectionItemSource)
        );
    });

    if (matchedYSectionItem) {
        let cuts: Record<string, any> = {};
        if ((colorItem && colorItem.type !== 'PSEUDO') || isSegmentsExists) {
            lineKeys.forEach((currentLine: string) => {
                const currentLineCuts = getCuts({categories, lines, currentLine});

                categories.forEach((category) => {
                    if (!currentLineCuts[category]) {
                        return;
                    }

                    if (Object.hasOwnProperty.call(cuts, category)) {
                        cuts[category] += currentLineCuts[category];
                    } else {
                        cuts[category] = currentLineCuts[category];
                    }
                });
            });
        } else {
            const currentLine = lineKeys.find((key) => {
                return lines[key].fieldTitle === getFakeTitleOrTitle(matchedYSectionItem);
            });

            cuts = getCuts({categories, lines, currentLine});
        }

        sortCategoriesByCuts({direction: sortItem.direction, cuts, categories: sortedCategories});
    }

    return {
        sortedCategories,
    };
};

const sortCategoriesWithColorsSection = (args: SortCategoriesWithColorsSection) => {
    const {sortItem, colorItem, measureColorSortLine, categories} = args;
    const sortedCategories = [...categories];

    const isSortWithColorsSectionItem = colorItem.guid === sortItem.guid;

    if (isSortWithColorsSectionItem) {
        if (isMeasureField(colorItem)) {
            const cuts = getCuts({
                categories: sortedCategories,
                lines: measureColorSortLine,
                currentLine: getFakeTitleOrTitle(colorItem),
            });

            sortCategoriesByCuts({
                direction: sortItem.direction,
                cuts,
                categories: sortedCategories,
            });
        }
    }

    return {
        categories: sortedCategories,
    };
};

export const getSortedCategories = (args: GetSortedCategoriesArgs): Categories => {
    const {
        isSortAvailable,
        isXNumber,
        categories,
        isSortWithYSectionItem,
        sortItem,
        ySectionItems,
        lines,
        colorItem,
        measureColorSortLine,
        isSortBySegments,
        isSegmentsExists,
    } = args;

    const lineKeys = lines.map((l) => Object.keys(l));

    if (!isSortAvailable || isSortBySegments) {
        const sortFunction = isXNumber ? numericCollator : collator.compare;
        // @ts-ignore
        return [...categories].sort(sortFunction);
    }

    let sortedCategories: Categories = categories;

    if (isSortWithYSectionItem) {
        const sortResult = sortCategoriesWithYSection({
            categories,
            sortItem,
            ySectionItems,
            lines: lines[0],
            lineKeys: lineKeys[0],
            colorItem,
            isSegmentsExists,
        });
        sortedCategories = sortResult.sortedCategories;
    }

    if (colorItem) {
        const sortResult = sortCategoriesWithColorsSection({
            sortItem,
            colorItem,
            categories: sortedCategories,
            measureColorSortLine,
        });

        sortedCategories = sortResult.categories;
    }

    return sortedCategories;
};
