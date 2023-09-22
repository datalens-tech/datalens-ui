import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ErrorContent} from 'ui';

import './IndexPage.scss';

const i18n = I18n.keyset('preview');

const b = block('index-page');

function IndexPage() {
    const {requestId} = window.DL;
    return (
        <div className={b()}>
            <ErrorContent type="not-found" title={i18n('label_not-found')} reqId={requestId} />
        </div>
    );
}

export default IndexPage;
