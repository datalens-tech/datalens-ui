import React from 'react';

import {type ConnectedProps, connect} from 'react-redux';
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

interface OwnProps {
    readonly: boolean;
}

type DatasetFiltersProps = OwnProps & ConnectedProps<typeof connector>;

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

const connector = connect(mapStateToProps, mapDispatchToProps);

export default connector(DatasetFilters);
