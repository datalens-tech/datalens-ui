import React from 'react';

import {Button, CopyToClipboard, Toaster} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {isMobileView} from 'ui/utils/mobile';

import './DebugInfo.scss';

const i18n = I18n.keyset('component.error-content.view');
const b = block('error-debug-info');

const toaster = new Toaster();

type DebugInfoProps = {
    id: string;
    name: string;
    noControls: boolean;
};

export const DebugInfo = ({id, noControls, name}: DebugInfoProps) => {
    const handleCopy = () => {
        if (isMobileView) {
            toaster.add({
                name: 'successCopyDebugInfo',
                theme: 'success',
                title: i18n('toast_copied'),
            });
        }
    };

    return (
        <div className={b({mobile: isMobileView})}>
            {!isMobileView && <span>{name}: </span>}
            <span className={b('copy-id')}>{id}</span>
            {!noControls && (
                <CopyToClipboard text={id} timeout={1000} onCopy={handleCopy}>
                    {() => (
                        <Button
                            className={b('copy-btn')}
                            view="flat-secondary"
                            size={isMobileView ? 'xl' : 'm'}
                        >
                            {isMobileView
                                ? i18n('button_copy', {subject: name})
                                : i18n('button_copy', {subject: ''}).trim()}
                        </Button>
                    )}
                </CopyToClipboard>
            )}
        </div>
    );
};
