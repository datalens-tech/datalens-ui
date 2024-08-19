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

export type EntryRowProps = {
    entry: {
        entryId: string;
        disabled?: boolean;
        key: string;
        name?: string;
        scope: string;
        type: string;
        isLocked?: boolean;
    };
    nonInteractive?: boolean;
    rightSectionSlot?: React.ReactNode;
    className?: string;
    // TODO: Remove version with typo
    clasName?: string;
    enableHover?: boolean;
    name?: string;
};

export const EntryRow = ({
    entry,
    rightSectionSlot = null,
    nonInteractive,
    className,
    clasName,
    enableHover,
    name,
}: EntryRowProps) => {
    const defaultName = entry.name ? entry.name : getEntryNameByKey({key: entry.key, index: -1});
    const entryName = name || defaultName;

    const renderLock = () => {
        if (!entry.isLocked) {
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
                entry={entry}
                width={24}
                height={24}
                className={b('icon', {disabled: entry.disabled})}
            />
        );
    };

    return (
        <div
            key={entry.entryId}
            className={b(
                {
                    'non-interactive': nonInteractive,
                    locked: entry.isLocked,
                    hoverable: enableHover,
                },
                clasName || className,
            )}
        >
            <div className={b('entry')}>
                {nonInteractive ? (
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
