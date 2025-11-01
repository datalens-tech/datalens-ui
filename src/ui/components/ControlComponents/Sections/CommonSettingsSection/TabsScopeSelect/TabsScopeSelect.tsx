import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Flex, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import {setSelectorDialogItem, updateSelectorsGroup} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import {selectTabId, selectTabs} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import type {TabsScope} from 'ui/units/dash/typings/selectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {TABS_SCOPE_SELECT_VALUE} from './constants';
import {
    getIconByTabsScope,
    getInitialSelectedTabs,
    getTabsScopeByValue,
    getTabsScopeValueByName,
} from './helpers';

import './TabsScopeSelect.scss';

const b = block('tabs-scope-select');

// const i18n = I18n.keyset('dash.control-dialog.edit');

// TODO: Add translations
const i18n = (key: string) => {
    const values: Record<string, string> = {
        'label_tabs-scope': 'Показать во вкладках',
        'label_selected-tabs-placeholder': 'Выберите вкладки',
        'value_all-tabs': 'На всех вкладках',
        'value_selected-tabs': 'Выбранные вкладки',
        'value_current-tab': 'Текущая вкладка',
        'value_as-group': 'Как у группы',
    };

    return values[key];
};

const LABEL_BY_SCOPE_MAP = {
    [TABS_SCOPE_SELECT_VALUE.ALL]: i18n('value_all-tabs'),
    [TABS_SCOPE_SELECT_VALUE.CURRENT_TAB]: i18n('value_current-tab'),
    [TABS_SCOPE_SELECT_VALUE.AS_GROUP]: i18n('value_as-group'),
    [TABS_SCOPE_SELECT_VALUE.SELECTED_TABS]: i18n('value_selected-tabs'),
};

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

export type TabsScopeSelectProps = {
    groupTabsScope?: TabsScope;
    hasMultipleSelectors?: boolean;
    isGroupSettings?: boolean;
};

export const TabsScopeSelect = ({
    groupTabsScope,
    hasMultipleSelectors,
    isGroupSettings,
}: TabsScopeSelectProps) => {
    const dispatch = useDispatch();
    const selectorDialog = useSelector(selectSelectorDialog);

    const currentTabId = useSelector(selectTabId) as string;
    const tabs = useSelector(selectTabs);
    const selectorsGroup = useSelector(selectSelectorsGroup);

    const [selectedTabs, setSelectedTabs] = React.useState<string[]>(
        getInitialSelectedTabs({
            selectorTabsScope: selectorDialog.tabsScope,
            isGroupSettings,
            groupTabsScope,
            currentTabId,
        }),
    );

    const tabsOptions = React.useMemo(() => {
        return tabs.map((tab) => ({
            value: tab.id,
            content: tab.title,
            disabled: tab.id === currentTabId,
        }));
    }, [tabs, currentTabId]);

    const currentTabsScope = getTabsScopeByValue({
        selectorTabsScope: isGroupSettings ? groupTabsScope : selectorDialog.tabsScope,
        hasMultipleSelectors,
    });

    // Create options based on whether there are multiple selectors
    const tabsScopeOptions: SelectOption<{icon?: JSX.Element}>[] = React.useMemo(() => {
        const currentTab = tabs.find((tab) => tab.id === currentTabId);
        const currentTabTitle = currentTab?.title || '';

        const baseOptions = [
            {
                value: TABS_SCOPE_SELECT_VALUE.CURRENT_TAB,
                content: (
                    <Flex gap={2} className={b('current-tab')}>
                        <span>{LABEL_BY_SCOPE_MAP[TABS_SCOPE_SELECT_VALUE.CURRENT_TAB]}</span>
                        {currentTabTitle && (
                            <span className={b('tab-hint')}>{currentTabTitle}</span>
                        )}
                    </Flex>
                ),
            },
            {
                value: TABS_SCOPE_SELECT_VALUE.ALL,
                content: LABEL_BY_SCOPE_MAP[TABS_SCOPE_SELECT_VALUE.ALL],
                data: {icon: getIconByTabsScope(TABS_SCOPE_SELECT_VALUE.ALL)},
            },
            {
                value: TABS_SCOPE_SELECT_VALUE.SELECTED_TABS,
                content: LABEL_BY_SCOPE_MAP[TABS_SCOPE_SELECT_VALUE.SELECTED_TABS],
                data: {
                    icon: getIconByTabsScope(TABS_SCOPE_SELECT_VALUE.SELECTED_TABS),
                },
            },
        ];

        if (hasMultipleSelectors && !isGroupSettings) {
            const groupTabsScopeItem = getTabsScopeByValue({
                selectorTabsScope: groupTabsScope,
            });

            return [
                {
                    value: TABS_SCOPE_SELECT_VALUE.AS_GROUP,
                    content: (
                        <Flex gap={2} className={b('as-group')}>
                            <span>Как в группе</span>
                            <span className={b('group-hint')}>
                                {LABEL_BY_SCOPE_MAP[groupTabsScopeItem]}
                            </span>
                        </Flex>
                    ),
                    data: {
                        icon: getIconByTabsScope(groupTabsScopeItem),
                    },
                },
                ...baseOptions,
            ];
        }

        return baseOptions;
    }, [groupTabsScope, hasMultipleSelectors, isGroupSettings, tabs, currentTabId]);

    const updateSelectorsState = React.useCallback(
        (tabsScope: TabsScope) => {
            dispatch(
                isGroupSettings
                    ? updateSelectorsGroup({
                          ...selectorsGroup,
                          tabsScope,
                      })
                    : setSelectorDialogItem({
                          tabsScope,
                      }),
            );
        },
        [dispatch, isGroupSettings, selectorsGroup],
    );

    const handleTabsScopeChange = React.useCallback(
        (value: string[]) => {
            const newTabsScope = value[0];

            updateSelectorsState(
                getTabsScopeValueByName({
                    name: newTabsScope,
                    currentTabId,
                    selectedTabs,
                }),
            );
        },
        [currentTabId, selectedTabs, updateSelectorsState],
    );

    const handleSelectedTabsChange = React.useCallback(
        (value: string[]) => {
            // Always ensure current tab is included and can't be removed
            // TODO: change logic
            const newSelectedTabs = value.includes(currentTabId) ? value : [...value, currentTabId];
            setSelectedTabs(newSelectedTabs);
            updateSelectorsState(newSelectedTabs);
        },
        [currentTabId, updateSelectorsState],
    );

    const showTabsSelector = currentTabsScope === TABS_SCOPE_SELECT_VALUE.SELECTED_TABS;

    if (!currentTabId || !isEnabledFeature(Feature.EnableGlobalSelectors)) {
        return null;
    }

    const hasClear =
        currentTabsScope !== TABS_SCOPE_SELECT_VALUE.CURRENT_TAB &&
        currentTabsScope !== TABS_SCOPE_SELECT_VALUE.AS_GROUP;

    return (
        <React.Fragment>
            <FormRow label={i18n('label_tabs-scope')}>
                <Flex direction="column" gap={2}>
                    <Select
                        value={[currentTabsScope]}
                        onUpdate={handleTabsScopeChange}
                        width="max"
                        options={tabsScopeOptions}
                        renderOption={renderOptions}
                        renderSelectedOption={renderOptions}
                        hasClear={hasClear}
                    />

                    {showTabsSelector && (
                        <Select
                            value={selectedTabs}
                            onUpdate={handleSelectedTabsChange}
                            width="max"
                            multiple
                            options={tabsOptions}
                            placeholder={i18n('label_selecteed-tabs-placeholder')}
                        />
                    )}
                </Flex>
            </FormRow>
        </React.Fragment>
    );
};
