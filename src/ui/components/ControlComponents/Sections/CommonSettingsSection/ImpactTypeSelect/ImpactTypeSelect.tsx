import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption} from '@gravity-ui/uikit';
import {Flex, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {DashTabItemType, Feature} from 'shared';
import type {ImpactTabsIds, ImpactType} from 'shared/types/dash';
import {FieldWrapper} from 'ui/components/FieldWrapper/FieldWrapper';
import {SelectOptionWithIcon} from 'ui/components/SelectComponents/components/SelectOptionWithIcon/SelectOptionWithIcon';
import {
    setSelectorDialogItem,
    updateControlsValidation,
    updateSelectorsGroup,
} from 'ui/store/actions/controlDialog/controlDialog';
import {
    selectOpenedDialogType,
    selectSelectorDialog,
    selectSelectorValidation,
    selectSelectorsGroup,
    selectSelectorsGroupValidation,
} from 'ui/store/selectors/controlDialog';
import {
    selectCurrentTab,
    selectTabId,
    selectTabs,
} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {IMPACT_TYPE_OPTION_VALUE} from './constants';
import {
    getIconByImpactType,
    getImpactTypeByValue,
    getImpactTypeValidation,
    getInitialImpactTabsIds,
} from './helpers';
import {useTabVisibilityValidation} from './useTabVisibilityValidation';

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
        'validation_need-current-tab-impact':
            'Должен быть хотя бы один селектор, видимый на текущей вкладке',
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
    onRaiseTabVisibilityProblem?: () => void;
};

