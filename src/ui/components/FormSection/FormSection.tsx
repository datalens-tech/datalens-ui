import React from 'react';

import {Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './FormSection.scss';

export const b = block('form-section');

interface FormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function FormSection({title, children, className}: FormSectionProps) {
    return (
        <div className={b(null, className)}>
            <Text className={b('title')} variant="subheader-2">
                {title}
            </Text>
            {children}
        </div>
    );
}
