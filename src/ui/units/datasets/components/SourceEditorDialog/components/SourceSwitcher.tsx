import React from 'react';

import type {SegmentedRadioGroupProps as RadioButtonProps} from '@gravity-ui/uikit';
import {SegmentedRadioGroup as RadioButton} from '@gravity-ui/uikit';

import type {FreeformSource} from '../../../store/types';
import {getTranslate} from '../utils';

type SourceSwitcherProps = {
    onChange: RadioButtonProps['onChange'];
    freeformSources: FreeformSource[];
    selectedFreeformSource?: FreeformSource;
};

const getRadioButtonOptions = (freeformSources: FreeformSource[]) => {
    return freeformSources.map(({disabled, source_type: value, tab_title}) => (
        <RadioButton.Option
            key={value}
            content={getTranslate(tab_title)}
            value={value}
            disabled={disabled}
        />
    ));
};

export const SourceSwitcher: React.FC<SourceSwitcherProps> = (props) => {
    const {onChange, freeformSources, selectedFreeformSource} = props;

    return (
        <RadioButton
            qa="datasets-source-switcher"
            defaultValue={selectedFreeformSource?.source_type}
            onChange={onChange}
        >
            {getRadioButtonOptions(freeformSources)}
        </RadioButton>
    );
};
