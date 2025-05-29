import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {ActionTooltip, Button, HelpMark, Icon, Select} from '@gravity-ui/uikit';
import type {SelectRenderControl} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DatasetActionQA, Feature, RAW_SQL_LEVEL} from 'shared';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {toggleLoadPreviewByDefault, toggletTemplateEnabled} from '../../store/actions/creators';
import {
    isDatasetRevisionMismatchSelector,
    isLoadPreviewByDefaultSelector,
    isLoadingDatasetSelector,
    isSavingDatasetDisabledSelector,
    isSavingDatasetSelector,
    rawSqlLevelSelector,
    templateEnabledSelector,
} from '../../store/selectors';

import {ACTION_PANEL_ICON_SIZE} from './constants';
import {useHistoryActions} from './useHistoryActions';

const b = block('dataset');
const i18n = I18n.keyset('dataset.dataset-editor.modify');
const ITEM_SHOW_PREVIEW_BY_DEFAULT = 'showPreviewByDefault';
const ITEM_TEMPLATE_ENABLED = 'templateEnabled';
const RAW_SQL_LEVELS_ALLOW_TEMPLATING: string[] = [RAW_SQL_LEVEL.TEMPLATE, RAW_SQL_LEVEL.DASHSQL];

type Props = {
    isCreationProcess?: boolean;
    onClickCreateWidgetButton: () => void;
    onClickSaveDatasetButton: () => void;
};

export function ActionPanelRightItems(props: Props) {
    const {isCreationProcess, onClickCreateWidgetButton, onClickSaveDatasetButton} = props;
    const dispatch = useDispatch();
    const isDatasetRevisionMismatch = useSelector(isDatasetRevisionMismatchSelector);
    const isLoadPreviewByDefault = useSelector(isLoadPreviewByDefaultSelector);
    const isLoadingDataset = useSelector(isLoadingDatasetSelector);
    const isSavingDatasetDisabled = useSelector(isSavingDatasetDisabledSelector);
    const isSavingDataset = useSelector(isSavingDatasetSelector);
    const templateEnabled = useSelector(templateEnabledSelector);
    const rawSqlLevel = useSelector(rawSqlLevelSelector);
    const historyActions = useHistoryActions();
    const isTemplateParamsFeatureEnabled = isEnabledFeature(Feature.EnableDsTemplateParams);
    const isSaveButtonDisabled = isSavingDatasetDisabled || isDatasetRevisionMismatch;
    const isRawSqlLevelEnableTemplating = RAW_SQL_LEVELS_ALLOW_TEMPLATING.includes(rawSqlLevel);
    const settingsValue = React.useMemo(() => {
        const nextValue: string[] = [];

        if (isLoadPreviewByDefault) {
            nextValue.push(ITEM_SHOW_PREVIEW_BY_DEFAULT);
        }

        if (templateEnabled && isRawSqlLevelEnableTemplating) {
            nextValue.push(ITEM_TEMPLATE_ENABLED);
        }

        return nextValue;
    }, [isLoadPreviewByDefault, templateEnabled, isRawSqlLevelEnableTemplating]);

    const {AdditionalDatasetActions} = registry.datasets.components.getAll();

    const handleUpdateSettings = React.useCallback(
        (value: string[]) => {
            const nextIsLoadPreviewByDefault = value.includes(ITEM_SHOW_PREVIEW_BY_DEFAULT);
            const nextTemplateEnabled = value.includes(ITEM_TEMPLATE_ENABLED);

            if (isLoadPreviewByDefault !== nextIsLoadPreviewByDefault) {
                dispatch(toggleLoadPreviewByDefault(nextIsLoadPreviewByDefault));
            }

            if (templateEnabled !== nextTemplateEnabled) {
                dispatch(toggletTemplateEnabled(nextTemplateEnabled));
            }
        },
        [dispatch, isLoadPreviewByDefault, templateEnabled],
    );

    const renderSelectControl: SelectRenderControl = React.useCallback((args) => {
        const {ref, triggerProps} = args;

        return (
            <Button
                ref={ref}
                view="flat"
                extraProps={{onKeyDown: triggerProps.onKeyDown}}
                {...triggerProps}
            >
                <Icon data={Gear} size={ACTION_PANEL_ICON_SIZE} />
            </Button>
        );
    }, []);

    const settingsSelectOptions = [
        <Select.Option
            key={ITEM_SHOW_PREVIEW_BY_DEFAULT}
            value={ITEM_SHOW_PREVIEW_BY_DEFAULT}
            disabled={isLoadingDataset}
        >
            {i18n('label_load_preview_by_default')}
        </Select.Option>,
    ];

    if (isTemplateParamsFeatureEnabled) {
        const optionContent = (
            <div style={{display: 'flex', height: '100%'}}>
                {i18n('label_enable-templating')}
                <HelpMark className={b('settings-templating-hint')}>
                    {i18n('label_enable-templating-hint')}
                </HelpMark>
            </div>
        );
        settingsSelectOptions.push(
            <Select.Option
                key={ITEM_TEMPLATE_ENABLED}
                value={ITEM_TEMPLATE_ENABLED}
                disabled={isLoadingDataset || !isRawSqlLevelEnableTemplating}
            >
                {isRawSqlLevelEnableTemplating ? (
                    optionContent
                ) : (
                    <ActionTooltip
                        className={b('settings-templating-disable-hint')}
                        title={i18n('label_enable-templating-disabled-hint')}
                        placement="left"
                    >
                        {optionContent}
                    </ActionTooltip>
                )}
            </Select.Option>,
        );
    }

    return (
        <div className={b('actions-panel-right-items')}>
            {historyActions}
            <Select
                value={settingsValue}
                multiple={true}
                onUpdate={handleUpdateSettings}
                popupPlacement={'bottom-end'}
                renderControl={renderSelectControl}
            >
                {settingsSelectOptions}
            </Select>
            <AdditionalDatasetActions />
            <Button
                view="normal"
                size="m"
                disabled={isCreationProcess}
                onClick={onClickCreateWidgetButton}
            >
                {i18n('button_create-widget')}
            </Button>
            <Button
                qa={DatasetActionQA.CreateButton}
                view="action"
                size="m"
                loading={isSavingDataset}
                disabled={isSaveButtonDisabled}
                onClick={onClickSaveDatasetButton}
            >
                {i18n('button_save')}
            </Button>
        </div>
    );
}
