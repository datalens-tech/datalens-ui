import React from 'react';

import {I18n} from 'i18n';

import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const ParametersSection = () => {
    return <SectionWrapper withCollapse={true} title={i18n('field_params')}></SectionWrapper>;
};
