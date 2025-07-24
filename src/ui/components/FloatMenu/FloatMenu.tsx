import React from 'react';

import {Flex, Portal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {DL} from 'ui/constants';

import './FloatMenu.scss';

const b = block('dl-float-menu');

interface FloatMenuProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

const MOBILE_PAGE_SCROLLABLE_CONTAINER_CLASSNAME = 'dl-mobile-header__content';

const MIN_SCROLL_POSITION_FOR_HIDING = 100;

export function FloatMenu({children, align = 'center'}: FloatMenuProps) {
    const [isVisible, setIsVisible] = React.useState(true);
    const prevScrollY = React.useRef(0);

    const scrollableContainer = React.useMemo(() => {
        const defaultScrollingContainer = document.scrollingElement;
        return DL.IS_MOBILE
            ? document.getElementsByClassName(MOBILE_PAGE_SCROLLABLE_CONTAINER_CLASSNAME)?.[0]
            : defaultScrollingContainer;
    }, []);
    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = scrollableContainer?.scrollTop || 0;

            if (
                currentScrollY < prevScrollY.current &&
                currentScrollY > MIN_SCROLL_POSITION_FOR_HIDING
            ) {
                setIsVisible(true);
            } else if (currentScrollY > prevScrollY.current) {
                setIsVisible(false);
            }

            prevScrollY.current = currentScrollY;
        };

        scrollableContainer?.addEventListener('scroll', handleScroll, {passive: true});

        return () => {
            scrollableContainer?.removeEventListener('scroll', handleScroll);
        };
    }, [scrollableContainer]);

    return (
        <Portal>
            <Flex justifyContent={align} className={b({hidden: !isVisible})}>
                <div className={b('content')}>{children}</div>
            </Flex>
        </Portal>
    );
}
