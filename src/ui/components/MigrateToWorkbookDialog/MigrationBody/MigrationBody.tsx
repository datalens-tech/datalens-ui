import React from 'react';

import {CopyArrowRight} from '@gravity-ui/icons';
import {Icon, Label} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './MigrationBody.scss';

const b = block('dl-migrate-to-workbook-dialog-body-item-content');

const MigrationBody = () => {
    return (
        <div className={b()}>
            <div className={b('header')}>
                <div className={b('title')}>Копирование</div>
                <div className={b('label')}>
                    <Label theme="warning">New</Label>
                </div>
                <div className={b('icon')}>
                    <Icon size={28} data={CopyArrowRight} />
                </div>
            </div>
            <div className={b('description')}>
                Копирование объекта со связями. Оригиналы объектов остаются в папках.
            </div>
            <div className={b('content')}>content</div>
        </div>
    );
};

export {MigrationBody};
