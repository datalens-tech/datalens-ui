import React from 'react';

import {I18n} from 'i18n';
import type {DatasetField} from 'shared';
import {ParametersQA} from 'shared';

import {DatasetTabSection} from '../DatasetTabSection/DatasetTabSection';

import {useParametersSection} from './useParametersSection';

type ParametersSectionProps = {
    parameters: DatasetField[];
    isLoading: boolean;
    onOpenDialogClick: () => void;
};

const i18n = I18n.keyset('dataset.parameters-tab.modify');

export const ParametersSection: React.FC<ParametersSectionProps> = (
    props: ParametersSectionProps,
) => {
    const {parameters, isLoading} = props;

    const {headerColumns, columns, controlSettings, onItemClick} = useParametersSection();

    return (
        <DatasetTabSection
            onItemClick={onItemClick}
            title={i18n('tab-parameters_title')}
            description={i18n('tab-parameters_description')}
            onOpenDialogClick={props.onOpenDialogClick}
            openDialogButtonText={i18n('tab-parameters_add-button')}
            fields={parameters}
            headerColumns={headerColumns}
            columns={columns}
            isListUpdating={isLoading}
            isListLoading={headerColumns.length === 0}
            controlSettings={controlSettings}
            qa={ParametersQA.ParametersTabSection}
        />
    );
};
