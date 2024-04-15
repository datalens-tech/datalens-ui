import React from 'react';

export type YfmWrapperProps = {
    content: React.ReactNode | string;
    setByInnerHtml?: boolean;
    className?: string;
    noMagicLinks?: boolean;
    ref?: React.Ref<HTMLDivElement>;
    onRenderCallback?: () => void;
};
