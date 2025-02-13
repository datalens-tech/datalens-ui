import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ErrorContentTypes} from 'shared/constants';
import ErrorContent from 'ui/components/ErrorContent/ErrorContent';

import './AccessErrorPage.scss';

const i18n = I18n.keyset('datalens.landing.error');

const b = block('settings-access-error-page');

const AccessErrorPage = () => (
    <Flex className={b()} direction="column" grow="1">
        <ErrorContent
            title={i18n('label_title-forbidden-entry')}
            type={ErrorContentTypes.NO_ACCESS}
            showDebugInfo={false}
        />
    </Flex>
);

export default AccessErrorPage;
