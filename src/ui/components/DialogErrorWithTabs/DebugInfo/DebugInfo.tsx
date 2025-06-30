import React from 'react';

import {Button, CopyToClipboard} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DL} from 'ui/constants/common';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import './DebugInfo.scss';

type Props = {
    requestId: string;
    traceId?: string;
    importId?: string;
    exportId?: string;
};

const b = block('debug-info');
const i18n = I18n.keyset('component.error-dialog.view');

const DebugInfo: React.FC<Props> = ({requestId, traceId, importId, exportId}: Props) => {
    const getClipboardText = () => {
        const parts = [`${i18n('label_request-id')} ${requestId}`];

        if (traceId) {
            parts.push(`${i18n('label_trace-id')} ${traceId}`);
        }

        if (importId) {
            parts.push(`${i18n('label_import-id')} ${importId}`);
        }

        if (exportId) {
            parts.push(`${i18n('label_export-id')} ${exportId}`);
        }

        return parts.join(', ');
    };
    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
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
                {importId && (
                    <div className={b('info-line')}>
                        <span className={b('caption')}>{i18n('label_import-id')}</span>
                        <span className={b('value')} title={importId}>
                            {importId}
                        </span>
                    </div>
                )}
                {exportId && (
                    <div className={b('info-line')}>
                        <span className={b('caption')}>{i18n('label_export-id')}</span>
                        <span className={b('value')} title={exportId}>
                            {exportId}
                        </span>
                    </div>
                )}
            </div>
            <div className={b('copy-btn')}>
                <CopyToClipboard text={getClipboardText()} timeout={1000}>
                    {() => (
                        <Button
                            view={DL.IS_MOBILE ? 'flat' : 'flat-secondary'}
                            size={DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 'm'}
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