export const ImpactTypeSelect = ({
    groupImpactType,
    groupImpactTabsIds,
    hasMultipleSelectors,
    isGroupSettings,
    onRaiseTabVisibilityProblem,
}: ImpactTypeSelectProps) => {
    const dispatch = useDispatch();
    const selectorDialog = useSelector(selectSelectorDialog);

    const currentTabId = useSelector(selectTabId) as string;
    const currentTab = useSelector(selectCurrentTab);
    const tabs = useSelector(selectTabs);
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const openedDialogType = useSelector(selectOpenedDialogType);
    const validation = useSelector(selectSelectorValidation);
    const groupValidation = useSelector(selectSelectorsGroupValidation);

    const isGroupControl = openedDialogType === DashTabItemType.GroupControl;

    const [impactTabsIds, setImpactTabsIds] = React.useState<string[]>(
        getInitialImpactTabsIds({
            isGroupSettings,
            groupImpactTabsIds,
            selectorImpactTabsIds: selectorDialog.impactTabsIds,
        }),
    );

    const {validateTabVisibility} = useTabVisibilityValidation({
        isGroupControl,
        isGroupSettings,
        currentTabId,
        impactTabsIds,
        selectorsGroup,
        selectorDialog,
        onRaiseTabVisibilityProblem,
    });

    const optionTabTitle = React.useMemo(() => {
        if (impactTabsIds.length !== 1) {
            return currentTab?.title || '';
        }

        const optionTab = tabs.find((tab) => tab.id === impactTabsIds[0]);
        const currentTabTitle = optionTab?.title || '';

        return currentTabTitle;
    }, [currentTab?.title, impactTabsIds, tabs]);

    const tabsOptions = React.useMemo(() => {
        return tabs.map((tab) => ({
            value: tab.id,
            content: tab.title,
        }));
    }, [tabs]);

    const currentImpactType = getImpactTypeByValue({
        selectorImpactType: isGroupSettings ? groupImpactType : selectorDialog.impactType,
        hasMultipleSelectors,
    });

    // Create options based on whether there are multiple selectors
    // GroupItem impact value is disabled if it does not narrow down or does not match the group setting
    const tabsScopeOptions: SelectOption<{icon?: JSX.Element}>[] = React.useMemo(() => {
        const needDisableIncorrectOptions =
            hasMultipleSelectors && !isGroupSettings && isGroupControl;
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
                disabled: needDisableIncorrectOptions && selectorsGroup.impactType !== 'allTabs',
            },
            {
                value: IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS,
                content: LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS],
                data: {
                    icon: getIconByImpactType(IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS),
                },
                disabled:
                    needDisableIncorrectOptions &&
                    selectorsGroup.impactType !== 'selectedTabs' &&
                    selectorsGroup.impactType !== 'allTabs',
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
    }, [
        hasMultipleSelectors,
        isGroupSettings,
        isGroupControl,
        optionTabTitle,
        selectorsGroup.impactType,
        groupImpactType,
    ]);

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

    const onChangeImpact = React.useCallback(
        ({
            updatedImpactType,
            updatedImpactTabsIds,
        }: {
            updatedImpactType?: ImpactType;
            updatedImpactTabsIds?: string[] | null;
        }) => {
            if (
                !isGroupControl ||
                (!selectorsGroup.validation.currentTabVisibility &&
                    !selectorDialog.validation.currentTabVisibility)
            ) {
                return;
            }

            if (updatedImpactType === 'allTabs' || updatedImpactTabsIds?.includes(currentTabId)) {
                dispatch(
                    updateControlsValidation({
                        groupValidation: {
                            currentTabVisibility: undefined,
                        },
                        itemsValidation: isGroupSettings
                            ? undefined
                            : {
                                  currentTabVisibility: undefined,
                              },
                    }),
                );
            }
        },
        [
            currentTabId,
            dispatch,
            isGroupControl,
            isGroupSettings,
            selectorDialog.validation.currentTabVisibility,
            selectorsGroup.validation.currentTabVisibility,
        ],
    );

    const handleImpactTypeChange = React.useCallback(
        (value: string[]) => {
            const impactTypeValue = value[0] as ImpactType;

            let newImpactTabsIds = null;
            if (impactTypeValue === IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS) {
                // When switching to selected tabs, ensure current tab is included
                newImpactTabsIds = impactTabsIds.includes(currentTabId)
                    ? impactTabsIds
                    : [...impactTabsIds, currentTabId];
                setImpactTabsIds(newImpactTabsIds);
            } else if (impactTypeValue === IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB) {
                // When switching to current tab, set impactTabsIds to current tab
                newImpactTabsIds = [currentTabId];
                setImpactTabsIds(newImpactTabsIds);
            }

            updateSelectorsState(impactTypeValue, newImpactTabsIds);
            onChangeImpact({
                updatedImpactType: impactTypeValue,
                updatedImpactTabsIds: newImpactTabsIds,
            });
        },
        [currentTabId, impactTabsIds, onChangeImpact, updateSelectorsState],
    );

    const handleImpactTabsIdsChange = React.useCallback(
        (value: string[]) => {
            setImpactTabsIds(value);
            updateSelectorsState(IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS, value);

            validateTabVisibility(value);

            onChangeImpact({
                updatedImpactTabsIds: value,
            });
        },
        [onChangeImpact, updateSelectorsState, validateTabVisibility],
    );

    if (!currentTabId || !isEnabledFeature(Feature.EnableGlobalSelectors)) {
        return null;
    }

    const showTabsSelector = currentImpactType === IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS;

    const impactTypeValidation = getImpactTypeValidation({
        impactType: currentImpactType,
        isGroupControl,
        isGroupSettings,
        validation,
    });
    const impactTabsIdsValidation = isGroupSettings
        ? groupValidation.currentTabVisibility || groupValidation.impactTabsIds
        : validation.currentTabVisibility || validation.impactTabsIds;

    return (
        <FormRow label={i18n('label_tabs-scope')}>
            <Flex direction="column" gap={2}>
                <FieldWrapper error={impactTypeValidation}>
                    <Select
                        value={[currentImpactType]}
                        onUpdate={handleImpactTypeChange}
                        width="max"
                        options={tabsScopeOptions}
                        renderOption={renderOptions}
                        renderSelectedOption={renderOptions}
                        validationState={impactTypeValidation ? 'invalid' : undefined}
                    />
                </FieldWrapper>

                {showTabsSelector && (
                    <FieldWrapper error={impactTabsIdsValidation}>
                        <Select
                            value={impactTabsIds}
                            onUpdate={handleImpactTabsIdsChange}
                            width="max"
                            multiple
                            options={tabsOptions}
                            placeholder={i18n('label_selected-tabs-placeholder')}
                            validationState={impactTabsIdsValidation ? 'invalid' : undefined}
                        />
                    </FieldWrapper>
                )}
            </Flex>
        </FormRow>
    );
};
