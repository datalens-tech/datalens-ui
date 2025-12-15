import React from 'react';

import {connect} from 'react-redux';
import {compose} from 'recompose';
import type {DatasetField, DatasetOptions} from 'shared';
import type {ApplyData, DatalensGlobalState} from 'ui';
import {
    addObligatoryFilter,
    deleteObligatoryFilter,
    updateDatasetByValidation,
    updateObligatoryFilter,
} from 'units/datasets/store/actions/creators';

import FilterSection from '../../components/FilterSection/FilterSection';
import {FilterType} from '../../components/FilterSection/types';
import {
    datasetValidationSelector,
    filteredDatasetFieldsSelector,
    obligatoryFiltersSelector,
    optionsSelector,
} from '../../store/selectors';
import type {ObligatoryFilter} from '../../typings/dataset';
import type {UpdateDatasetByValidationData, Validation} from '../../typings/redux';

interface OwnProps {
    readonly: boolean;
}
interface DatasetFiltersProps extends OwnProps {
    fields: DatasetField[];
    obligatoryFilters: ObligatoryFilter[];
    validation: Validation;
    options: DatasetOptions;
    addObligatoryFilter: (data: ApplyData) => void;
    updateObligatoryFilter: (data: ApplyData) => void;
    deleteObligatoryFilter: (filtetId: string) => void;
    updateDatasetByValidation: (data?: UpdateDatasetByValidationData) => void;
}

class DatasetFilters extends React.Component<DatasetFiltersProps> {
    render() {
        const {fields, obligatoryFilters, validation, options, readonly} = this.props;

        return (
            <FilterSection
                readonly={readonly}
                type={FilterType.Obligatory}
                fields={fields}
                filters={obligatoryFilters}
                options={options}
                progress={validation.isLoading}
                addFilter={this.addObligatoryFilter}
                updateFilter={this.updateObligatoryFilter}
                deleteFilter={this.deleteObligatoryFilter}
            />
        );
    }

    addObligatoryFilter = (data: ApplyData) => {
        this.props.addObligatoryFilter(data);
        this.props.updateDatasetByValidation();
    };

    updateObligatoryFilter = (data: ApplyData) => {
        this.props.updateObligatoryFilter(data);
        this.props.updateDatasetByValidation();
    };

    deleteObligatoryFilter = (filterId: string) => {
        this.props.deleteObligatoryFilter(filterId);
        this.props.updateDatasetByValidation();
    };
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        fields: filteredDatasetFieldsSelector(state),
        obligatoryFilters: obligatoryFiltersSelector(state),
        validation: datasetValidationSelector(state),
        options: optionsSelector(state),
    };
};

const mapDispatchToProps = {
    addObligatoryFilter,
    updateObligatoryFilter,
    deleteObligatoryFilter,
    updateDatasetByValidation,
};

export default compose<DatasetFiltersProps, OwnProps>(connect(mapStateToProps, mapDispatchToProps))(
    DatasetFilters,
);
