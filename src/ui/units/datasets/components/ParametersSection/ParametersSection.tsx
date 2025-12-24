import React from 'react';

import {Alert, spacing} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useHistory, useLocation} from 'react-router';
import type {DatasetField} from 'shared';
import {ParametersQA} from 'shared';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import {DatasetTabSection} from '../DatasetTabSection/DatasetTabSection';

import {useParametersSection} from './useParametersSection';

type ParametersSectionProps = {
    parameters: DatasetField[];
    isLoading: boolean;
    onOpenDialogClick: () => void;
    readonly: boolean;
};

const i18n = I18n.keyset('dataset.parameters-tab.modify');

export const ParametersSection: React.FC<ParametersSectionProps> = (
    props: ParametersSectionProps,
) => {
    const {parameters, isLoading, readonly} = props;

    const history = useHistory();
    const location = useLocation();

    const {headerColumns, columns, controlSettings, onItemClick} = useParametersSection({readonly});

    const alertTitle =
        parameters.length > 0
            ? undefined
            : getSharedEntryMockText('dataset-parameters-readonly-alert-title');
    const alertMessage = getSharedEntryMockText(
        parameters.length > 0
            ? 'dataset-parameters-readonly-alert-message'
            : 'dataset-empty-parameters-readonly-alert-message',
    );

    return (
        <DatasetTabSection
            readonlyNotice={
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
            }
            readonly={readonly}
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
