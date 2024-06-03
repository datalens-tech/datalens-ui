import React from 'react';

import {ChevronDown} from '@gravity-ui/icons';
import type {ButtonSize, ButtonView, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import {Button, DropdownMenu, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {CreateEntityButton, EntryScope, Feature} from 'shared';
import {EntityIcon} from 'ui/components/EntityIcon/EntityIcon';
import Utils from 'ui/utils';

import {CreateEntryActionType} from '../../constants';
import {setCreateWorkbookEntryType} from '../../store/actions';

import './CreateEntry.scss';

const i18n = I18n.keyset('new-workbooks');
const b = block('dl-workbook-create-entry');

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

    let buttonText;
    let handleClick: undefined | (() => void);
    let items: DropdownMenuItemMixed<unknown>[] = [];
    let hasMenu;

    switch (scope) {
        case EntryScope.Dash:
            buttonText = i18n('action_create-dashboard');
            hasMenu = false;
            handleClick = () => handleAction(CreateEntryActionType.Dashboard);
            break;
        case EntryScope.Dataset:
            buttonText = i18n('action_create-dataset');
            hasMenu = false;
            handleClick = () => handleAction(CreateEntryActionType.Dataset);
            break;
        case EntryScope.Connection:
            buttonText = i18n('action_create-connection');
            hasMenu = false;
            handleClick = () => handleAction(CreateEntryActionType.Connection);
            break;
        case EntryScope.Widget:
            buttonText = i18n('action_create-chart');
            hasMenu = true;
            items = [
                {
                    action: () => handleAction(CreateEntryActionType.Wizard),
                    text: (
                        <div className={b('dropdown-item')}>
                            <EntityIcon type="chart-wizard" />
                            <div className={b('dropdown-text')}>{i18n('menu_wizard-chart')}</div>
                        </div>
                    ),
                },
                {
                    action: () => handleAction(CreateEntryActionType.QL),
                    text: (
                        <div className={b('dropdown-item')}>
                            <EntityIcon type="chart-ql" />
                            <div className={b('dropdown-text')}>{i18n('menu_ql-chart')}</div>
                        </div>
                    ),
                },
                {
                    action: () => handleAction(CreateEntryActionType.Editor),
                    text: (
                        <div className={b('dropdown-item')}>
                            <EntityIcon type="editor" />
                            <div className={b('dropdown-text')}>{i18n('menu_editor-chart')}</div>
                        </div>
                    ),
                    hidden: !Utils.isEnabledFeature(Feature.EntryMenuEditor),
                },
            ];
            break;
        default:
            buttonText = i18n('action_create');
            hasMenu = true;
            items = [
                [
                    {
                        action: () => handleAction(CreateEntryActionType.Dashboard),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="dashboard" />
                                <div className={b('dropdown-text')}>{i18n('menu_dashboard')}</div>
                            </div>
                        ),
                    },
                ],
                [
                    {
                        action: () => handleAction(CreateEntryActionType.Wizard),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="chart-wizard" />
                                <div className={b('dropdown-text')}>
                                    {i18n('menu_wizard-chart')}
                                </div>
                            </div>
                        ),
                    },
                    {
                        action: () => handleAction(CreateEntryActionType.QL),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="chart-ql" />
                                <div className={b('dropdown-text')}>{i18n('menu_ql-chart')}</div>
                            </div>
                        ),
                    },
                    {
                        action: () => handleAction(CreateEntryActionType.Editor),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="editor" />
                                <div className={b('dropdown-text')}>
                                    {i18n('menu_editor-chart')}
                                </div>
                            </div>
                        ),
                        hidden: !Utils.isEnabledFeature(Feature.EntryMenuEditor),
                    },
                ],
                [
                    {
                        action: () => handleAction(CreateEntryActionType.Dataset),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="dataset" />
                                <div className={b('dropdown-text')}>{i18n('menu_dataset')}</div>
                            </div>
                        ),
                    },
                    {
                        action: () => handleAction(CreateEntryActionType.Connection),
                        text: (
                            <div className={b('dropdown-item')}>
                                <EntityIcon type="connection" />
                                <div className={b('dropdown-text')}>{i18n('menu_connection')}</div>
                            </div>
                        ),
                    },
                ],
            ];
    }

    return (
        <div className={className}>
            {hasMenu ? (
                <DropdownMenu
                    size="s"
                    items={items}
                    popupProps={{qa: CreateEntityButton.Popup}}
                    switcher={
                        <Button view={view} size={size} qa={CreateEntityButton.Button}>
                            {buttonText}
                            <Icon data={ChevronDown} size="16" />
                        </Button>
                    }
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
