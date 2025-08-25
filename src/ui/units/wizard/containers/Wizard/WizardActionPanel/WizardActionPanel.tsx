import React from 'react';

import type {DropdownMenuProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {ClientChartsConfigWithDataset, WizardType} from 'shared';
import {EntryUpdateMode, Feature} from 'shared';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import {selectIsChartSaved} from 'units/wizard/selectors/preview';

import type {DatalensGlobalState} from '../../../../../';
import {ActionPanel} from '../../../../../';
import {ChartSaveControls} from '../../../../../components/ActionPanel/components/ChartSaveControls/ChartSaveControl';
import {registry} from '../../../../../registry';
import {selectCanGoBack, selectCanGoForward} from '../../../../../store/selectors/editHistory';
import {setEditMode} from '../../../../dash/store/actions/base/actions';
import {toggleViewOnlyMode} from '../../../actions/settings';
import type {WidgetData} from '../../../actions/widget';
import {WIZARD_EDIT_HISTORY_UNIT_ID} from '../../../constants';
import {selectIsFullscreen, selectViewOnlyMode} from '../../../selectors/settings';

import {useWizardActionPanel} from './useWizardActionPanel';

import './WizardActionPanel.scss';

const b = block('wizard-action-panel');

export interface WizardActionPanelProps {
    entry: WidgetData;
    configType: WizardType | undefined;
    config: {shared: ClientChartsConfigWithDataset} | undefined;
    onSaveCallback: (mode: EntryUpdateMode) => void;
    onNoRightsDialogCallback: () => void;
    onSetActualVersionCallback: () => void;
    dropdownItems: DropdownMenuProps<() => void>['items'];
    onSaveAsNewClick: () => void;
    onSaveAsDraftClick: () => void;
    onSaveAndPublishClick: () => void;
}
export const WizardActionPanel: React.FC<WizardActionPanelProps> = (
    props: WizardActionPanelProps,
) => {
    const {
        dropdownItems,
        entry,
        config,
        configType,
        onNoRightsDialogCallback,
        onSaveCallback,
        onSetActualVersionCallback,
        onSaveAsNewClick,
        onSaveAndPublishClick,
        onSaveAsDraftClick,
    } = props;

    const dispatch = useDispatch();

    const [editButtonLoading, setEditButtonLoading] = React.useState(false);

    const isChartSaved = useSelector(selectIsChartSaved);
    const isViewOnlyMode = useSelector(selectViewOnlyMode);
    const isFullscreen = useSelector(selectIsFullscreen);

    const handleEditButtonClick = React.useCallback(() => {
        const successCallback = () => {
            dispatch(toggleViewOnlyMode());
            setEditButtonLoading(false);
        };

        const failCallback = () => {
            setEditButtonLoading(false);
        };

        setEditButtonLoading(true);
        dispatch(setEditMode(successCallback, failCallback)); // logic about setEditMode moved from wizard
    }, [dispatch]);

    const isNewEntryInWorkbook = entry && entry.workbookId && entry.fake;
    const canEdit = !(entry && entry.permissions && entry.permissions.edit === false);
    const saveDisabled = !config || !configType || isChartSaved;
    const saveMoreDisabled = !config || !configType;
    const isCurrentRevisionActual = entry.revId && entry.revId === entry.publishedId;
    const isNewChart = entry.fake;

    const handleSaveCallback = React.useCallback(() => {
        if (isCurrentRevisionActual) {
            onSaveCallback(EntryUpdateMode.Publish);
        } else {
            onSaveCallback(EntryUpdateMode.Save);
        }
    }, [isCurrentRevisionActual, onSaveCallback]);

    const canGoBack = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoBack>>(
        (state) => selectCanGoBack(state, {unitId: WIZARD_EDIT_HISTORY_UNIT_ID}),
    );

    const canGoForward = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoForward>>(
        (state) => selectCanGoForward(state, {unitId: WIZARD_EDIT_HISTORY_UNIT_ID}),
    );

    const additionalButtons = useWizardActionPanel({
        editButtonLoading,
        handleEditButtonClick,
        isViewOnlyMode,
        isFullscreen,
        canGoBack,
        canGoForward,
    });

    const {WizardActionPanelExtension} = registry.wizard.components.getAll();

    const enablePublish = isEnabledFeature(Feature.EnablePublishEntry) && !entry.fake;

    return (
        <ActionPanel
            entry={entry}
            enablePublish={enablePublish}
            rightItems={
                <React.Fragment>
                    <WizardActionPanelExtension />
                    <ChartSaveControls
                        className={b('save-controls')}
                        onClickButtonSave={handleSaveCallback}
                        onOpenNoRightsDialog={onNoRightsDialogCallback}
                        dropdownItems={dropdownItems || []}
                        canEdit={canEdit}
                        isSaveButtonDisabled={!canEdit || saveDisabled}
                        isDropdownDisabled={saveMoreDisabled}
                        isCurrentRevisionActual={isCurrentRevisionActual}
                        hideSaveDropdown={isViewOnlyMode || isNewEntryInWorkbook}
                        hideSaveButton={isViewOnlyMode}
                        additionalControls={additionalButtons}
                        onSaveAndPublishClick={onSaveAndPublishClick}
                        onSaveAsDraftClick={onSaveAsDraftClick}
                        onSaveAsNewClick={onSaveAsNewClick}
                        isNewChart={isNewChart}
                    />
                </React.Fragment>
            }
            setActualVersion={onSetActualVersionCallback}
        />
    );
};

export default WizardActionPanel;
