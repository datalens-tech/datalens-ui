import React from 'react';

import {ArrowRight, ChevronDown, LockOpen, TrashBin} from '@gravity-ui/icons';
import type {
    DropdownMenuItem,
    DropdownMenuItemAction,
    DropdownMenuItemMixed,
    IconData,
} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useSelector} from 'react-redux';
import {DropdownAction} from 'ui/components/DropdownAction/DropdownAction';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {Feature} from '../../../../../shared';
import {registry} from '../../../../registry';
import {selectCollection} from '../../store/selectors';

import collectionIcon from '../../../../assets/icons/collections/collection.svg';
import workbookIcon from '../../../../assets/icons/collections/workbook.svg';

import './CollectionActions.scss';

const i18n = I18n.keyset('collections');

const b = block('dl-collection-actions');

export type Props = {
    className?: string;
    onCreateCollectionClick: DropdownMenuItemAction<void>;
    onCreateWorkbookClick: DropdownMenuItemAction<void>;
    onEditAccessClick: () => void;
    onMoveClick: () => void;
    onDeleteClick: () => void;
};

export const CollectionActions = React.memo<Props>(
    // eslint-disable-next-line complexity
    ({
        className,
        onCreateCollectionClick,
        onCreateWorkbookClick,
        onEditAccessClick,
        onMoveClick,
        onDeleteClick,
    }) => {
        const collection = useSelector(selectCollection);

        const {CustomActionPanelCollectionActions} = registry.collections.components.getAll();

        const showCreateCollection = collection ? collection.permissions?.createCollection : true;

        const showCreateWorkbook = collection ? collection.permissions?.createWorkbook : true;

        const createActionItems: DropdownMenuItemMixed<void>[] = [];

        const getItemText = ({icon, text, hint}: {icon: IconData; text: string; hint?: string}) => (
            <div className={b('dropdown-item')}>
                <Icon className={b('dropdown-icon')} data={icon} />
                <div className={b('dropdown-text')}>
                    {text}
                    {hint && <div className={b('dropdown-hint')}>{hint}</div>}
                </div>
            </div>
        );

        if (showCreateWorkbook) {
            createActionItems.push({
                text: getItemText({
                    icon: workbookIcon,
                    text: i18n('action_create-workbook'),
                    hint: i18n('action_create-workbook-hint'),
                }),
                action: onCreateWorkbookClick,
            });
        }

        if (showCreateCollection) {
            createActionItems.push({
                text: getItemText({
                    icon: collectionIcon,
                    text: i18n('action_create-collection'),
                    hint: i18n('action_create-collection-hint'),
                }),
                action: onCreateCollectionClick,
            });
        }

        const collectionsAccessEnabled = isEnabledFeature(Feature.CollectionsAccessEnabled);

        const dropdownActions = [];

        if (collection && collection.permissions?.move) {
            dropdownActions.push({
                action: onMoveClick,
                text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
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

        if (otherActions.length > 0) {
            dropdownActions.push([...otherActions]);
        }

        return (
            <div className={b(null, className)}>
                {collection && Boolean(dropdownActions.length) && (
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
                        popupProps={{placement: 'bottom-end'}}
                        renderSwitcher={({onClick, onKeyDown}) => (
                            <Button
                                view="action"
                                className={b('create')}
                                onClick={onClick}
                                onKeyDown={onKeyDown}
                            >
                                {i18n('action_create')}
                                <Icon data={ChevronDown} />
                            </Button>
                        )}
                    />
                )}
            </div>
        );
    },
);

CollectionActions.displayName = 'CollectionActions';
