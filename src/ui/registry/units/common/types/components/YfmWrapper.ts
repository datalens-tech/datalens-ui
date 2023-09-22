import React from 'react';

export type YfmWrapperProps = {
    content: React.ReactNode | string;
    setByInnerHtml?: boolean;
    className?: string;
    noMagicLinks?: boolean;
};
