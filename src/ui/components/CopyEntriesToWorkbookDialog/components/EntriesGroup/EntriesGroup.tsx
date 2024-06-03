import React from 'react';

import {ChevronRight} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import Utils from '../../../../utils';
import type {EntryFields} from '../EntryRow';
import {EntryRow} from '../EntryRow';

import './EntriesGroup.scss';

const DEFAULT_SHOW_ITEMS_COUNT = 5;

const b = block('dl-copy-entry-workbook-dialog-entries-group');

const i18n = I18n.keyset('component.copy-entry-to-workbook-dialog');

type Entries = Omit<EntryFields, 'name'>[];

export type EntriesGroupProps = {
    className?: string;
    title: string;
    entries: Entries;
};

export const EntriesGroup: React.FC<EntriesGroupProps> = ({className, title, entries}) => {
    const [isOpen, setIsOpen] = React.useState(true);
    const [showAll, setShowAll] = React.useState(false);

    const entriesLen = entries.length;

    const showedEntries =
        entriesLen <= DEFAULT_SHOW_ITEMS_COUNT || showAll
            ? entries
            : entries.slice(0, DEFAULT_SHOW_ITEMS_COUNT);

    const mappedEntries: EntryFields[] = showedEntries
        .map((entry) => {
            return {
                ...entry,
                name: Utils.getEntryNameFromKey(entry.key),
            };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className={b(null, className)}>
            <div
                className={b('header')}
                onClick={() => {
                    setIsOpen(!isOpen);
                }}
            >
                <div className={b('chevron')}>
                    <Icon className={b('chevron-icon', {open: isOpen})} data={ChevronRight} />
                </div>
                <div className={b('title')}>{title}</div>
                <div className={b('count')}>{i18n('label_objects', {count: entriesLen})}</div>
            </div>
            <div className={b('list', {open: isOpen})}>
                {mappedEntries.map((entry) => {
                    return <EntryRow key={entry.entryId} className={b('item')} entry={entry} />;
                })}
            </div>
            {entriesLen === showedEntries.length ? null : (
                <div className={b('show-more')}>
                    <Button
                        view="outlined"
                        width="max"
                        onClick={() => {
                            setShowAll(true);
                        }}
                    >
                        {i18n('action_show-all')}
                    </Button>
                </div>
            )}
        </div>
    );
};
