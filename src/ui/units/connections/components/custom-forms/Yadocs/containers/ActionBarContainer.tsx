import React from 'react';

import block from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {ConnectorType} from 'shared';

import {newConnectionSelector} from '../../../../store';
import {FormTitle} from '../../../FormTitle/FormTitle';
import {AdditionalTitleContent} from '../components';
import {i18n8857} from '../constants';

const b = block('conn-form-yadocs');

export const ActionBarContainer = () => {
    const newConnection = useSelector(newConnectionSelector);
    const additionalContent = <AdditionalTitleContent />;

    return (
        <FormTitle
            className={b('title')}
            type={ConnectorType.Yadocs}
            title={i18n8857['label_form-tile']}
            additionalContent={additionalContent}
            showArrow={newConnection}
        />
    );
};
