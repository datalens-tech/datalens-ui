import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {TextProps, useLayoutContext} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';

import {getAllPageUrl} from '../../utils';

interface SectionHeaderProps {
    title: string;
    activeMediaQuery?: ReturnType<typeof useLayoutContext>['activeMediaQuery'];
    category?: string;
    className?: string;
}

export function SectionHeader({activeMediaQuery, title, category, className}: SectionHeaderProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const textVariant: TextProps['variant'] = isActiveMediaQueryS ? 'header-2' : 'header-1';
    const icon = isActiveMediaQueryS ? <ChevronRight /> : <ArrowRight />;

    const history = useHistory();

    const handleClick = React.useCallback(() => {
        const url = getAllPageUrl({category});
        history.push(url);
    }, [history, category]);

    return (
        <Flex alignItems="center" justifyContent="space-between" className={className}>
            <Text variant={textVariant}>{title}</Text>
            <Button view="flat" size="l" onClick={handleClick}>
                <Button.Icon>{icon}</Button.Icon>
            </Button>
        </Flex>
    );
}
