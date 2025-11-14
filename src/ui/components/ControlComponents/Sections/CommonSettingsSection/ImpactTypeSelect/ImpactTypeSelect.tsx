import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Flex, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import type {ImpactType} from 'shared/types/dash';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import {setSelectorDialogItem, updateSelectorsGroup} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog, selectSelectorsGroup} from 'ui/store/selectors/controlDialog';
import {selectTabId, selectTabs} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {ImpactTabsIds} from '../../../../../../shared/types/dash';

import {IMPACT_TYPE_OPTION_VALUE} from './constants';
import {getIconByImpactType, getImpactTypeByValue, getImpactTypeValueByName} from './helpers';

import './ImpactTypeSelect.scss';

const b = block('impact-type-select');

// const i18n = I18n.keyset('dash.control-dialog.edit');

// TODO (global selectors): Add translations
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
    [IMPACT_TYPE_OPTION_VALUE.ALL_TABS]: i18n('value_all-tabs'),
    [IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB]: i18n('value_current-tab'),
    [IMPACT_TYPE_OPTION_VALUE.AS_GROUP]: i18n('value_as-group'),
    [IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS]: i18n('value_selected-tabs'),
};

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

export type ImpactTypeSelectProps = {
    groupImpactType?: ImpactType;
    groupImpactTabsIds?: ImpactTabsIds;
    hasMultipleSelectors?: boolean;
    isGroupSettings?: boolean;
};

const getInitialImpactTabsIds = ({
    isGroupSettings,
    groupImpactTabsIds,
    selectorImpactTabsIds,
}: {
    isGroupSettings?: boolean;
    groupImpactTabsIds?: ImpactTabsIds;
    selectorImpactTabsIds?: ImpactTabsIds;
}) => {
    if (isGroupSettings) {
        return groupImpactTabsIds || [];
    }

    return selectorImpactTabsIds || [];
};

