import React from 'react';

import {Gear} from '@gravity-ui/icons';
import {Button, Icon, Select} from '@gravity-ui/uikit';
import type {SelectRenderControl} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DatasetActionQA} from 'shared';

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
    const historyActions = useHistoryActions();
    const isSaveButtonDisabled = isSavingDatasetDisabled || isDatasetRevisionMismatch;
    const settingsValue = isLoadPreviewByDefault ? [ITEM_SHOW_PREVIEW_BY_DEFAULT] : [];

    const handleUpdateSettings = React.useCallback(
        (value: string[]) => {
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
                <Select.Option value={ITEM_SHOW_PREVIEW_BY_DEFAULT} disabled={isLoadingDataset}>
                    {i18n('label_load_preview_by_default')}
                </Select.Option>
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
