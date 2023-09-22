import React from 'react';

import block from 'bem-cn-lite';

import './FieldWrapper.scss';

const b = block('yc-field-wrapper');

export interface FieldWrapperProps {
    children: React.ReactNode;
    error?: string;
    className?: string;
}

function renderError(errorText: string) {
    return <div className={b('error-text')}>{errorText}</div>;
}

export function FieldWrapper({error, children, className}: FieldWrapperProps) {
    return (
        <span className={b({state: Boolean(error) && 'error'}, className)}>
            {children}
            {error && renderError(error)}
        </span>
    );
}
