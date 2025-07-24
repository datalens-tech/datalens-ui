import React from 'react';

import {Pin} from '@gravity-ui/icons';
import {Button, Icon, Sheet} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './FixedHeaderMobile.scss';

const b = block('dash-fixed-header-mobile');

const DASHKIT_MOBILE_LAYOUT_CLASSNAME = 'dashkit-mobile-layout';

export function FixedHeaderMobile({
    fixedHeaderControlsRef,
    fixedHeaderContainerRef,
}: {
    fixedHeaderControlsRef: React.RefCallback<HTMLDivElement>;
    fixedHeaderContainerRef: React.RefCallback<HTMLDivElement>;
}) {
    const [sheetVisible, setSheetVisible] = React.useState(false);

    const toggleSheet = () => {
        setSheetVisible((prevSheetVisible) => !prevSheetVisible);
    };

    return (
        <React.Fragment>
            <Button onClick={toggleSheet} view="flat">
                <Icon size={24} data={Pin} />
            </Button>
            <Sheet
                className={b(null, DASHKIT_MOBILE_LAYOUT_CLASSNAME)}
                visible={sheetVisible}
                allowHideOnContentScroll
                onClose={toggleSheet}
            >
                <div ref={fixedHeaderControlsRef} className={b('controls-placeholder')}></div>
                <div ref={fixedHeaderContainerRef} className={b('container-placeholder')}></div>
            </Sheet>
        </React.Fragment>
    );
}
