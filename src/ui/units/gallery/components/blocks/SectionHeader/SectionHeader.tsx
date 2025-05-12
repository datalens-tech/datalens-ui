import React from 'react';

import {ArrowRight, ChevronRight} from '@gravity-ui/icons';
import {Button, Flex} from '@gravity-ui/uikit';
import type {useLayoutContext} from '@gravity-ui/uikit';

import {block} from '../../utils';

import './SectionHeader.scss';

const b = block('section-header');

interface SectionHeaderProps {
    title: string;
    activeMediaQuery?: ReturnType<typeof useLayoutContext>['activeMediaQuery'];
}

export function SectionHeader({activeMediaQuery, title}: SectionHeaderProps) {
    const icon = activeMediaQuery === 's' ? <ChevronRight /> : <ArrowRight />;

    return (
        <Flex className={b({media: activeMediaQuery})}>
            {title}
            <Button view="flat" size="l">
                <Button.Icon>{icon}</Button.Icon>
            </Button>
        </Flex>
    );
}
