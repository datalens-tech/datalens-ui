import React from 'react';

import {usePrevious} from 'hooks/usePrevious';
import isEqual from 'lodash/isEqual';

import {FiltersTypes} from '../components/Filters/Filters';
import {DashMetaData, RelationType} from '../types';

import {getChangedRelations, getMappedFilters} from './helpers';

export const useFilteredRelations = ({
    relations,
    searchValue,
    typeValues,
    changedWidgets,
}: {
    relations: DashMetaData;
    searchValue: string;
    typeValues: Array<FiltersTypes>;
    changedWidgets: Record<string, RelationType> | undefined;
}) => {
    const [filteredRelations, setFilteredRelations] = React.useState<DashMetaData>([]);
    const [showedRelations, setShowedRelations] = React.useState<DashMetaData>([]);

    const prevSelectedFilters = usePrevious(typeValues);

    React.useEffect(() => {
        setShowedRelations(relations);
    }, [relations]);

    React.useEffect(() => {
        if (changedWidgets && !isEqual(prevSelectedFilters, typeValues)) {
            const newRelations = showedRelations.map((item) => {
                const newItem = {
                    ...item,
                };
                if (changedWidgets[item.widgetId]) {
                    newItem.relations = {
                        ...item.relations,
                        type: changedWidgets[item.widgetId],
                    };
                }
                return newItem;
            });

            setShowedRelations(newRelations);
        }
    }, [typeValues, showedRelations, changedWidgets]);

    React.useEffect(() => {
        if (!showedRelations?.length) {
            return;
        }

        const trimmedSearchValue = searchValue.trim();
        let filteredItems = showedRelations;
        if (trimmedSearchValue) {
            filteredItems =
                filteredItems.filter((item) =>
                    item.title.toLowerCase().includes(searchValue.toLowerCase()),
                ) || [];
        }

        const mappedFilters = getMappedFilters(typeValues);
        filteredItems = filteredItems.filter((item) => mappedFilters[item.relations.type]);

        if (changedWidgets) {
            filteredItems = getChangedRelations(filteredItems, changedWidgets);
        }

        setFilteredRelations(filteredItems);
    }, [searchValue, showedRelations, typeValues, changedWidgets]);

    return {filteredRelations};
};
