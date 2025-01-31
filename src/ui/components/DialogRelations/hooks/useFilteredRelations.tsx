import React from 'react';

import {usePrevious} from 'hooks/usePrevious';
import isEqual from 'lodash/isEqual';

import {getRowTitle} from '../components/Content/helpers';
import type {FiltersTypes} from '../components/Filters/Filters';
import type {DashMetaData, RelationType} from '../types';

import {getChangedRelations, getMappedFilters} from './helpers';

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
                if (
                    changedWidgets[currentWidgetId] &&
                    changedWidgets[currentWidgetId][item.itemId || item.widgetId]
                ) {
                    newItem.relations = {
                        ...item.relations,
                        type: changedWidgets[currentWidgetId][item.widgetId],
                    };
                }
                return newItem;
            });

            setShowedRelations(newRelations);
        }
    }, [typeValues, showedRelations, changedWidgets, currentWidgetId]);

    React.useEffect(() => {
        if (!showedRelations?.length) {
            return;
        }

        const trimmedSearchValue = searchValue.trim();
        let filteredItems = showedRelations;
        if (trimmedSearchValue) {
            filteredItems =
                filteredItems.filter((item) =>
                    getRowTitle(item.title, item.label)
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()),
                ) || [];
        }

        const mappedFilters = getMappedFilters(typeValues);
        filteredItems = filteredItems.filter((item) => mappedFilters[item.relations.type]);

        if (changedWidgets) {
            filteredItems = getChangedRelations(filteredItems, changedWidgets, currentWidgetId);
        }

        setFilteredRelations(filteredItems);
    }, [searchValue, showedRelations, typeValues, changedWidgets, currentWidgetId]);

    return {filteredRelations};
};
