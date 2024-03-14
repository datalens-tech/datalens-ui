import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Checkbox, DropdownMenu} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';

import {CollectionIcon} from '../../../../components/CollectionIcon/CollectionIcon';
import {WorkbookIcon} from '../../../../components/WorkbookIcon/WorkbookIcon';
import {AnimateBlock} from '../../../collections-navigation/components/AnimateBlock';
import {setCollectionBreadcrumbs} from '../../../collections-navigation/store/actions';
import {selectCollectionBreadcrumbs} from '../../../collections-navigation/store/selectors';
import {setWorkbook} from '../../../workbooks/store/actions';
import {setCollection} from '../../store/actions';
import {CollectionContentGridProps} from '../types';
import {onClickStopPropagation} from '../utils';

import './CollectionContentGrid.scss';

const b = block('dl-collection-content-grid');

export const CollectionContentGrid = React.memo<CollectionContentGridProps>(
    ({
        contentItems,
        getWorkbookActions,
        getCollectionActions,
        onUpdateCheckbox,
        selectedMap,
        isOpenSelectionMode,
    }) => {
        const dispatch = useDispatch();

        const breadcrumbs = useSelector(selectCollectionBreadcrumbs) ?? [];

        return (
            <div className={b()}>
                <div className={b('grid')}>
                    {contentItems.map((item, index) => {
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
                                                      onUpdateCheckbox(
                                                          !selectedMap[item.workbookId]?.checked,
                                                          'workbook',
                                                          item.workbookId,
                                                      );
                                                  } else {
                                                      onUpdateCheckbox(
                                                          !selectedMap[item.collectionId]?.checked,
                                                          'collection',
                                                          item.collectionId,
                                                      );
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
                                            checked={Boolean(
                                                selectedMap[
                                                    'workbookId' in item
                                                        ? item.workbookId
                                                        : item.collectionId
                                                ]?.checked && canMove,
                                            )}
                                        />
                                    )}
                                    <Link
                                        to={
                                            'workbookId' in item
                                                ? `/workbooks/${item.workbookId}`
                                                : `/collections/${item.collectionId}`
                                        }
                                        className={b('link', {
                                            'selection-mode': isOpenSelectionMode,
                                        })}
                                        onClick={(e) => {
                                            if (!e.metaKey) {
                                                if ('workbookId' in item) {
                                                    dispatch(setWorkbook(item));
                                                } else {
                                                    dispatch(setCollection(item));
                                                    dispatch(
                                                        setCollectionBreadcrumbs([
                                                            ...breadcrumbs,
                                                            item,
                                                        ]),
                                                    );
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
                                                    onClick={onClickStopPropagation}
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
