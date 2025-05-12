import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import type {TextProps, useLayoutContext} from '@gravity-ui/uikit';

interface SectionHeaderProps {
    title: string;
    activeMediaQuery?: ReturnType<typeof useLayoutContext>['activeMediaQuery'];
}

export function SectionHeader({activeMediaQuery, title}: SectionHeaderProps) {
    const isActiveMediaQueryS = activeMediaQuery === 's';
    const textVariant: TextProps['variant'] = isActiveMediaQueryS ? 'header-2' : 'header-1';
    const icon = isActiveMediaQueryS ? <ChevronRight /> : <ArrowRight />;

    return (
        <Flex alignItems="center" justifyContent="space-between">
            <Text variant={textVariant}>{title}</Text>
            <Button view="flat" size="l">
                <Button.Icon>{icon}</Button.Icon>
            </Button>
        </Flex>
    );
}
