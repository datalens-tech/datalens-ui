import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Select} from '@gravity-ui/uikit';

const i18nConnectionBasedControlFake = (str: string) => str;
export const LabelSelector: React.FC = () => {
    return (
        <FormRow label={i18nConnectionBasedControlFake('field_label')}>
            <Select />
        </FormRow>
    );
};
