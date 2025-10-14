import React from 'react';

import {Flex, Portal} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useScrollableContainerContext} from 'ui/utils/scrollableContainerContext';

import './FloatMenu.scss';

const b = block('dl-float-menu');

interface FloatMenuProps {
    children: React.ReactNode;
    align?: 'left' | 'center' | 'right';
    container?: HTMLElement;
}

const MIN_SCROLL_POSITION_FOR_HIDING = 100;

export function FloatMenu({children, align = 'center', container}: FloatMenuProps) {
    const [isVisible, setIsVisible] = React.useState(true);
    const prevScrollY = React.useRef(0);

    const {scrollableContainerRef} = useScrollableContainerContext();

    React.useEffect(() => {
        const defaultScrollingContainer = document.scrollingElement;
        const scrollableContainer = scrollableContainerRef?.current ?? defaultScrollingContainer;

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
    }, [scrollableContainerRef]);

    return (
        <Portal container={container}>
            <Flex justifyContent={align} className={b({hidden: !isVisible})}>
                <div className={b('content')}>{children}</div>
            </Flex>
        </Portal>
    );
}
