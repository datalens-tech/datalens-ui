import React from 'react';

import {CodeTrunk} from '@gravity-ui/icons';
import {CollectionActionsQa} from 'shared';
import {EntryIcon} from 'ui/components/EntryIcon/EntryIcon';

import {getSharedEntryMockText} from '../helpers';

import {SharedEntryNotice} from './components/SharedEntryNotice/SharedEntryNotice';

type GetSharedEntriesMenuItemsProps = {
    datasetAction: () => void;
    connectionAction: () => void;
    noticeClassName?: string;
};

export const getSharedEntriesMenuItems = ({
    datasetAction,
    connectionAction,
    noticeClassName,
}: GetSharedEntriesMenuItemsProps) => {
    return [
        {
            text: getSharedEntryMockText('collection-actions-menu-item'),
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
                    text: getSharedEntryMockText('label-shared-connection'),
                    action: connectionAction,
                    qa: CollectionActionsQa.SharedConnectionCreateBtn,
                },
                {
                    iconStart: <EntryIcon entry={{scope: 'dataset'}} />,
                    text: getSharedEntryMockText('label-shared-dataset'),
                    action: datasetAction,
                    qa: CollectionActionsQa.SharedDatasetCreateBtn,
                },
            ],
        },
    ];
};
