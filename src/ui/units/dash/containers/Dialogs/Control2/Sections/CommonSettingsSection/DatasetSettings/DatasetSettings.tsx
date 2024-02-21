import React from 'react';

import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DATASET_FIELD_TYPES, DashTabItemControlSourceType, DatasetFieldType} from 'shared';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {
    selectSelectorControlType,
    selectSelectorDialog,
} from '../../../../../../store/selectors/dashTypedSelectors';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {DatasetSelector} from '../DatasetSelector/DatasetSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {getElementOptions} from '../helpers/input-type-select';

const i18n = I18n.keyset('dash.control-dialog.edit');

type DatasetSettingsProps = {
    isSectionHidden?: boolean;
};

const DatasetSettings = ({isSectionHidden}: DatasetSettingsProps) => {
    const {datasetFieldType, sourceType, fieldType} = useSelector(selectSelectorDialog);
    const controlType = useSelector(selectSelectorControlType);
    const options = React.useMemo(() => {
        const disabledOptions: Record<string, boolean> = {
            [ELEMENT_TYPE.DATE]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                ((controlType !== ELEMENT_TYPE.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.DATE &&
                    fieldType !== DATASET_FIELD_TYPES.DATETIME &&
                    fieldType !== DATASET_FIELD_TYPES.GENERICDATETIME) ||
                    datasetFieldType === DatasetFieldType.Measure),
            [ELEMENT_TYPE.SELECT]: datasetFieldType === DatasetFieldType.Measure,
            [ELEMENT_TYPE.CHECKBOX]:
                sourceType === DashTabItemControlSourceType.Dataset &&
                fieldType !== DATASET_FIELD_TYPES.BOOLEAN,
        };
        return getElementOptions().map((v) => ({...v, disabled: disabledOptions[v.value]}));
    }, [sourceType, fieldType, controlType, datasetFieldType]);

    return (
        <React.Fragment>
            <SectionWrapper
                isStylesHidden={isSectionHidden}
                title={isSectionHidden ? '' : i18n('label_common-settings')}
            >
                <DatasetSelector />
                <InputTypeSelector options={options} />
                <OperationSelector />
                <ValueSelector />
            </SectionWrapper>
        </React.Fragment>
    );
};

export {DatasetSettings};
