import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {generateRandomPassword} from './utils';

import './formControls.scss';

const i18n = I18n.keyset('auth.form-controls');

export const GeneratePasswordButton = ({
    onGenerate,
}: {
    onGenerate: (generatedPassword: string) => void;
}) => {
    const generatePassword = () => {
        onGenerate(generateRandomPassword());
    };

    return <Button onClick={generatePassword}>{i18n('button_generate-password')}</Button>;
};
