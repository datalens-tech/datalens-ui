import React from 'react';

import {CircleExclamation} from '@gravity-ui/icons';
import type {LabelProps} from '@gravity-ui/uikit';
import {Disclosure, Flex, Icon, Label, Link, Text, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {EntryScope} from 'shared';
import type {NotificationLevel} from 'shared/types/meta-manager';
import {EntryRow} from 'ui/components/EntryRow/EntryRow';

import './EntriesNotificationCut.scss';

const b = block('entries-notification-cut');

type EntriesNotificationCutProps = {
    title: string;
    link?: {text: string; url: string};
} & (
    | {level: 'success'; entries?: never}
    | {
          level: NotificationLevel;
          entries: {entryId?: string; scope: EntryScope}[];
      }
);

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
            <Text className={b('title')} variant="subheader-2">
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
    entries,
    link,
}: EntriesNotificationCutProps) => {
    const defaultExpanded = level === 'critical';
    const theme = LEVEL_TO_THEME_MAP[level] || 'info';

    return (
        <Flex gap={3} className={b('cut')}>
            <Label theme={theme} size="s" icon={<Icon data={CircleExclamation} size={14} />} />
            {entries?.length ? (
                <Disclosure
                    defaultExpanded={defaultExpanded}
                    arrowPosition="end"
                    summary={<NotificationSummary title={title} count={entries.length} />}
                    className={b('disclosure')}
                >
                    <div className={spacing({mt: 3})}>
                        {entries.map((entry) => (
                            <EntryRow
                                key={entry.entryId}
                                entry={{
                                    entryId: entry.entryId,
                                    scope: entry.scope,
                                    name: entry.entryId,
                                }}
                                // for correct display of the connection icon without a specific type
                                overrideIconType={
                                    entry.scope === 'connection' ? entry.scope : undefined
                                }
                            />
                        ))}
                    </div>
                    {link && (
                        <Link href={link.url} className={spacing({mt: 3})}>
                            {link.text}
                        </Link>
                    )}
                </Disclosure>
            ) : (
                <Flex alignItems="center" className={b('summary')}>
                    <Text variant="subheader-2">{title}</Text>
                </Flex>
            )}
        </Flex>
    );
};
