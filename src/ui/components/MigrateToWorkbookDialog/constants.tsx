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

import CheckFolder from 'platform/src/ui/assets/icons/check-folder.svg';
import CopyXmark from 'platform/src/ui/assets/icons/copy-xmark.svg';

const migrateByCopy = {
    title: 'Копирование',
    label: 'NEW',
    description: 'Копирование объекта со связями. Оригиналы объектов остаются в папках.',
    icon: <Icon data={CopyArrowRight} size={32} />,
    list: [
        {
            icon: <Icon data={Magnifier} />,
            text: 'Поиск связей только для текущего объекта',
        },
        {
            icon: <Icon data={CheckFolder} />,
            text: 'Объекты в папках остаются',
        },
        {
            icon: <Icon data={Link} />,
            text: 'Ссылки на объекты без изменений',
        },
        {
            icon: <Icon data={CopyCheck} />,
            text: 'Пока не доступно для CSV и GoogleSheets',
        },
    ],
};

const migrateByTransfer = {
    title: 'Перенос',
    description: 'Перенос всех рекурсивно связанных объектов в один общий воркбук.',
    icon: <Icon data={ArrowUturnCwRight} size={32} />,
    list: [
        {
            icon: <Icon data={FolderMagnifier} />,
            text: 'Рекурсивный поиск всех связей',
            helpText: `Рекурсивный поиск связей для текущего объекта и всех связанных объектов: “вниз“ до подключения и “вверх“ до дашборда`,
        },
        {
            icon: <Icon data={FolderExclamation} />,
            text: 'Объекты в папках не остаются',
        },
        {
            icon: <Icon data={Link} />,
            text: 'Ссылки на объекты ведут в воркбуки',
        },
        {
            icon: <Icon data={CopyXmark} />,
            text: 'Доступно для CSV и GoogleSheets',
        },
    ],
};

export {migrateByCopy, migrateByTransfer};
