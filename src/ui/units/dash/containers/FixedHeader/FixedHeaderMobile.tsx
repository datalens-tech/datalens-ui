import React from 'react';

import {Pin} from '@gravity-ui/icons';
import {Button, Icon, Sheet} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './FixedHeaderMobile.scss';

const b = block('dash-fixed-header-mobile');

const DASHKIT_MOBILE_LAYOUT_CLASSNAME = 'dashkit-mobile-layout';

export function FixedHeaderMobile({
    fixedContentInitiallyOpened,
    fixedHeaderControlsRef,
    fixedHeaderContainerRef,
    fixedContentWidgetFocused,
}: {
    fixedContentInitiallyOpened?: boolean;
    fixedContentWidgetFocused?: boolean;
    fixedHeaderControlsRef: React.RefCallback<HTMLDivElement>;
    fixedHeaderContainerRef: React.RefCallback<HTMLDivElement>;
}) {
    const [sheetVisible, setSheetVisible] = React.useState(fixedContentInitiallyOpened ?? false);

    const toggleSheet = () => {
        setSheetVisible((prevSheetVisible) => !prevSheetVisible);
    };

    const contentRef = React.useRef<HTMLDivElement>(null);
    const [indicator, setIndicator] = React.useState<HTMLDivElement>();
    const setIndicatorRef = React.useCallback((el: HTMLDivElement) => {
        setIndicator(el);
    }, []);

    React.useLayoutEffect(() => {
        const resizeObserver = new ResizeObserver(([el]) => {
            const rect = el.contentRect;

            if (rect?.height) {
                contentRef.current?.style.setProperty(
                    '--fullscreen-widget-transform-y',
                    `${rect.height - window.innerHeight}px`,
                );
            }
        });

        if (indicator) {
            resizeObserver.observe(indicator);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [contentRef, indicator]);

    return (
        <React.Fragment>
            <Button onClick={toggleSheet} view="flat">
                <Icon size={24} data={Pin} />
            </Button>
            <Sheet
                className={b(null, DASHKIT_MOBILE_LAYOUT_CLASSNAME)}
                visible={sheetVisible}
                alwaysFullHeight={fixedContentWidgetFocused}
                allowHideOnContentScroll
                onClose={toggleSheet}
            >
                <div className={b('content')} ref={contentRef}>
                    <div className={b('indicator')} ref={setIndicatorRef} />
                    <div ref={fixedHeaderControlsRef} className={b('controls-placeholder')}></div>
                    <div ref={fixedHeaderContainerRef} className={b('container-placeholder')}></div>
                </div>
            </Sheet>
        </React.Fragment>
    );
}
