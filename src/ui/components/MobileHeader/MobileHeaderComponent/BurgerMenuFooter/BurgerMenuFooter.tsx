import React from 'react';

import {CircleQuestion, Gear} from '@gravity-ui/icons';
import {MobileHeaderFooterItem} from '@gravity-ui/navigation';
import {DOCUMENTATION_LINK} from 'ui/components/AsideHeaderAdapter';
import {Settings} from 'ui/components/AsideHeaderAdapter/Settings/Settings';

export const BurgerMenuFooter = () => {
    const [showSettings, setShowSettings] = React.useState(false);

    const onClickSettings = () => {
        setShowSettings(true);
    };

    const onClickSupport = () => {
        window.open(DOCUMENTATION_LINK);
    };

    return (
        <React.Fragment>
            <MobileHeaderFooterItem
                icon={Gear}
                modalItem={{
                    visible: showSettings,
                    title: 'Settings',
                    onClose: () => setShowSettings(false),
                    renderContent: () => {
                        return <Settings />;
                    },
                }}
                onClick={onClickSettings}
            />
            <MobileHeaderFooterItem
                modalItem={{visible: false}}
                icon={CircleQuestion}
                onClick={onClickSupport}
            />
        </React.Fragment>
    );
};
