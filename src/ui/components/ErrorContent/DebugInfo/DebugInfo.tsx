import React from 'react';

import {Button, CopyToClipboard} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DL} from 'ui/constants/common';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import './DebugInfo.scss';

const i18n = I18n.keyset('component.error-content.view');
const b = block('error-debug-info');

type DebugInfoProps = {
    id: string;
    name: string;
    noControls: boolean;
};

export const DebugInfo = ({id, noControls, name}: DebugInfoProps) => {
    const handleCopy = () => {
        if (DL.IS_MOBILE) {
            toaster.add({
                name: 'successCopyDebugInfo',
                theme: 'success',
                title: i18n('toast_copied'),
            });
        }
    };

    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
            {!DL.IS_MOBILE && <span>{name}: </span>}
            <span className={b('copy-id')}>{id}</span>
            {!noControls && (
                <CopyToClipboard text={id} timeout={1000} onCopy={handleCopy}>
                    {() => (
                        <Button
                            className={b('copy-btn')}
                            view="flat-secondary"
                            size={DL.IS_MOBILE ? MOBILE_SIZE.BUTTON : 'm'}
                        >
                            {DL.IS_MOBILE
                                ? i18n('button_copy', {subject: name})
                                : i18n('button_copy', {subject: ''}).trim()}
                        </Button>
                    )}
                </CopyToClipboard>
            )}
        </div>
    );
};
