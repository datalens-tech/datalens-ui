import React from 'react';

import {Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {WorkbookId} from 'shared';
import {EntryScope} from 'shared';

import navigateHelper from '../../../../libs/navigateHelper';
import {EntryIcon} from '../../../EntryIcon/EntryIcon';

import WarningColoredIcon from '../../../../assets/icons/warning-colored.svg';

import './EntryRow.scss';

const b = block('dl-copy-entry-workbook-dialog-entry-row');

const i18n = I18n.keyset('component.copy-entry-to-workbook-dialog');

export type EntryFields = {
    entryId: string;
    key: string;
    scope: string;
    type: string;
    workbookId: WorkbookId;
    name: string;
};

export type EntryRowProps = {
    className?: string;
    entry: EntryFields;
    isTargetEntry?: boolean;
};

export const EntryRow: React.FC<EntryRowProps> = ({className, entry, isTargetEntry}) => {
    const link = navigateHelper.redirectUrlSwitcher(entry);
    const isFileConnection =
        entry.scope === EntryScope.Connection &&
        (entry.type === 'file' || entry.type === 'gsheets_v2' || entry.type === 'yadocs');

    return (
        <div className={b(null, className)}>
            <div className={b('icon')}>
                <EntryIcon entry={entry} />
            </div>
            <Link
                className={b('name', {
                    strikethrough: isFileConnection,
                })}
                target="_blank"
                href={link}
            >
                {entry.name}
            </Link>
            {!isTargetEntry && isFileConnection && (
                <div className={b('warning')}>
                    <div className={b('warning-icon')}>
                        <Icon data={WarningColoredIcon} size={16} />
                    </div>
                    <div className={b('warning-text')}>{i18n('label_file-connection-warning')}</div>
                </div>
            )}
        </div>
    );
};
