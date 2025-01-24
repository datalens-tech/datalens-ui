import React from 'react';

import {Flex} from '@gravity-ui/uikit';

type Props = {
    title?: string;
    children: React.ReactNode;
};

export const Row = ({children, title}: Props) => {
    return (
        <Flex gap="2">
            <Flex shrink={0} width={160} alignItems="center">
                {title}
            </Flex>
            <Flex grow={1} direction="column">
                {children}
            </Flex>
        </Flex>
    );
};
