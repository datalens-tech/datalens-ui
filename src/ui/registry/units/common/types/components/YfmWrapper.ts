import type React from 'react';

export type YfmWrapperProps = {
    content: React.ReactNode | string;
    setByInnerHtml?: boolean;
    className?: string;
    noMagicLinks?: boolean;
    metaScripts?: string[];
    ref?: React.Ref<HTMLDivElement>;
    onRenderCallback?: () => void;
};
