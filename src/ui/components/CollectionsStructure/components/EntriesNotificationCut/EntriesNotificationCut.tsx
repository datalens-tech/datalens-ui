import React from 'react';

import {CircleExclamation} from '@gravity-ui/icons';
import type {LabelProps} from '@gravity-ui/uikit';
import {Disclosure, Flex, Icon, Label, Link, Text, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {EntryScope} from 'shared';
import type {GetEntriesEntryResponse} from 'shared/schema/us/types';
import type {NotificationLevel} from 'shared/types/meta-manager';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import {getNotificationTitle} from './helpers';

import './EntriesNotificationCut.scss';

const b = block('entries-notification-cut');

type EntriesNotificationCutProps = {
    link?: {text: string; url: string};
    entriesMap?: Record<string, GetEntriesEntryResponse> | null;
} & (
    | {level: 'success'; entries?: never}
    | {
          level: NotificationLevel;
          entries: {entryId?: string; scope: EntryScope}[];
      }
) &
    ({title: string; code?: string} | {title?: never; code: string});

const getEntry = (
    entriesMap: EntriesNotificationCutProps['entriesMap'],
    entry: {
        entryId?: string;
        scope: EntryScope;
    },
) => {
    if (!entry.entryId || !entriesMap) {
        return {
            entryId: entry.entryId,
            scope: entry.scope,
            name: entry.entryId,
        };
    }

    return entriesMap[entry.entryId];
};

const LEVEL_TO_THEME_MAP: Record<string, LabelProps['theme']> = {
    critical: 'danger',
    warning: 'warning',
    info: 'info',
    success: 'success',
};

const NotificationSummary = ({
    title,
    count,
}: Pick<EntriesNotificationCutProps, 'title'> & {count: number}) => {
    return (
        <Flex
            justifyContent="space-between"
            alignItems="center"
            gap={7}
            grow={1}
            className={b('summary')}
        >
            <Text className={b('title')} variant="subheader-1">
                {title}
            </Text>

            <Text variant="subheader-1" color="secondary" className={spacing({mr: 3})}>
                {count}
            </Text>
        </Flex>
    );
};

export const EntriesNotificationCut = ({
    level,
    title,
    code,
    entries,
    link,
    entriesMap,
}: EntriesNotificationCutProps) => {
    const defaultExpanded = level === 'critical';
    const theme = LEVEL_TO_THEME_MAP[level] || 'info';

    const notificationTitle = getNotificationTitle(code, title);

    return (
        <Flex gap={3} className={b('cut')}>
            <Label theme={theme} size="s" icon={<Icon data={CircleExclamation} size={14} />} />
            {entries?.length ? (
                <Disclosure
                    defaultExpanded={defaultExpanded}
                    arrowPosition="end"
                    summary={
                        <NotificationSummary title={notificationTitle} count={entries.length} />
                    }
                    className={b('disclosure')}
                >
                    <div className={spacing({mt: 3})}>
                        {entries.map((entry) => {
                            const resolvedEntry = getEntry(entriesMap, entry);

                            const overrideIconType =
                                !('type' in resolvedEntry) && entry.scope === 'connection'
                                    ? entry.scope
                                    : undefined;

                            return (
                                <EntryRow
                                    key={entry.entryId}
                                    entry={resolvedEntry}
                                    // for correct display of the connection icon without a specific type
                                    overrideIconType={overrideIconType}
                                />
                            );
                        })}
                    </div>
                    {link && (
                        <Link href={link.url} className={spacing({mt: 3})}>
                            {link.text}
                        </Link>
                    )}
                </Disclosure>
            ) : (
                <Flex alignItems="center" className={b('summary')}>
                    <Text variant="subheader-2">{notificationTitle}</Text>
                </Flex>
            )}
        </Flex>
    );
};
