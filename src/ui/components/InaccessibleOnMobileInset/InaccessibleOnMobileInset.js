import React from 'react';

import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {ErrorContentTypes} from 'shared';
import {ErrorContent} from 'ui';

import './InaccessibleOnMobileInset.scss';

const b = block('inaccessible-on-mobile-inset');

export default function InaccessibleOnMobile(props) {
    return (
        <div className={b()}>
            <ErrorContent
                type={ErrorContentTypes.INACCESSIBLE_ON_MOBILE}
                title={i18n(
                    'component.inaccessible-on-mobile-inset.view',
                    'label_error-inaccessible-on-mobile-title',
                )}
                action={{
                    content: (
                        <div className={b('actions')}>
                            <Button className={b('action-button')} view="action" size="xl" href="/">
                                {i18n(
                                    'component.inaccessible-on-mobile-inset.view',
                                    'button_back-to-main-page',
                                )}
                            </Button>
                            <Button
                                className={b('action-button')}
                                view="flat"
                                size="xl"
                                onClick={props.switchToDesktopVersion}
                            >
                                {i18n(
                                    'component.inaccessible-on-mobile-inset.view',
                                    'button_switch-to-desktop',
                                )}
                            </Button>
                        </div>
                    ),
                }}
            />
        </div>
    );
}
