import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DropdownMenuItem} from '@gravity-ui/uikit';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {batch, useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import type {
    CollectionWithPermissions,
    WorkbookWithPermissions,
} from '../../../../../shared/schema';
import {AnimateBlock} from '../../../../components/AnimateBlock';
import {CollectionIcon} from '../../../../components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {COLLECTIONS_PATH, WORKBOOKS_PATH} from '../../../collections-navigation/constants';
import {setCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbs} from '../../../collections-navigation/store/selectors';
import {setWorkbook} from '../../../workbooks/store/actions';
import {setCollection} from '../../store/actions';
import {selectStructureItems} from '../../store/selectors';
import type {SelectedMap, UpdateCheckboxArgs} from '../CollectionPage/hooks';

import './CollectionContentGrid.scss';

const b = block('dl-collection-content-grid');

type Props = {
    selectedMap: SelectedMap;
    isOpenSelectionMode: boolean;
    getWorkbookActions: (
        item: WorkbookWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    getCollectionActions: (
        item: CollectionWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    onUpdateCheckboxClick: (args: UpdateCheckboxArgs) => void;
};

export const CollectionContentGrid = React.memo<Props>(
    ({
        selectedMap,
        isOpenSelectionMode,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckboxClick,
    }) => {
        const dispatch = useDispatch();

        const items = useSelector(selectStructureItems);
        const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

        return (
            <div className={b()}>
                <div className={b('grid')}>
                    {items.map((item, index) => {
                        const canMove = item.permissions.move;

                        const actions =
                            'workbookId' in item
                                ? getWorkbookActions(item)
                                : getCollectionActions(item);

                        return (
                            <AnimateBlock
                                key={'workbookId' in item ? item.workbookId : item.collectionId}
                                delay={Math.min(index * 5, 100)}
                            >
                                <div
                                    className={b('item')}
                                    onClick={
                                        isOpenSelectionMode && canMove
                                            ? () => {
                                                  if ('workbookId' in item) {
                                                      onUpdateCheckboxClick({
                                                          entityId: item.workbookId,
                                                          type: 'workbook',
                                                          checked: !selectedMap[item.workbookId],
                                                      });
                                                  } else {
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
                                            disabled={!canMove}
                                            checked={
                                                Boolean(
                                                    selectedMap[
                                                        'workbookId' in item
                                                            ? item.workbookId
                                                            : item.collectionId
                                                    ],
                                                ) && canMove
                                            }
                                        />
                                    )}
                                    <Link
                                        to={
                                            'workbookId' in item
                                                ? `${WORKBOOKS_PATH}/${item.workbookId}`
                                                : `${COLLECTIONS_PATH}/${item.collectionId}`
                                        }
                                        className={b('link', {
                                            'selection-mode': isOpenSelectionMode,
                                        })}
                                        onClick={(e) => {
                                            if (!e.metaKey && !e.ctrlKey) {
                                                if ('workbookId' in item) {
                                                    dispatch(setWorkbook(item));
                                                } else {
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
                                            {'workbookId' in item ? (
                                                <WorkbookIcon title={item.title} size="l" />
                                            ) : (
                                                <CollectionIcon isIconBig size={125} />
                                            )}
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
