import React from 'react';

import {Icon, Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import navigateHelper from '../../../../libs/navigateHelper';
import {EntryIcon} from '../../../EntryIcon/EntryIcon';

import WarningColoredIcon from '../../../../assets/icons/warning-colored.svg';

import './EntryRow.scss';

const b = block('dl-migrate-to-workbook-dialog-entry-row');

const i18n = I18n.keyset('component.migrate-to-workbook-dialog');

export type EntryFields = {
    entryId: string;
    key: string;
    scope: string;
    type: string;
    workbookId: string | null;
    name: string;
};

export type EntryRowProps = {
    className?: string;
    entry: EntryFields;
};

export const EntryRow: React.FC<EntryRowProps> = ({className, entry}) => {
    const link = navigateHelper.redirectUrlSwitcher(entry);

    return (
        <div className={b(null, className)}>
            <div className={b('icon')}>
                <EntryIcon entry={entry} />
            </div>
            <Link className={b('name')} target="_blank" href={link}>
                {entry.name}
            </Link>
            {entry.workbookId ? (
                <div className={b('warning')}>
                    <div className={b('warning-icon')}>
                        <Icon data={WarningColoredIcon} size={16} />
                    </div>
                    <div className={b('warning-text')}>
                        {i18n('label_entry-already-in-workbook')}
                    </div>
                </div>
            ) : null}
        </div>
    );
};
