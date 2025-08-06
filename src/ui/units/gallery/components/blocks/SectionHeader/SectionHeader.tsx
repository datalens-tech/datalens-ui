import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Button, Flex} from '@gravity-ui/uikit';
import type {useLayoutContext} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';
import {Link as RouterLink} from 'react-router-dom';

import {block, getAllPageUrl} from '../../utils';

import './SectionHeader.scss';

const b = block('section-header');

interface SectionHeaderProps {
    title: string;
    activeMediaQuery?: ReturnType<typeof useLayoutContext>['activeMediaQuery'];
    category?: string;
    className?: string;
}

export function SectionHeader({activeMediaQuery, title, category, className}: SectionHeaderProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const icon = isActiveMediaQueryS ? <ChevronRight /> : <ArrowRight />;

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
            >
                {title}
            </RouterLink>
            <Button view="flat" size="l" onClick={handleClick}>
                <Button.Icon>{icon}</Button.Icon>
            </Button>
        </Flex>
    );
}
