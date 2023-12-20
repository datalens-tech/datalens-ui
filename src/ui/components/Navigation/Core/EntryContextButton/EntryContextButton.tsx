import React from 'react';

import {Ellipsis} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import type {NavigationEntry} from '../../../../../shared/schema';

type OnClickArgs = {
    buttonRef: React.RefObject<HTMLDivElement>;
    entry: NavigationEntry;
    event: React.MouseEvent<HTMLDivElement, MouseEvent>;
};

export type EntryContextButtonProps = {
    entry: NavigationEntry;
    onClick: (args: OnClickArgs) => void;
    className?: string;
};

const EntryContextButton = ({onClick, entry, className}: EntryContextButtonProps) => {
    const buttonRef = React.useRef<HTMLDivElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();
        onClick({event, buttonRef, entry});
    };

    return (
        <div className={className} onClick={handleClick} ref={buttonRef}>
            <Icon data={Ellipsis} size={16} />
        </div>
    );
};

export default EntryContextButton;
