import React from 'react';

import {Flex, Progress, Text} from '@gravity-ui/uikit';
import type {ProgressProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './ProgressBar.scss';

const b = block('progress-bar');

type ProgressBarProps = Omit<ProgressProps, 'text' | 'value'> & {
    progressText?: string | number;
    textClassName?: string;
    value: number;
};

export const ProgressBar = ({
    className,
    progressText,
    textClassName,
    ...props
}: ProgressBarProps) => {
    const displayedProgresstext = progressText || `${props.value}%`;
    return (
        <Flex gap={2} direction="column">
            <Progress {...props} className={b('line', className)} />
            <Text className={textClassName} variant="body-1">
                {displayedProgresstext}
            </Text>
        </Flex>
    );
};
