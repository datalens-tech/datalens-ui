import React from 'react';

import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {OperationSelector} from '../../OperationSelector/OperationSelector';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {DatasetSelector} from '../DatasetSelector/DatasetSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';

const i18n = I18n.keyset('dash.control-dialog.edit');

type DatasetSettingsProps = {
    isSectionHidden?: boolean;
};

const DatasetSettings = ({isSectionHidden}: DatasetSettingsProps) => {
    return (
        <React.Fragment>
            <SectionWrapper
                isStylesHidden={isSectionHidden}
                title={isSectionHidden ? '' : i18n('label_common-settings')}
            >
                <DatasetSelector />
                <InputTypeSelector />
                <OperationSelector />
                <ValueSelector />
            </SectionWrapper>
        </React.Fragment>
    );
};

export {DatasetSettings};
