import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import type {ButtonSize, ButtonView} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import {useDispatch} from 'react-redux';
import type {EntryScope} from 'shared';
import {CreateEntityButton} from 'shared';
import {registry} from 'ui/registry';

import type {CreateEntryActionType} from '../../constants';
import {setCreateWorkbookEntryType} from '../../store/actions';

import './CreateEntry.scss';

type Props = {
    scope?: EntryScope;
    className?: string;
    size?: ButtonSize;
    view?: ButtonView;
};

export const CreateEntry = React.memo<Props>(({className, scope, size = 'm', view = 'normal'}) => {
    const dispatch = useDispatch();

    const handleAction = (type: CreateEntryActionType) => {
        dispatch(setCreateWorkbookEntryType(type));
    };

    const {useCreateEntryOptions} = registry.workbooks.functions.getAll();

    const {buttonText, handleClick, items, hasMenu} = useCreateEntryOptions({scope, handleAction});

    return (
        <div className={className}>
            {hasMenu ? (
                <DropdownMenu
                    size="s"
                    items={items}
                    popupProps={{qa: CreateEntityButton.Popup}}
                    renderSwitcher={() => (
                        <Button view={view} size={size} qa={CreateEntityButton.Button}>
                            {buttonText}
                            <Icon data={ChevronDown} size="16" />
                        </Button>
                    )}
                />
            ) : (
                <Button view={view} onClick={handleClick} size={size}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
});

CreateEntry.displayName = 'CreateEntry';
