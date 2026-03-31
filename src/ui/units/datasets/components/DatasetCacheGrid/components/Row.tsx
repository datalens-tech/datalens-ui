import React from 'react';

import {Text} from '@gravity-ui/uikit';

type RowProps = {
    label: string;
    children: React.ReactNode;
};

export const Row = ({label, children}: RowProps) => {
    return (
        <React.Fragment>
            <Text variant="body-1">{label}</Text>
            <div>{children}</div>
        </React.Fragment>
    );
};
