import React from 'react';

import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope, Feature} from 'shared';
import {EntityIcon} from 'ui/components/EntityIcon/EntityIcon';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {CreateEntryActionType} from '../../constants';

const i18n = I18n.keyset('new-workbooks');
const b = block('dl-workbook-create-entry');

export const useCreateEntryOptions = ({
    scope,
    handleAction,
}: {
    scope?: EntryScope;
    handleAction: (action: CreateEntryActionType) => void;
}) => {
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
                // TODO: remove CHARTS-11016 (item)
                {
                    action: () => handleAction(CreateEntryActionType.Editor),
                    text: (
                        <div className={b('dropdown-item')}>
                            <EntityIcon type="editor" />
                            <div className={b('dropdown-text')}>{i18n('menu_editor-chart')}</div>
                        </div>
                    ),
                    hidden: !isEnabledFeature(Feature.EntryMenuEditor),
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
                    // TODO: remove CHARTS-11016 (item)
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
                        hidden: !isEnabledFeature(Feature.EntryMenuEditor),
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

    return {buttonText, handleClick, items, hasMenu};
};
