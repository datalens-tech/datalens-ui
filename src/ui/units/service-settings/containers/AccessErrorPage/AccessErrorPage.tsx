import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ErrorContentTypes} from 'shared/constants';
import ErrorContent from 'ui/components/ErrorContent/ErrorContent';

import './AccessErrorPage.scss';

const i18n = I18n.keyset('datalens.landing.error');

const b = block('settings-access-error-page');

const AccessErrorPage = () => (
    <div className={b()}>
        <ErrorContent
            title={i18n('label_title-forbidden-entry')}
            type={ErrorContentTypes.NO_ACCESS}
            showDebugInfo={false}
        />
    </div>
);

export default AccessErrorPage;
