import React from 'react';

import block from 'bem-cn-lite';
import moment from 'moment';

import {registry} from '../../registry';
import {EntryIcon} from '../EntryIcon/EntryIcon';

import type {EntryData} from './types';

import './EntryTitle.scss';

type EntryTitleTheme = 'title' | 'inline';

export interface EntryTitleProps {
    entry: EntryData;
    theme?: EntryTitleTheme;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    hasIcon?: boolean;
    date?: string;
    className?: string;
}

const b = block('dl-entry-title');
const DATE_FORMAT = 'DD.MM.YYYY';

const sizeIconByTheme = (theme: EntryTitleTheme) => {
    switch (theme) {
        case 'title':
            return '32';
        case 'inline':
        default:
            return '16';
    }
};

const iconSwitcher = (entry: EntryData, theme: EntryTitleTheme) => {
    const iconSize = sizeIconByTheme(theme);
    return <EntryIcon entry={entry} size={iconSize} />;
};

const EntryTitle = ({
    entry,
    theme = 'inline',
    onClick,
    hasIcon = true,
    date,
    className,
}: EntryTitleProps) => {
    const {getEntryName} = registry.common.functions.getAll();
    const entryName = getEntryName(entry);
    const isPointer = typeof onClick === 'function';
    const hasDate = Boolean(date);

    return (
        <div
            className={b({pointer: isPointer, theme}, className)}
            onClick={onClick}
            title={entryName}
            data-qa="entry-title"
        >
            {hasIcon && <div className={b('icon')}>{iconSwitcher(entry, theme)}</div>}
            <div className={b('info')}>
                <div className={b('name')}>
                    <span>{entryName}</span>
                </div>
                {hasDate && (
                    <div className={b('date')}>
                        <span>{moment(date).format(DATE_FORMAT)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntryTitle;
