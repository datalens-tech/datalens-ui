import React from 'react';

import {I18n} from 'i18n';

import {SectionWrapper} from '../../../SectionWrapper/SectionWrapper';

import {HintRow} from './Rows/HintRow/HintRow';
import {InnerTitleRow} from './Rows/InnerTitleRow/InnerTitleRow';
import {TitleRow} from './Rows/TitleRow/TitleRow';

import './AppearanceSection.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');

const AppearanceSection = () => {
    return (
        <SectionWrapper title={i18n('label_section-appearance')}>
            <TitleRow />
            <InnerTitleRow />
            <HintRow />
        </SectionWrapper>
    );
};

export {AppearanceSection};
