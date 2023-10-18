import React from 'react';

import {CircleQuestion, Gear} from '@gravity-ui/icons';
import {MobileHeaderFooterItem} from '@gravity-ui/navigation';
import {I18n} from 'i18n';
import {DOCUMENTATION_LINK} from 'ui/components/AsideHeaderAdapter';
import {Settings} from 'ui/components/AsideHeaderAdapter/Settings/Settings';

const i18n = I18n.keyset('component.aside-header-settings.view');

const handleClickSupport = () => {
    window.open(DOCUMENTATION_LINK);
};

export const BurgerMenuFooter = () => {
    const [showSettings, setShowSettings] = React.useState(false);

    const handleClickSettings = () => {
        setShowSettings(true);
    };

    const handleCloseSettings = () => {
        setShowSettings(false);
    };

    return (
        <React.Fragment>
            <MobileHeaderFooterItem
                icon={Gear}
                modalItem={{
                    visible: showSettings,
                    title: i18n('label_title'),
                    onClose: handleCloseSettings,
                    renderContent: () => {
                        return <Settings />;
                    },
                }}
                onClick={handleClickSettings}
            />
            <MobileHeaderFooterItem
                modalItem={{visible: false}}
                icon={CircleQuestion}
                onClick={handleClickSupport}
            />
        </React.Fragment>
    );
};
