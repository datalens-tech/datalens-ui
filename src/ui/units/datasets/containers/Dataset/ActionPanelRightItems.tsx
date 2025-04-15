import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {ActionTooltip, Button, HelpMark, Icon, Select} from '@gravity-ui/uikit';
import type {SelectRenderControl} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DatasetActionQA, Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {toggleLoadPreviewByDefault} from '../../store/actions/creators';
import {
    isDatasetRevisionMismatchSelector,
    isLoadPreviewByDefaultSelector,
    isLoadingDatasetSelector,
    isSavingDatasetDisabledSelector,
    isSavingDatasetSelector,
} from '../../store/selectors';

import {ACTION_PANEL_ICON_SIZE} from './constants';
import {useHistoryActions} from './useHistoryActions';

const b = block('dataset');
const i18n = I18n.keyset('dataset.dataset-editor.modify');
const ITEM_SHOW_PREVIEW_BY_DEFAULT = 'showPreviewByDefault';
const ITEM_ENABLE_TEMPLATING = 'enableTemplating';

type Props = {
    isCreationProcess?: boolean;
    isTemplatingEnabled?: boolean;
    onClickCreateWidgetButton: () => void;
    onClickSaveDatasetButton: () => void;
};

export function ActionPanelRightItems(props: Props) {
    const {
        isCreationProcess,
        // TODO: remove default after BI-6211
        isTemplatingEnabled = true,
        onClickCreateWidgetButton,
        onClickSaveDatasetButton,
    } = props;
    const dispatch = useDispatch();
    const isDatasetRevisionMismatch = useSelector(isDatasetRevisionMismatchSelector);
    const isLoadPreviewByDefault = useSelector(isLoadPreviewByDefaultSelector);
    const isLoadingDataset = useSelector(isLoadingDatasetSelector);
    const isSavingDatasetDisabled = useSelector(isSavingDatasetDisabledSelector);
    const isSavingDataset = useSelector(isSavingDatasetSelector);
    const historyActions = useHistoryActions();
    const isTemplateParamsFeatureEnabled = isEnabledFeature(Feature.EnableDsTemplateParams);
    const isSaveButtonDisabled = isSavingDatasetDisabled || isDatasetRevisionMismatch;
    const settingsValue = React.useMemo(() => {
        const nextValue: string[] = [];

        if (isLoadPreviewByDefault) {
            nextValue.push(ITEM_SHOW_PREVIEW_BY_DEFAULT);
        }

        return nextValue;
    }, [isLoadPreviewByDefault]);

    const handleUpdateSettings = React.useCallback(
        (value: string[]) => {
            // TODO: add updating ITEM_ENABLE_TEMPLATING option after BI-6211
            dispatch(toggleLoadPreviewByDefault(value.includes(ITEM_SHOW_PREVIEW_BY_DEFAULT)));
        },
        [dispatch],
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
                key={ITEM_ENABLE_TEMPLATING}
                value={ITEM_ENABLE_TEMPLATING}
                disabled={isLoadingDataset || !isTemplatingEnabled}
            >
                {isTemplatingEnabled ? (
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
