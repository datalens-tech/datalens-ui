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
import {I18n} from 'i18n';

import CheckFolder from 'platform/src/ui/assets/icons/check-folder.svg';
import CopyXmark from 'platform/src/ui/assets/icons/copy-xmark.svg';

const i18n = I18n.keyset('component.select-migration-to-workbook-dialog');

const migrateByCopy = {
    title: i18n('title_copy'),
    label: i18n('label'),
    description: i18n('description_copy'),
    icon: <Icon data={CopyArrowRight} size={32} />,
    list: [
        {
            icon: <Icon data={Magnifier} />,
            text: i18n('list_first_item_copy'),
        },
        {
            icon: <Icon data={CheckFolder} />,
            text: i18n('list_second_item_copy'),
        },
        {
            icon: <Icon data={Link} />,
            text: i18n('list_third_item_copy'),
        },
        {
            icon: <Icon data={CopyCheck} />,
            text: i18n('list_fourth_item_copy'),
        },
    ],
};

const migrateByTransfer = {
    title: i18n('title_transfer'),
    description: i18n('description_transfer'),
    icon: <Icon data={ArrowUturnCwRight} size={32} />,
    list: [
        {
            icon: <Icon data={FolderMagnifier} />,
            text: i18n('list_first_item_transfer'),
            helpText: i18n('list_first_item_transfer_help_text'),
        },
        {
            icon: <Icon data={FolderExclamation} />,
            text: i18n('list_second_item_transfer'),
        },
        {
            icon: <Icon data={Link} />,
            text: i18n('list_third_item_transfer'),
        },
        {
            icon: <Icon data={CopyXmark} />,
            text: i18n('list_fourth_item_transfer'),
        },
    ],
};

export {migrateByCopy, migrateByTransfer};
