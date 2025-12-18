import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {SelectOption, SelectProps} from '@gravity-ui/uikit';
import {Flex, Select} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
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

import {CurrentTabOption} from './CurrentTabOption/CurrentTabOption';
import {SelectedTabsOption} from './SelectedTabsOption/SelectedTabsOption';
import {IMPACT_TYPE_OPTION_VALUE, LABEL_BY_SCOPE_MAP} from './constants';
import {
    getIconByImpactType,
    getImpactTypeByValue,
    getImpactTypeValidation,
    getInitialImpactTabsIds,
} from './helpers';
import {useTabVisibilityValidation} from './useTabVisibilityValidation';

import './ImpactTypeSelect.scss';

const b = block('impact-type-select');

const i18n = I18n.keyset('dash.control-dialog.edit');

const renderOptions = (option: SelectOption) => <SelectOptionWithIcon option={option} />;

export type ImpactTypeSelectProps = {
    groupImpactType?: ImpactType;
    groupImpactTabsIds?: ImpactTabsIds;
    hasMultipleSelectors?: boolean;
    isGroupSettings?: boolean;
    selectorWidth?: SelectProps['width'];
    className?: string;
};

export const ImpactTypeSelect = ({
    groupImpactType,
    groupImpactTabsIds,
    hasMultipleSelectors,
    isGroupSettings,
    selectorWidth = 'max',
    className,
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
        hasMultipleSelectors,
        isGroupSettings,
        currentTabId,
        impactTabsIds,
        selectorsGroup,
        selectorDialog,
    });

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
        const allTabsOption = {
            value: IMPACT_TYPE_OPTION_VALUE.ALL_TABS,
            content: LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.ALL_TABS],
            data: {icon: getIconByImpactType(IMPACT_TYPE_OPTION_VALUE.ALL_TABS)},
        };

        const needDisableIncorrectOptions =
            hasMultipleSelectors && !isGroupSettings && isGroupControl;

        const isSelectedTabsDisabled =
            needDisableIncorrectOptions &&
            selectorsGroup.impactType !== 'selectedTabs' &&
            selectorsGroup.impactType !== 'allTabs';

        const baseOptions: SelectOption<{icon?: JSX.Element}>[] = [
            {
                value: IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB,
                content: (
                    <CurrentTabOption
                        tabs={tabs}
                        currentImpactType={currentImpactType}
                        currentTabTitle={currentTab?.title}
                        impactTabsIds={impactTabsIds}
                    />
                ),
            },
            {
                value: IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS,
                content: <SelectedTabsOption isSelectedTabsDisabled={isSelectedTabsDisabled} />,
                data: {
                    icon: getIconByImpactType(IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS),
                },
                disabled: isSelectedTabsDisabled,
            },
        ];

        if (!hasMultipleSelectors || isGroupSettings) {
            baseOptions.push(allTabsOption);
        }

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
        tabs,
        currentImpactType,
        currentTab?.title,
        impactTabsIds,
        hasMultipleSelectors,
        isGroupSettings,
        isGroupControl,
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
                !selectorsGroup.validation.currentTabVisibility &&
                !selectorDialog.validation.currentTabVisibility
            ) {
                return;
            }

            if (updatedImpactType === 'allTabs' || updatedImpactTabsIds?.includes(currentTabId)) {
                dispatch(
                    updateControlsValidation({
                        groupValidation: {
                            currentTabVisibility: undefined,
                        },
                        itemsValidation: {
                            currentTabVisibility: undefined,
                        },
                    }),
                );
            }
        },
        [
            currentTabId,
            dispatch,
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
        <FormRow label={i18n('label_tabs-scope')} className={className}>
            <Flex direction="column" gap={2}>
                <FieldWrapper error={impactTypeValidation}>
                    <Select
                        value={[currentImpactType]}
                        onUpdate={handleImpactTypeChange}
                        width={selectorWidth}
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
                            width={selectorWidth}
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
