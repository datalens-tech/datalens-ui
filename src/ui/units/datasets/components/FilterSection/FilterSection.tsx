import React from 'react';

import {I18n} from 'i18n';
import type {DatasetField, DatasetOptions} from 'shared';
import type {ApplyData} from 'ui';

import type {ObligatoryFilter} from '../../typings/dataset';
import {DatasetTabSection} from '../DatasetTabSection/DatasetTabSection';

import type {FilterType} from './types';
import {useFilterSection} from './useFilterSection';

const i18n = I18n.keyset('dataset.filters-tab.modify');

interface FilterSectionProps {
    type: FilterType;
    fields: DatasetField[];
    filters: ObligatoryFilter[];
    options: DatasetOptions;
    progress: boolean;
    addFilter: (data: ApplyData) => void;
    updateFilter: (data: ApplyData) => void;
    deleteFilter: (filterId: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = (props: FilterSectionProps) => {
    const {progress, filters, updateFilter, fields, options, addFilter, deleteFilter} = props;

    const {
        headerColumns,
        onFilterItemClick,
        onOpenDialogFilterClick,
        columns,
        preparedFields,
        controlSettings,
        checkIsRowValid,
    } = useFilterSection({
        filters,
        fields,
        options,
        updateFilter,
        addFilter,
        deleteFilter,
    });

    const title = i18n('label_obligatory-filter-title');
    const description = i18n('label_obligatory-filter-description');

    return (
        <DatasetTabSection
            title={title}
            description={description}
            onOpenDialogClick={onOpenDialogFilterClick}
            openDialogButtonText={i18n('label_obligatory-filter-add')}
            onItemClick={onFilterItemClick}
            fields={preparedFields}
            headerColumns={headerColumns}
            columns={columns}
            isListUpdating={progress}
            controlSettings={controlSettings}
            checkIsRowValid={checkIsRowValid}
        />
    );
};

export default FilterSection;
