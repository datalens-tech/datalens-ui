import React from 'react';

import {CodeTrunk, ShieldCheck, ShieldKeyhole} from '@gravity-ui/icons';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, Link, Text, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {CollectionItemEntities} from 'shared';
import {getEntryNameByKey} from 'shared/modules';
import navigateHelper from 'ui/libs/navigateHelper';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from 'ui/units/collections-navigation/constants';

import {CollectionIcon} from '../CollectionIcon/CollectionIcon';
import {EntryIcon} from '../EntryIcon/EntryIcon';
import {WorkbookIcon} from '../WorkbookIcon/WorkbookIcon';

import './EntityRow.scss';

const b = block('entity-row');

type Entry = {
    entity: typeof CollectionItemEntities.ENTRY;
    entryId: string;
    scope: string;
    type: string;
    displayKey: string;
    key: string;
};

type Workbook = {
    entity: typeof CollectionItemEntities.WORKBOOK;
    title: string;
};

export type RowEntityData = {
    collectionTitle?: string;
    collectionId?: string;
    workbookId?: string;
    isDelegated: boolean;
} & (Entry | Workbook);

export type EntryRowProps = {
    className?: string;
    actions?: DropdownMenuItem[];
    entity: RowEntityData;
    showRelationButton?: boolean;
};

const getName = (entity: RowEntityData) => {
    switch (entity.entity) {
        case CollectionItemEntities.WORKBOOK:
            return entity.title;
        case CollectionItemEntities.ENTRY:
            return getEntryNameByKey({key: entity.displayKey});
    }
};

const getHref = (entity: RowEntityData) => {
    switch (entity.entity) {
        case CollectionItemEntities.WORKBOOK:
            return `${WORKBOOKS_PATH}/${entity.workbookId}`;
        case CollectionItemEntities.ENTRY:
            return navigateHelper.redirectUrlSwitcher(entity);
    }
};

export const EntityRow = React.memo(
    ({entity, className, actions, showRelationButton = true}: EntryRowProps) => {
        const entryName = getName(entity);
        const renderRelationBtn =
            showRelationButton && entity.entity === CollectionItemEntities.WORKBOOK;

        const renderIcon = () => {
            switch (entity.entity) {
                case CollectionItemEntities.WORKBOOK:
                    return <WorkbookIcon className={b('icon')} title={entity.title} size="xs" />;
                case CollectionItemEntities.ENTRY:
                    return <EntryIcon entry={entity} className={b('icon')} />;
            }
        };

        return (
            <div className={b(null, className)}>
                <div className={b('entity')}>
                    <Link
                        view="primary"
                        target="_blank"
                        className={b('text-block')}
                        title={entryName}
                        href={getHref(entity)}
                    >
                        {renderIcon()}
                        <span className={b('name')}>{entryName}</span>
                    </Link>
                    {renderRelationBtn && (
                        <div className={b('workbook-relations')}>
                            <Tooltip
                                className={b('notice')}
                                content={getSharedEntryMockText('entity-row-relation-tooltip-text')}
                            >
                                <Button view="flat" size="s">
                                    <Icon data={CodeTrunk} width={16} height={16} />
                                </Button>
                            </Tooltip>
                        </div>
                    )}
                </div>
                <div className={b('right-block')}>
                    <div className={b('entity')}>
                        <Link
                            view="primary"
                            target="_blank"
                            className={b('text-block')}
                            title={entryName}
                            href={`${COLLECTIONS_PATH}/${entity.collectionId}`}
                        >
                            <CollectionIcon className={b('icon')} size={18} />
                            <span className={b('name')}>{entity.collectionTitle}</span>
                        </Link>
                    </div>
                    <div className={b('delegation-status')}>
                        <Icon
                            data={entity.isDelegated ? ShieldCheck : ShieldKeyhole}
                            size={16}
                            className={b('delegation-status-icon')}
                        />
                        <Text variant="body-1">
                            {entity.isDelegated
                                ? getSharedEntryMockText('entity-row-delegated')
                                : getSharedEntryMockText('entity-row-not-delegated')}
                        </Text>
                    </div>
                    {actions && <DropdownMenu items={actions} />}
                </div>
            </div>
        );
    },
);
