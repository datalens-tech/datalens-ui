import React from 'react';

import {Button, CopyToClipboard} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {MOBILE_SIZE, isMobileView} from 'ui/utils/mobile';

import './DebugInfo.scss';

type Props = {
    requestId: string;
    traceId?: string;
};

const b = block('debug-info');
const i18n = I18n.keyset('component.error-dialog.view');

const DebugInfo: React.FC<Props> = ({requestId, traceId}: Props) => {
    return (
        <div className={b({mobile: isMobileView})}>
            <div className={b('info-values')}>
                <div className={b('info-line')}>
                    <span className={b('caption')}>{i18n('label_request-id')}</span>
                    <span className={b('value')} title={requestId}>
                        {requestId}
                    </span>
                </div>
                {traceId && (
                    <div className={b('info-line')}>
                        <span className={b('caption')}>{i18n('label_trace-id')}</span>
                        <span className={b('value')} title={requestId}>
                            {traceId}
                        </span>
                    </div>
                )}
            </div>
            <div className={b('copy-btn')}>
                <CopyToClipboard
                    text={`${i18n('label_request-id')} ${requestId}, ${i18n(
                        'label_trace-id',
                    )} ${traceId}`}
                    timeout={1000}
                >
                    {() => (
                        <Button
                            view={isMobileView ? 'flat' : 'flat-secondary'}
                            size={isMobileView ? MOBILE_SIZE.BUTTON : 'm'}
                        >
                            {i18n('button_copy')}
                        </Button>
                    )}
                </CopyToClipboard>
            </div>
        </div>
    );
};

export default DebugInfo;
