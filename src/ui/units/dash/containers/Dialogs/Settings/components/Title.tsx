import React from 'react';

import block from 'bem-cn-lite';

const b = block('dialog-settings');

type TitleProps = {
    text: string;
    titleMods?: string;
};

export const Title: React.FC<TitleProps> = ({text, titleMods, children}) => {
    const titleModsVal = titleMods ? {[titleMods]: true} : null;
    return (
        <div className={b('title', titleModsVal)}>
            <span>{text}</span>
            {children}
        </div>
    );
};
