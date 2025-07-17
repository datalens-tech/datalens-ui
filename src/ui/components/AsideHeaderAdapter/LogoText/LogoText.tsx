import React from 'react';

import block from 'bem-cn-lite';
import {Feature} from 'shared/types';
import {PRODUCT_NAME, REBRANDING_PRODUCT_NAME} from 'ui/constants';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import './LogoText.scss';

const b = block('aside-header-logo-text');

export const LogoText = ({installationInfo}: {installationInfo?: string}) => {
    const isRebrandingEnabled = isEnabledFeature(Feature.EnableDLRebranding);
    const showInstallation = isRebrandingEnabled && installationInfo;
    const productName = isRebrandingEnabled ? REBRANDING_PRODUCT_NAME : PRODUCT_NAME;

    return (
        <div className={b()}>
            <div className={b('title', {rebranding: isRebrandingEnabled})}>{productName}</div>
            {showInstallation && (
                <div className={b('installation-info')}>{installationInfo.toUpperCase()}</div>
            )}
        </div>
    );
};
