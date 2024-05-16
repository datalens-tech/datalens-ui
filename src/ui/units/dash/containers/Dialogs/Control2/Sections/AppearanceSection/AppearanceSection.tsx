import React from 'react';

import {I18n} from 'i18n';

import {Feature} from '../../../../../../../../shared';
import Utils from '../../../../../../../../ui/utils';
import {SectionWrapper} from '../../../../../../../components/SectionWrapper/SectionWrapper';

import {HintRow} from './Rows/HintRow/HintRow';
import {InnerTitleRow} from './Rows/InnerTitleRow/InnerTitleRow';
import {TitleRow} from './Rows/TitleRow/TitleRow';

import './AppearanceSection.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

const AppearanceSection = () => {
    const canSetHint = Utils.isEnabledFeature(Feature.FieldHint);

    return (
        <SectionWrapper title={i18n('label_section-appearance')}>
            <TitleRow />
            <InnerTitleRow />
            {canSetHint && <HintRow />}
        </SectionWrapper>
    );
};

export {AppearanceSection};
