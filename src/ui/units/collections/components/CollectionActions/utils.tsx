import React from 'react';

import {CodeTrunk} from '@gravity-ui/icons';
import {I18n} from 'i18n';
import {CollectionActionsQa} from 'shared';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';

import {SharedEntryNotice} from './components/SharedEntryNotice/SharedEntryNotice';

type GetSharedEntriesMenuItemsProps = {
    datasetAction: () => void;
    connectionAction: () => void;
    noticeClassName?: string;
};

const i18n = I18n.keyset('collections');
const i18nSharedEntry = I18n.keyset('shared-entry');

export const getSharedEntriesMenuItems = ({
    datasetAction,
    connectionAction,
    noticeClassName,
}: GetSharedEntriesMenuItemsProps) => {
    return [
        {
            text: i18n('shared-actions-menu-title'),
            iconStart: <CodeTrunk />,
            qa: CollectionActionsQa.SharedObjectsMenuItem,
            items: [
                {
                    text: <SharedEntryNotice />,
                    className: noticeClassName,
                    action: () => {},
                    selected: false,
                },
                {
                    iconStart: (
                        <EntryIcon entry={{scope: 'connection'}} overrideIconType="connection" />
                    ),
                    text: i18nSharedEntry('label-shared-connection'),
                    action: connectionAction,
                    qa: CollectionActionsQa.SharedConnectionCreateBtn,
                },
                {
                    iconStart: <EntryIcon entry={{scope: 'dataset'}} />,
                    text: i18nSharedEntry('label-shared-dataset'),
                    action: datasetAction,
                    qa: CollectionActionsQa.SharedDatasetCreateBtn,
                },
            ],
        },
    ];
};
