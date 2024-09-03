import React from 'react';

import {
    ArrowUturnCwRight,
    CopyArrowRight,
    CopyCheck,
    FolderExclamation,
    FolderMagnifier,
    Link,
    Magnifier,
} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';

import CheckFolder from 'ui/assets/icons/check-folder.svg';
import CopyXmark from 'ui/assets/icons/copy-xmark.svg';

const migrateByCopy = {
    title: 'title_copy',
    label: 'label',
    description: 'description_copy',
    icon: <Icon data={CopyArrowRight} size={32} />,
    list: [
        {
            icon: <Icon data={Magnifier} />,
            text: 'list_first_item_copy',
        },
        {
            icon: <Icon data={CheckFolder} />,
            text: 'list_second_item_copy',
        },
        {
            icon: <Icon data={Link} />,
            text: 'list_third_item_copy',
        },
        {
            icon: <Icon data={CopyXmark} />,
            text: 'list_fourth_item_copy',
        },
    ],
};

const migrateByTransfer = {
    title: 'title_transfer',
    description: 'description_transfer',
    icon: <Icon data={ArrowUturnCwRight} size={32} />,
    list: [
        {
            icon: <Icon data={FolderMagnifier} />,
            text: 'list_first_item_transfer',
            helpText: 'list_first_item_transfer_help_text',
        },
        {
            icon: <Icon data={FolderExclamation} />,
            text: 'list_second_item_transfer',
        },
        {
            icon: <Icon data={Link} />,
            text: 'list_third_item_transfer',
        },
        {
            icon: <Icon data={CopyCheck} />,
            text: 'list_fourth_item_transfer',
        },
    ],
};

export {migrateByCopy, migrateByTransfer};
