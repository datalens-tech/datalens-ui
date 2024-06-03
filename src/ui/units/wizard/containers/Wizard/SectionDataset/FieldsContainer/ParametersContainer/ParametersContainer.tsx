import React from 'react';

import {i18n} from 'i18n';
import {useSelector} from 'react-redux';
import {selectParameters} from 'units/wizard/selectors/dataset';

import {SectionDatasetQA} from '../../../../../../../../shared/constants/qa/wizard';
import type {CommonContainerProps} from '../FieldsContainer';
import {SectionContainer} from '../components/SectionContainer/SectionContainer';

type ParametersContainerProps = CommonContainerProps;

export const ParametersContainer: React.FC<ParametersContainerProps> = (
    props: ParametersContainerProps,
) => {
    const {wrapTo, appliedSearchPhrase} = props;
    const parameters = useSelector(selectParameters);

    const title = i18n('wizard', 'section_parameters');

    if (!parameters.length) {
        return null;
    }

    return (
        <SectionContainer
            appliedSearchPhrase={appliedSearchPhrase}
            wrapTo={wrapTo}
            items={parameters}
            title={title}
            qa={SectionDatasetQA.SectionParameters}
        />
    );
};
