import React from 'react';

import {Lock} from '@gravity-ui/icons';
import {Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {getEntryNameByKey} from 'shared/modules';
import navigateHelper from 'ui/libs/navigateHelper';

import {EntryIcon} from '../EntryIcon/EntryIcon';

import './EntryRow.scss';

const b = block('entry-row');

const i18n = I18n.keyset('component.entry-row.view');

export type RowEntryData = {
    entryId: string;
    disabled?: boolean;
    key: string;
    name?: string;
    scope: string;
    type: string;
    isLocked?: boolean;
};

export type EntryRowProps = {
    nonInteractive?: boolean;
    rightSectionSlot?: React.ReactNode;
    className?: string;
    enableHover?: boolean;
    showUndefinedIcon?: boolean;
} & (RowWithEntry | CustomRow);

type RowWithEntry = {entry: RowEntryData; name?: string; showUndefinedIcon?: boolean};
type CustomRow = {entry?: RowEntryData; name: string; showUndefinedIcon: true};

const getName = (entry?: RowEntryData, name?: string) => {
    if (!entry || name) {
        return name;
    }
    return entry.name ? entry.name : getEntryNameByKey({key: entry.key, index: -1});
};

export const EntryRow = ({
    entry,
    rightSectionSlot = null,
    nonInteractive,
    className,
    enableHover,
    name,
    showUndefinedIcon,
}: EntryRowProps) => {
    const entryName = getName(entry, name);

    const renderLock = () => {
        if (!entry || !entry.isLocked) {
            return false;
        }
        return (
            <div className={b('locked-label')}>
                <Icon data={Lock} /> {i18n('label_no-access')}
            </div>
        );
    };

    const renderIcon = () => {
        return (
            <EntryIcon
                entry={showUndefinedIcon ? {scope: 'broken'} : entry}
                width={24}
                height={24}
                className={b('icon', {disabled: entry?.disabled})}
            />
        );
    };

    const showWithoutLink = nonInteractive || !entry;

    return (
        <div
            key={entry?.entryId || name}
            className={b(
                {
                    'non-interactive': nonInteractive,
                    locked: entry?.isLocked,
                    hoverable: enableHover,
                },
                className,
            )}
        >
            <div className={b('entry')}>
                {showWithoutLink ? (
                    <React.Fragment>
                        {renderIcon()}
                        <div className={b('name')} title={entryName}>
                            {entryName}
                            {renderLock()}
                        </div>
                    </React.Fragment>
                ) : (
                    <Link
                        view={entry.disabled ? 'secondary' : 'primary'}
                        target="_blank"
                        className={b('text-block')}
                        title={entryName}
                        href={navigateHelper.redirectUrlSwitcher(entry)}
                    >
                        {renderIcon()}
                        <span className={b('name')}>{entryName}</span>
                        {renderLock()}
                    </Link>
                )}
            </div>
            {rightSectionSlot}
        </div>
    );
};
