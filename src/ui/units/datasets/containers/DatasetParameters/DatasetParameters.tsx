import React from 'react';

import {useDispatch, useSelector} from 'react-redux';

import {ParametersSection} from '../../components/ParametersSection/ParametersSection';
import {TAB_PARAMETERS} from '../../constants';
import {openDialogParameterCreate} from '../../store/actions/creators';
import {datasetValidationSelector, filteredDatasetParametersSelector} from '../../store/selectors';

export const DatasetParameters: React.FC = () => {
    const dispatch = useDispatch();

    const parameters = useSelector(filteredDatasetParametersSelector);
    const validation = useSelector(datasetValidationSelector);

    const handleOpenDialogClick = React.useCallback(() => {
        dispatch(openDialogParameterCreate({tab: TAB_PARAMETERS}));
    }, [dispatch]);

    return (
        <ParametersSection
            parameters={parameters}
            isLoading={validation.isLoading}
            onOpenDialogClick={handleOpenDialogClick}
        />
    );
};