export const ImpactTypeSelect = ({
    groupImpactType,
    groupImpactTabsIds,
    hasMultipleSelectors,
    isGroupSettings,
}: ImpactTypeSelectProps) => {
    const dispatch = useDispatch();
    const selectorDialog = useSelector(selectSelectorDialog);

    const currentTabId = useSelector(selectTabId) as string;
    const tabs = useSelector(selectTabs);
    const selectorsGroup = useSelector(selectSelectorsGroup);

    const [impactTabsIds, setImpactTabsIds] = React.useState<string[]>(
        getInitialImpactTabsIds({
            isGroupSettings,
            groupImpactTabsIds,
            selectorImpactTabsIds: selectorDialog.impactTabsIds,
        }),
    );

    const optionTabTitle = React.useMemo(() => {
        if (impactTabsIds.length !== 1) {
            const currentTab = tabs.find((tab) => tab.id === currentTabId);
            return currentTab?.title || '';
        }

        const optionTab = tabs.find((tab) => tab.id === impactTabsIds[0]);
        const currentTabTitle = optionTab?.title || '';

        return currentTabTitle;
    }, [currentTabId, impactTabsIds, tabs]);

    const tabsOptions = React.useMemo(() => {
        return tabs.map((tab) => ({
            value: tab.id,
            content: tab.title,
            disabled: tab.id === currentTabId,
        }));
    }, [tabs, currentTabId]);

    const currentImpactType = getImpactTypeByValue({
        selectorImpactType: isGroupSettings ? groupImpactType : selectorDialog.impactType,
        hasMultipleSelectors,
    });

    // Create options based on whether there are multiple selectors
    const tabsScopeOptions: SelectOption<{icon?: JSX.Element}>[] = React.useMemo(() => {
        const baseOptions = [
            {
                value: IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB,
                content: (
                    <Flex gap={2} className={b('current-tab')}>
                        <span>{LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB]}</span>
                        {optionTabTitle && <span className={b('tab-hint')}>{optionTabTitle}</span>}
                    </Flex>
                ),
            },
            {
                value: IMPACT_TYPE_OPTION_VALUE.ALL_TABS,
                content: LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.ALL_TABS],
                data: {icon: getIconByImpactType(IMPACT_TYPE_OPTION_VALUE.ALL_TABS)},
            },
            {
                value: IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS,
                content: LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS],
                data: {
                    icon: getIconByImpactType(IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS),
                },
            },
        ];

        if (hasMultipleSelectors && !isGroupSettings) {
            const groupImpactTypeItem = getImpactTypeByValue({
                selectorImpactType: groupImpactType,
            });

            return [
                {
                    value: IMPACT_TYPE_OPTION_VALUE.AS_GROUP,
                    content: (
                        <Flex gap={2} className={b('as-group')}>
                            <span>{i18n('value_as-group')}</span>
                            <span className={b('group-hint')}>
                                {LABEL_BY_SCOPE_MAP[groupImpactTypeItem]}
                            </span>
                        </Flex>
                    ),
                    data: {
                        icon: getIconByImpactType(groupImpactTypeItem),
                    },
                },
                ...baseOptions,
            ];
        }

        return baseOptions;
    }, [optionTabTitle, hasMultipleSelectors, isGroupSettings, groupImpactType]);

    const updateSelectorsState = React.useCallback(
        (impactType: ImpactType, newImpactTabsIds?: string[] | null) => {
            dispatch(
                isGroupSettings
                    ? updateSelectorsGroup({
                          ...selectorsGroup,
                          impactType,
                          impactTabsIds: newImpactTabsIds,
                      })
                    : setSelectorDialogItem({
                          impactType,
                          impactTabsIds: newImpactTabsIds,
                      }),
            );
        },
        [dispatch, isGroupSettings, selectorsGroup],
    );

    const handleImpactTypeChange = React.useCallback(
        (value: string[]) => {
            const newImpactType = value[0];
            const tabsScopeValue = getImpactTypeValueByName({name: newImpactType});

            let newImpactTabsIds = null;
            if (tabsScopeValue === 'selectedTabs') {
                // When switching to selected tabs, ensure current tab is included
                newImpactTabsIds = impactTabsIds.includes(currentTabId)
                    ? impactTabsIds
                    : [...impactTabsIds, currentTabId];
                setImpactTabsIds(newImpactTabsIds);
            } else if (tabsScopeValue === 'currentTab') {
                // When switching to current tab, set impactTabsIds to current tab
                newImpactTabsIds = [currentTabId];
                setImpactTabsIds(newImpactTabsIds);
            }

            updateSelectorsState(tabsScopeValue, newImpactTabsIds);
        },
        [currentTabId, impactTabsIds, updateSelectorsState],
    );

    const handleImpactTabsIdsChange = React.useCallback(
        (value: string[]) => {
            // TODO (global selectors): Add validation instead of disable current tab
            const newImpactTabsIds = value.includes(currentTabId)
                ? value
                : [...value, currentTabId];
            setImpactTabsIds(newImpactTabsIds);
            updateSelectorsState('selectedTabs', newImpactTabsIds);
        },
        [currentTabId, updateSelectorsState],
    );

    const showTabsSelector = currentImpactType === 'selectedTabs';

    if (!currentTabId || !isEnabledFeature(Feature.EnableGlobalSelectors)) {
        return null;
    }

    const hasClear = currentImpactType !== 'currentTab' && currentImpactType !== 'asGroup';

    return (
        <React.Fragment>
            <FormRow label={i18n('label_tabs-scope')}>
                <Flex direction="column" gap={2}>
                    <Select
                        value={[currentImpactType]}
                        onUpdate={handleImpactTypeChange}
                        width="max"
                        options={tabsScopeOptions}
                        renderOption={renderOptions}
                        renderSelectedOption={renderOptions}
                        hasClear={hasClear}
                    />

                    {showTabsSelector && (
                        <Select
                            value={impactTabsIds}
                            onUpdate={handleImpactTabsIdsChange}
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
