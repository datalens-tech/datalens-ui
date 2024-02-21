import React from 'react';

import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../../../components/SectionWrapper/SectionWrapper';
import {ELEMENT_TYPE} from '../../../../Control/constants';
import {ValueSelector} from '../../ValueSelector/ValueSelector';
import {InputTypeSelector} from '../InputTypeSelector/InputTypeSelector';
import {getElementOptions} from '../helpers/input-type-select';

const i18n = I18n.keyset('dash.control-dialog.edit');
export const ConnectionSettings: React.FC = () => {
    const options = React.useMemo(() => {
        const allowedOptions: Record<string, boolean> = {
            [ELEMENT_TYPE.SELECT]: true,
            [ELEMENT_TYPE.INPUT]: true,
        };
        return getElementOptions().filter(({value}) => allowedOptions[value]);
    }, []);

    return (
        <SectionWrapper title={i18n('label_common-settings')}>
            <InputTypeSelector options={options} />
            <ValueSelector />
        </SectionWrapper>
    );
};
