import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Button, Flex, useLayoutContext} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';
import {Link as RouterLink} from 'react-router-dom';

import {block, getAllPageUrl} from '../../utils';

import './SectionHeader.scss';

const b = block('section-header');

interface SectionHeaderProps {
    title: string;
    category?: string;
    className?: string;
    ariaLabel?: string;
}

export function SectionHeader({title, category, className, ariaLabel}: SectionHeaderProps) {
    const {activeMediaQuery, isMediaActive} = useLayoutContext();
    const isMobileMediaQuery = !isMediaActive('m');
    const icon = isMobileMediaQuery ? <ChevronRight /> : <ArrowRight />;

    const history = useHistory();

    const handleClick = React.useCallback(() => {
        const url = getAllPageUrl({category});
        history.push(url);
    }, [history, category]);

    return (
        <Flex alignItems="center" justifyContent="space-between" className={className}>
            <RouterLink
                className={b('router-link', {media: activeMediaQuery})}
                to={getAllPageUrl({category})}
                aria-label={ariaLabel}
            >
                {title}
            </RouterLink>
            <Button view="flat" size="l" onClick={handleClick} aria-hidden>
                <Button.Icon>{icon}</Button.Icon>
            </Button>
        </Flex>
    );
}
