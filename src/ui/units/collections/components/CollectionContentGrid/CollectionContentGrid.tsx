import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {CollectionItemEntities} from 'shared';

import type {StructureItemWithPermissions} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import {setCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbs} from '../../../collections-navigation/store/selectors';
import {setWorkbook} from '../../../workbooks/store/actions';
import {setCollection} from '../../store/actions';
import {selectStructureItems} from '../../store/selectors';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';
import {getIsWorkbookItem, getItemKey, getItemLink} from '../helpers';

import {CollectionItemIcon} from './CollectionItemIcon';

import './CollectionContentGrid.scss';

const b = block('dl-collection-content-grid');

type Props = {
    selectedMap: SelectedMap;
    isOpenSelectionMode: boolean;
    getItemActions: (
        item: StructureItemWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
};

export const CollectionContentGrid = React.memo<Props>(
    ({selectedMap, isOpenSelectionMode, getItemActions, onUpdateCheckboxClick}) => {
        const dispatch = useDispatch();

        const items = useSelector(selectStructureItems);
        const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

        return (
            <div className={b()}>
                <div className={b('grid')}>
                    {items.map((item, index) => {
                        const isWorkbook = getIsWorkbookItem(item);
                        const isEntry = item.entity === CollectionItemEntities.ENTRY;
                        const canMove = item.permissions.move;

                        const actions = getItemActions(item);

                        return (
                            <AnimateBlock key={getItemKey(item)} delay={Math.min(index * 5, 100)}>
                                <div
                                    className={b('item')}
                                    onClick={
                                        isOpenSelectionMode && canMove
                                            ? () => {
                                                  if (isWorkbook) {
                                                      onUpdateCheckboxClick({
                                                          entityId: item.workbookId,
                                                          type: 'workbook',
                                                          checked: !selectedMap[item.workbookId],
                                                      });
                                                  } else if (!isEntry) {
                                                      onUpdateCheckboxClick({
                                                          entityId: item.collectionId,
                                                          type: 'collection',
                                                          checked: !selectedMap[item.collectionId],
                                                      });
                                                  }
                                              }
                                            : undefined
                                    }
                                >
                                    {isOpenSelectionMode && (
                                        <Checkbox
                                            size="l"
                                            className={b('checkbox')}
                                            disabled={!canMove || isEntry}
                                            checked={
                                                Boolean(
                                                    selectedMap[
                                                        isWorkbook
                                                            ? item.workbookId
                                                            : item.collectionId
                                                    ],
                                                ) && canMove
                                            }
                                        />
                                    )}
                                    <Link
                                        to={getItemLink(item)}
                                        className={b('link', {
                                            'selection-mode': isOpenSelectionMode,
                                        })}
                                        onClick={(e) => {
                                            if (!e.metaKey && !e.ctrlKey) {
                                                if (isWorkbook) {
                                                    dispatch(setWorkbook(item));
                                                } else if (!isEntry) {
                                                    batch(() => {
                                                        dispatch(setCollection(item));
                                                        if (
                                                            !breadcrumbs.find(
                                                                (breadcrumb) =>
                                                                    breadcrumb.collectionId ===
                                                                    item.collectionId,
                                                            )
                                                        ) {
                                                            dispatch(
                                                                setCollectionBreadcrumbs([
                                                                    ...breadcrumbs,
                                                                    item,
                                                                ]),
                                                            );
                                                        }
                                                    });
                                                }
                                            }
                                        }}
                                    >
                                        <div
                                            className={b('icon', {
                                                'selection-mode': isOpenSelectionMode,
                                            })}
                                        >
                                            <CollectionItemIcon item={item} />
                                        </div>
                                        <div className={b('title')} title={item.title}>
                                            {item.title}
                                        </div>
                                        <div className={b('info')}>
                                            <div className={b('date')}>
                                                {dateTime({
                                                    input: item.updatedAt,
                                                }).fromNow()}
                                            </div>

                                            {actions.length > 0 && (
                                                <div
                                                    className={b('actions')}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        e.preventDefault();
                                                    }}
                                                >
                                                    <DropdownMenu size="s" items={actions} />
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                </div>
                            </AnimateBlock>
                        );
                    })}
                </div>
            </div>
        );
    },
);

CollectionContentGrid.displayName = 'CollectionContentGrid';
