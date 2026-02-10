import React from 'react';

import {Alert, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory, useLocation} from 'react-router';
import type {DatasetField, DatasetOptions} from 'shared';
import type {ApplyData} from 'ui';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

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
    readonly: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = (props: FilterSectionProps) => {
    const {progress, filters, updateFilter, fields, options, addFilter, deleteFilter, readonly} =
        props;
    const history = useHistory();
    const location = useLocation();
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
        readonly,
    });

    const title = i18n('label_obligatory-filter-title');
    const description = i18n('label_obligatory-filter-description');
    const alertTitle =
        preparedFields.length > 0
            ? undefined
            : getSharedEntryMockText('dataset-filters-readonly-alert-title');
    const alertMessage = getSharedEntryMockText(
        preparedFields.length > 0
            ? 'dataset-filters-readonly-alert-message'
            : 'dataset-empty-filters-readonly-alert-message',
    );

    return (
        <DatasetTabSection
            readonlyNotice={
                progress ? null : (
                    <Alert
                        className={spacing({mb: '3'})}
                        theme="info"
                        title={alertTitle}
                        message={alertMessage}
                        actions={[
                            {
                                text: getSharedEntryMockText('workbook-shared-entry-original-link'),
                                handler: () => history.push(location.pathname),
                            },
                        ]}
                        layout="horizontal"
                    />
                )
            }
            readonly={readonly}
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
