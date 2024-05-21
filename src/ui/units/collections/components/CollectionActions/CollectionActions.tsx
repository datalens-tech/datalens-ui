import React from 'react';

import {ArrowRight, ChevronDown, LockOpen, TrashBin} from '@gravity-ui/icons';
import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuItemMixed,
    Icon,
    Tooltip,
} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DropdownAction} from 'ui/components/DropdownAction/DropdownAction';

import {Feature} from '../../../../../shared';
import {DL} from '../../../../constants';
import {registry} from '../../../../registry';
import Utils from '../../../../utils';
import {selectCollection, selectRootCollectionPermissions} from '../../store/selectors';

import collectionIcon from '../../../../assets/icons/collections/collection.svg';
import workbookDemoIcon from '../../../../assets/icons/collections/workbook-demo.svg';
import workbookIcon from '../../../../assets/icons/collections/workbook.svg';

import './CollectionActions.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-actions');

export type Props = {
    className?: string;
    onCreateCollectionClick: () => void;
    onAddDemoWorkbookClick: () => void;
    onAddLearningMaterialsWorkbookClick: () => void;
    onCreateWorkbookClick: () => void;
    onEditAccessClick: () => void;
    onMoveClick: () => void;
    onDeleteClick: () => void;
};

export const CollectionActions = React.memo<Props>(
    // eslint-disable-next-line complexity
    ({
        className,
        onCreateCollectionClick,
        onAddDemoWorkbookClick,
        onAddLearningMaterialsWorkbookClick,
        onCreateWorkbookClick,
        onEditAccessClick,
        onMoveClick,
        onDeleteClick,
    }) => {
        const collection = useSelector(selectCollection);
        const rootCollectionPermissions = useSelector(selectRootCollectionPermissions);

        const {CustomActionPanelCollectionActions} = registry.collections.components.getAll();

        const showCreateCollection = collection
            ? collection.permissions?.createCollection
            : rootCollectionPermissions?.createCollectionInRoot;

        const showCreateWorkbook = collection
            ? collection.permissions?.createWorkbook
            : rootCollectionPermissions?.createWorkbookInRoot;

        const showAddDemoWorkbook = showCreateWorkbook && DL.TEMPLATE_WORKBOOK_ID;
        const showAddLearningMaterialsWorkbook =
            showCreateWorkbook && DL.LEARNING_MATERIALS_WORKBOOK_ID;

        const createActionItems: DropdownMenuItemMixed<unknown>[] = [];

        if (showCreateWorkbook) {
            createActionItems.push({
                text: (
                    <div className={b('dropdown-item')}>
                        <Icon data={workbookIcon} />
                        <div className={b('dropdown-text')}>{i18n('action_create-workbook')}</div>
                    </div>
                ),
                action: onCreateWorkbookClick,
            });
        }

        if (showCreateCollection) {
            createActionItems.push({
                text: (
                    <div className={b('dropdown-item')}>
                        <Icon data={collectionIcon} />
                        <div className={b('dropdown-text')}>{i18n('action_create-collection')}</div>
                    </div>
                ),
                action: onCreateCollectionClick,
            });
        }

        if (showAddDemoWorkbook || showAddLearningMaterialsWorkbook) {
            const subItems: DropdownMenuItem<unknown>[] = [];

            if (showAddDemoWorkbook) {
                subItems.push({
                    text: (
                        <div className={b('dropdown-item')}>
                            <Icon data={workbookDemoIcon} />
                            <div className={b('dropdown-text')}>
                                {i18n('action_add-demo-workbook')}
                            </div>
                        </div>
                    ),
                    action: onAddDemoWorkbookClick,
                });
            }

            if (showAddLearningMaterialsWorkbook) {
                subItems.push({
                    text: (
                        <div className={b('dropdown-item')}>
                            <Icon data={workbookDemoIcon} />
                            <div className={b('dropdown-text')}>
                                {i18n('action_add-learning-materials-workbook')}
                            </div>
                        </div>
                    ),
                    action: onAddLearningMaterialsWorkbookClick,
                });
            }

            if (subItems.length > 0) {
                createActionItems.push(subItems);
            }
        }

        const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

        const dropdownActions = [];

        if (collection && collection.permissions?.move) {
            dropdownActions.push({
                action: onMoveClick,
                text: (
                    <React.Fragment>
                        <Icon data={ArrowRight} className={b('icon-action')} />
                        {i18n('action_move')}
                    </React.Fragment>
                ),
            });
        }

        const otherActions: DropdownMenuItem[] = [];

        if (collection && collection.permissions?.delete) {
            otherActions.push({
                text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                action: onDeleteClick,
                theme: 'danger',
            });
        }

        dropdownActions.push([...otherActions]);

        return (
            <div className={b(null, className)}>
                {Boolean(dropdownActions.length) && (
                    <DropdownMenu
                        defaultSwitcherProps={{view: 'normal'}}
                        switcherWrapperClassName={b('dropdown-btn')}
                        items={dropdownActions}
                    />
                )}

                <CustomActionPanelCollectionActions />

                {collectionsAccessEnabled &&
                    collection &&
                    collection.permissions?.listAccessBindings && (
                        <Tooltip content={i18n('action_access')}>
                            <div className={b('access')}>
                                <Button onClick={onEditAccessClick}>
                                    <Icon data={LockOpen} />
                                </Button>
                            </div>
                        </Tooltip>
                    )}

                {(showCreateCollection || showCreateWorkbook) && (
                    <DropdownMenu
                        size="s"
                        items={createActionItems}
                        switcherWrapperClassName={b('create-wrapper')}
                        switcher={
                            <Button view="action" className={b('create')}>
                                {i18n('action_create')}
                                <Icon data={ChevronDown} />
                            </Button>
                        }
                    />
                )}
            </div>
        );
    },
);

CollectionActions.displayName = 'CollectionActions';
