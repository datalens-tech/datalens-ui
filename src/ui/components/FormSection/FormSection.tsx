import React from 'react';

import {Flex, Loader, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './FormSection.scss';

export const b = block('form-section');

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    showLoader?: boolean;
}

export function FormSection({title, children, className, showLoader}: FormSectionProps) {
    return (
        <div className={b(null, className)}>
            <Flex gap={4} className={b('title-wrapper')} alignItems="center">
                <Text className={b('title')} variant="subheader-2">
                    {title}
                </Text>
                {showLoader && <Loader size="s" />}
            </Flex>
            {children}
        </div>
    );
}
