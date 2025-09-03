import React from 'react';

import type {ButtonButtonProps} from '@gravity-ui/uikit';

import {ErrorContent} from '../../';

// TODO: in theory, LandingPage will have to use this component for errors
// TODO: or ErrorContent should learn to accept and parse error

// TODO: add a header here, to get possibility to wrap on the App level

export interface ErrorPageProps {
    error: Error;
    action?: {
        text: string;
        content: React.ReactNode;
        handler: ButtonButtonProps['onClick'];
    };
    style?: React.CSSProperties;
}

const ErrorPage: React.FC<ErrorPageProps> = (props) => {
    return <ErrorContent error={props.error} action={props.action} style={props.style} />;
};

export default ErrorPage;
