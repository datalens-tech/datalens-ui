import React from 'react';

import {getRowTitle} from '../components/Content/helpers';
import type {FiltersTypes} from '../components/Filters/Filters';
import type {DashMetaData, RelationType} from '../types';

import {getChangedRelations, getMappedFilters} from './helpers';

const compareSearchValueGetter = (searchValue: string) => {
    const trimmedSearchValue = searchValue.trim();

    if (trimmedSearchValue) {
        return (title: string) => title.toLocaleLowerCase().includes(searchValue.toLowerCase());
    }

    return () => true;
};

export const useFilteredRelations = ({
    relations,
    searchValue,
    typeValues,
    changedWidgets,
    currentWidgetId,
}: {
    relations: DashMetaData;
    searchValue: string;
    typeValues: Array<FiltersTypes>;
    changedWidgets: Record<string, Record<string, RelationType>> | undefined;
    currentWidgetId: string;
}) => {
    const [filteredRelations, setFilteredRelations] = React.useState<DashMetaData>([]);

    React.useEffect(() => {
        const showedRelations = changedWidgets
            ? getChangedRelations(relations, changedWidgets, currentWidgetId)
            : relations;

        if (!showedRelations?.length) {
            setFilteredRelations([]);
            return;
        }

        const mappedFilters = getMappedFilters(typeValues);
        const compareTitle = compareSearchValueGetter(searchValue);

        const filteredItems = showedRelations.filter((item) => {
            const hasSearch = compareTitle(getRowTitle(item.title, item.label));
            const hasFilteredType = mappedFilters[item.relations.type];

            return hasSearch && hasFilteredType;
        });

        setFilteredRelations(filteredItems);
    }, [changedWidgets, currentWidgetId, relations, typeValues, searchValue]);

    return {filteredRelations};
};
