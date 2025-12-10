import React from 'react';

import block from 'bem-cn-lite';
import {REBRANDING_PRODUCT_NAME} from 'ui/constants';

import './LogoText.scss';

const b = block('aside-header-logo-text');

export type LogoTextProps = {
    installationInfo?: string;
    productName?: string;
    installationInfoClassName?: string;
};

export const LogoText = React.forwardRef<HTMLDivElement, LogoTextProps>(
    ({installationInfo, productName, installationInfoClassName}, ref) => {
        const showInstallation = installationInfo;
        const defaultProductName = REBRANDING_PRODUCT_NAME;

        return (
            <div className={b()}>
                <div className={b('title')}>{productName || defaultProductName}</div>
                {showInstallation && (
                    <div ref={ref} className={b('installation-info', installationInfoClassName)}>
                        {installationInfo}
                    </div>
                )}
            </div>
        );
    },
);

LogoText.displayName = 'LogoText';
